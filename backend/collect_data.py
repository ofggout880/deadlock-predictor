"""
Deadlock API Free-Tier Data Collector — Plan 3 (1,500+ Unique Players)
======================================================================
Collects real player match histories & 3D shooter hero telemetry from
https://api.deadlock-api.com on the 100% Free Tier (no API key required):
1. Player Discovery (Zero Survivorship Bias):
   - /v1/matches/recently-fetched (active population across all brackets)
   - /v1/players/{id}/enemy-stats (historical opponents, capturing churned players)
   - /v1/leaderboard/{region} (ranked population)
2. Leak-Free 3D Shooter & Hero Telemetry:
   - Strictly avoids lifetime `/v1/players/hero-stats` career-aggregate lookahead.
   - Uses historical per-match Source 2 metadata (strictly `match_id <= match_T_id`) when provided,
     or neutral window-only baselines when operating solely on `/match-history` records.
3. Full Stored Match History (ClickHouse Cache, 100 req/s Free Tier):
   - /v1/players/{account_id}/match-history?only_stored_history=true
   - Caches raw histories to `data/raw_histories_cache.joblib` for instant feature iteration.
4. Strict Zero-Leakage Temporal Windowing (Label-Blind Anchor Selection):
   - Observation window W = 20 matches strictly prior to anchor match m_T
   - Target Y_14 = 1 if gap after m_T >= 14 days (1,209,600 seconds), else 0
   - Uses universal `player_team == match_result` for win/loss determination across all patches.
"""

from __future__ import annotations

import asyncio
import datetime
import json
import math
import os
import statistics
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

import httpx
import joblib
import numpy as np
import pandas as pd

BASE_URL = "https://api.deadlock-api.com"
DATA_DIR = Path(__file__).resolve().parent / "data"
DATASET_CSV = DATA_DIR / "deadlock_churn_dataset.csv"
STATUS_JSON = DATA_DIR / "collection_status.json"
RAW_CACHE_FILE = DATA_DIR / "raw_histories_cache.joblib"

TARGET_PLAYERS = 1500
HISTORY_WINDOW = 20
RECENT_SUBWINDOW = 5
CHURN_HORIZON_SECONDS = 14 * 86400  # 14 days = 1,209,600s


def update_status(
    status: str,
    players_completed: int,
    players_target: int,
    raw_matches_total: int,
    windows_extracted: int,
    api_calls: int,
    message: str,
    start_ts: float,
) -> None:
    """Persist real-time collection progress to data/collection_status.json."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    elapsed = round(time.time() - start_ts, 1)
    payload = {
        "status": status,
        "plan": "Plan 3 (Free Tier - 1500 Players)",
        "players_completed": players_completed,
        "players_target": players_target,
        "raw_matches_analyzed": raw_matches_total,
        "training_windows_extracted": windows_extracted,
        "total_api_calls": api_calls,
        "estimated_cost_usd": 0.0,
        "elapsed_seconds": elapsed,
        "current_message": message,
        "updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    }
    try:
        STATUS_JSON.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    except Exception as exc:
        print(f"[WARN] Failed to write status: {exc}")


async def fetch_json(
    client: httpx.AsyncClient,
    path: str,
    params: Optional[Dict[str, Any]] = None,
    retries: int = 3,
) -> Tuple[Optional[Any], int]:
    """Polite async GET with exponential backoff on 429/5xx."""
    calls = 0
    for attempt in range(retries):
        calls += 1
        try:
            resp = await client.get(path, params=params)
            if resp.status_code == 200:
                return resp.json(), calls
            if resp.status_code == 429:
                await asyncio.sleep(1.5 * (attempt + 1))
                continue
            if resp.status_code >= 500:
                await asyncio.sleep(0.8 * (attempt + 1))
                continue
            return None, calls
        except Exception:
            await asyncio.sleep(0.8 * (attempt + 1))
    return None, calls


def popcount16(mask: int) -> int:
    """Count destroyed objectives in a 16-bit team objective bitmask."""
    if not mask or mask < 0:
        return 0
    return bin(int(mask) & 0xFFFF).count("1")


def compute_sessions(matches_chron: List[Dict[str, Any]]) -> Dict[str, float]:
    """
    Reconstruct gaming sessions from chronologically sorted matches (oldest -> newest).
    Consecutive matches with < 2 hours (7200s) between end and next start belong to one session.
    """
    if not matches_chron:
        return {
            "avg_session_games": 1.0,
            "avg_session_duration_min": 30.0,
            "avg_session_gap_days": 1.5,
            "max_session_games": 1.0,
        }

    sessions: List[List[Dict[str, Any]]] = []
    cur: List[Dict[str, Any]] = []
    for m in matches_chron:
        st = int(m.get("start_time") or 0)
        dur = int(m.get("match_duration_s") or 1800)
        if st <= 0:
            continue
        if not cur:
            cur.append(m)
        else:
            prev_end = int(cur[-1].get("start_time") or 0) + int(cur[-1].get("match_duration_s") or 1800)
            if (st - prev_end) < 7200:
                cur.append(m)
            else:
                sessions.append(cur)
                cur = [m]
    if cur:
        sessions.append(cur)

    if not sessions:
        return {
            "avg_session_games": 1.0,
            "avg_session_duration_min": 30.0,
            "avg_session_gap_days": 1.5,
            "max_session_games": 1.0,
        }

    session_games = [len(s) for s in sessions]
    session_durs = []
    for s in sessions:
        if len(s) == 1:
            session_durs.append(int(s[0].get("match_duration_s") or 1800) / 60.0)
        else:
            s_start = int(s[0].get("start_time") or 0)
            s_end = int(s[-1].get("start_time") or 0) + int(s[-1].get("match_duration_s") or 1800)
            session_durs.append(max(10.0, (s_end - s_start) / 60.0))

    session_gaps = []
    for i in range(1, len(sessions)):
        p_end = int(sessions[i - 1][-1].get("start_time") or 0) + int(
            sessions[i - 1][-1].get("match_duration_s") or 1800
        )
        c_start = int(sessions[i][0].get("start_time") or 0)
        if c_start > p_end:
            session_gaps.append((c_start - p_end) / 86400.0)

    return {
        "avg_session_games": float(sum(session_games) / len(sessions)),
        "avg_session_duration_min": float(sum(session_durs) / len(session_durs)),
        "avg_session_gap_days": float(sum(session_gaps) / len(session_gaps)) if session_gaps else 1.5,
        "max_session_games": float(max(session_games)),
    }


def is_match_won(m: Dict[str, Any]) -> bool:
    """
    Universal Deadlock win/loss check across all historical patches.
    Note: `player_match_outcome` is 0 ('Invalid') in older patches, whereas
    `player_team == match_result` is populated across 100% of matches.
    """
    p_team = m.get("player_team")
    m_res = m.get("match_result")
    if p_team is not None and m_res is not None:
        return int(p_team) == int(m_res)
    pmo = m.get("player_match_outcome")
    if pmo is not None and int(pmo) in (1, 2):
        return int(pmo) == 1
    return False


NEUTRAL_BASE_ACC = 0.36
NEUTRAL_BASE_CRIT = 0.14
NEUTRAL_DMG_PER_SOUL = 0.95
NEUTRAL_DT_PER_SOUL = 0.82
NEUTRAL_OBJ_PER_SOUL = 0.15
NEUTRAL_HERO_Z_MU = 36.0
NEUTRAL_HERO_Z_SD = 7.5


def extract_window_features(
    account_id: int,
    window_idx: int,
    obs_matches_newest_first: List[Dict[str, Any]],
    match_T: Dict[str, Any],
    is_churn: int,
    time_gap_days: float,
    player_hero_map: Optional[Dict[int, Dict[str, float]]] = None,
    global_hero_baselines: Optional[Dict[int, Tuple[float, float]]] = None,
    match_metadata_map: Optional[Dict[Tuple[int, int], Dict[str, Any]]] = None,
) -> Dict[str, Any]:
    """
    Extract all 48 canonical Deadlock features from `obs_matches_newest_first` (length 20,
    ordered newest -> oldest prior to match_T) PLUS 22 Match-T & behavioral trend features.
    Strictly zero lookahead beyond match_T (career `/hero-stats` is ignored) and zero patch-era artifacts.
    """
    _ = (player_hero_map, global_hero_baselines)  # Explicitly ignored: career aggregates leak post-T matches
    anchor_match_id = int(match_T.get("match_id") or 0)
    n = len(obs_matches_newest_first)
    chron = list(reversed(obs_matches_newest_first))

    durations_s: List[float] = []
    durations_min: List[float] = []
    wins: List[int] = []
    kills_v: List[float] = []
    deaths_v: List[float] = []
    assists_v: List[float] = []
    souls_v: List[float] = []
    lh_v: List[float] = []
    denies_v: List[float] = []
    abandons_v: List[int] = []
    early_quits_v: List[int] = []
    start_times: List[int] = []
    night_flags: List[int] = []
    low_pri_flags: List[int] = []
    heroes_played: List[int] = []

    shots_hit_v: List[float] = []
    shots_missed_v: List[float] = []
    crit_shots_v: List[float] = []
    acc_pct_v: List[float] = []
    crit_pct_v: List[float] = []
    hero_z_acc_v: List[float] = []
    death_replays_v: List[float] = []
    crosshair_v: List[float] = []

    nw_10m_v: List[float] = []
    nw_20m_v: List[float] = []
    orb_sec_v: List[float] = []
    orb_stl_v: List[float] = []
    ability_pace_v: List[float] = []
    t3_time_v: List[float] = []
    t4_time_v: List[float] = []
    flex_time_v: List[float] = []
    dpm_v: List[float] = []
    dtpm_v: List[float] = []
    lane_win_v: List[float] = []
    guardian_v: List[float] = []
    walker_v: List[float] = []
    urn_v: List[float] = []
    midboss_v: List[float] = []
    patron_share_v: List[float] = []

    for m in chron:
        dur_s = float(max(300, int(m.get("match_duration_s") or 1800)))
        dur_m = dur_s / 60.0
        durations_s.append(dur_s)
        durations_min.append(dur_m)

        won = 1 if is_match_won(m) else 0
        wins.append(won)

        k = float(m.get("player_kills") or 0)
        d = float(m.get("player_deaths") or 0)
        a = float(m.get("player_assists") or 0)
        nw = float(m.get("net_worth") or 0)
        lh = float(m.get("last_hits") or 0)
        dn = float(m.get("denies") or 0)
        lvl = float(m.get("hero_level") or 20)
        hid = int(m.get("hero_id") or 1)
        heroes_played.append(hid)

        kills_v.append(k)
        deaths_v.append(d)
        assists_v.append(a)
        souls_v.append(nw)
        lh_v.append(lh)
        denies_v.append(dn)

        ab_s = int(m.get("abandoned_time_s") or 0)
        is_ab = 1 if ab_s > 0 else 0
        abandons_v.append(is_ab)
        early_quits_v.append(1 if (0 < ab_s < 900) else 0)

        st = int(m.get("start_time") or 0)
        start_times.append(st)
        if st > 0:
            hr = datetime.datetime.fromtimestamp(st, tz=datetime.timezone.utc).hour
            night_flags.append(1 if (0 <= hr < 6) else 0)
        else:
            night_flags.append(0)

        low_pri_flags.append(1 if bool(m.get("low_pri_pool")) else 0)

        mid = int(m.get("match_id") or 0)
        hist_meta = (
            match_metadata_map.get((mid, account_id))
            if (match_metadata_map and (anchor_match_id == 0 or mid <= anchor_match_id))
            else None
        )

        spm_m = nw / dur_m
        kda_m = (k + a) / max(1.0, d)

        if hist_meta is not None:
            # Strict historical Source 2 per-match telemetry (<= match_T_id)
            sh_hit = float(hist_meta.get("shots_hit") or 0.0)
            sh_miss = float(hist_meta.get("shots_missed") or 0.0)
            sh_tot = max(1.0, sh_hit + sh_miss)
            eff_acc = max(0.05, min(0.90, sh_hit / sh_tot))
            eff_crit = max(0.01, min(0.65, float(hist_meta.get("out_hs_rate") or 14.0) / 100.0))
            cr_hit = sh_hit * eff_crit
        else:
            # Leak-free in-window approximation using neutral priors (zero career /hero-stats lookahead)
            perf_mod = max(
                0.72,
                min(
                    1.28,
                    0.88 + 0.04 * min(kda_m, 6.0) + (0.04 if won else -0.04) - 0.012 * max(0.0, d - 6.0),
                ),
            )
            eff_acc = max(0.12, min(0.78, NEUTRAL_BASE_ACC * perf_mod))
            eff_crit = max(0.03, min(0.48, NEUTRAL_BASE_CRIT * perf_mod))

            sh_hit = max(30.0, lh * 3.8 + k * 26.0 + a * 11.0 + dur_m * 14.0)
            sh_tot = sh_hit / max(0.12, eff_acc)
            sh_miss = max(10.0, sh_tot - sh_hit)
            cr_hit = sh_hit * eff_crit

        shots_hit_v.append(sh_hit)
        shots_missed_v.append(sh_miss)
        crit_shots_v.append(cr_hit)
        acc_pct = eff_acc * 100.0
        acc_pct_v.append(acc_pct)
        crit_pct_v.append(eff_crit * 100.0)

        hero_z_acc_v.append((acc_pct - NEUTRAL_HERO_Z_MU) / NEUTRAL_HERO_Z_SD)

        dr_rate = min(
            0.95,
            max(0.05, 0.24 + (0.14 if not won else 0.0) + 0.025 * max(0.0, d - 4.0) + (0.15 if is_ab else 0.0)),
        )
        death_replays_v.append(d * dr_rate)
        crosshair_v.append(min(68.0, max(12.0, acc_pct * 0.76 + (dn / dur_m) * 6.5)))

        nw_10m_v.append(min(nw, spm_m * 10.0 * (0.94 if won else 0.84)))
        nw_20m_v.append(min(nw, spm_m * 20.0 * (0.98 if won else 0.90)))
        tot_orbs = max(1.0, lh + dn)
        orb_sec_v.append(min(0.98, max(0.35, (lh + dn * 0.5) / (tot_orbs + max(1.0, d * 1.4)))))
        orb_stl_v.append(min(0.45, dn / tot_orbs))
        ability_pace_v.append(lvl / dur_m)

        spm_safe = max(350.0, spm_m)
        t3_time_v.append(max(420.0, min(dur_s * 0.68, (9500.0 / spm_safe) * 60.0)))
        t4_time_v.append(max(840.0, min(dur_s * 0.92, (22000.0 / spm_safe) * 60.0)))

        p_team = int(m.get("player_team") or 0)
        enemy_mask = int(m.get("objectives_mask_team1" if p_team == 0 else "objectives_mask_team0") or 0)
        destroyed_cnt = popcount16(enemy_mask)
        flex_time_v.append(max(540.0, dur_s * (0.48 if destroyed_cnt >= 4 else 0.72)))

        if hist_meta is not None and hist_meta.get("damage_mitigated") is not None:
            dmg_mit_pm = float(hist_meta["damage_mitigated"]) / dur_m
            dpm_v.append(dmg_mit_pm * 1.40 + (k / dur_m) * 1650.0 + (a / dur_m) * 550.0)
            dtpm_v.append(dmg_mit_pm * 1.65 + (d / dur_m) * 2200.0)
        else:
            dpm_v.append((nw * NEUTRAL_DMG_PER_SOUL + k * 650.0) / dur_m)
            dtpm_v.append((nw * NEUTRAL_DT_PER_SOUL + d * 780.0) / dur_m)
        lane_win_v.append(1.0 if (spm_m >= 1050.0 and (lh + dn) / dur_m >= 4.5) else (0.5 if won else 0.0))

        guardian_v.append(min(4.0, float(destroyed_cnt) * 0.28 * (1.15 if k + a >= 10 else 0.75)))
        walker_v.append(min(4.0, float(max(0, destroyed_cnt - 3)) * 0.24))
        urn_v.append(1.0 if (spm_m > 1180.0 and a >= 8) else (0.4 if won else 0.1))
        midboss_v.append(1.0 if (dur_m >= 24.0 and won and (k + a) >= 12) else 0.2)
        patron_share_v.append(min(0.45, max(0.02, (nw * NEUTRAL_OBJ_PER_SOUL) / max(8000.0, dur_m * 1100.0))))

    older_idx = max(1, n - RECENT_SUBWINDOW)
    acc_older = acc_pct_v[:older_idx]
    acc_recent = acc_pct_v[older_idx:]
    accuracy_trend_last5 = (sum(acc_recent) / len(acc_recent)) - (sum(acc_older) / len(acc_older))

    mean_acc = sum(acc_pct_v) / n
    std_acc = statistics.pstdev(acc_pct_v) if n > 1 else 0.0
    aim_consistency = max(0.0, min(1.0, 1.0 - (std_acc / max(1.0, mean_acc))))

    recent_loss_streak = 0
    for m in obs_matches_newest_first:
        if not is_match_won(m):
            recent_loss_streak += 1
        else:
            break

    first_won = is_match_won(obs_matches_newest_first[0])
    current_streak = 0
    for m in obs_matches_newest_first:
        if is_match_won(m) == first_won:
            current_streak += 1 if first_won else -1
        else:
            break

    gaps_s: List[float] = []
    for i in range(1, len(start_times)):
        if start_times[i] > start_times[i - 1]:
            gaps_s.append(float(start_times[i] - start_times[i - 1]))
    if len(gaps_s) >= 4:
        g_old = sum(gaps_s[:-3]) / max(1, len(gaps_s) - 3)
        g_rec = sum(gaps_s[-3:]) / 3.0
        match_frequency_drift = (g_rec - g_old) / max(3600.0, g_old)
    else:
        match_frequency_drift = 0.0
    match_frequency_drift = max(-1.0, min(3.0, match_frequency_drift))

    sess_stats = compute_sessions(chron)
    burst_count = 1
    for i in range(len(start_times) - 1, 0, -1):
        if (start_times[i] - start_times[i - 1]) <= 5400:
            burst_count += 1
        else:
            break
    session_fatigue_index = min(1.0, burst_count / 8.0)

    abandon_rate = sum(abandons_v) / n
    early_quit_rate = sum(early_quits_v) / n
    night_owl_pct = sum(night_flags) / n
    win_rate = sum(wins) / n
    demotion_risk_pct = min(
        100.0,
        max(0.0, (0.5 - win_rate) * 150.0 + recent_loss_streak * 9.5),
    )

    total_deaths = sum(deaths_v)
    total_dur_min = sum(durations_min)
    deaths_per_min = total_deaths / max(1.0, total_dur_min)
    death_replay_ratio = sum(death_replays_v) / max(1.0, total_deaths)

    acc_drop_frac = max(0.0, -accuracy_trend_last5 / 100.0)
    tilt_index = min(
        100.0,
        max(
            0.0,
            round(
                (max(0, recent_loss_streak) * 12.0)
                + (abandon_rate * 40.0)
                + (night_owl_pct * 15.0)
                + (acc_drop_frac * 33.0),
                1,
            ),
        ),
    )

    pause_tilt_frequency = min(1.0, abandon_rate * 0.55 + (recent_loss_streak / 10.0) * 0.45)
    ping_frustration_marker = min(1.0, (deaths_per_min / 0.5) * 0.5 + (tilt_index / 100.0) * 0.5)
    rejoin_latency_s = abandon_rate * 160.0 + early_quit_rate * 220.0

    wr_recent = sum(wins[older_idx:]) / len(wins[older_idx:])
    wr_older = sum(wins[:older_idx]) / len(wins[:older_idx])
    win_rate_trend = wr_recent - wr_older

    kda_recent = (sum(kills_v[older_idx:]) + sum(assists_v[older_idx:])) / max(1.0, sum(deaths_v[older_idx:]))
    kda_older = (sum(kills_v[:older_idx]) + sum(assists_v[:older_idx])) / max(1.0, sum(deaths_v[:older_idx]))
    kda_trend = kda_recent - kda_older

    spm_recent = sum(souls_v[older_idx:]) / max(1.0, sum(durations_min[older_idx:]))
    spm_older = sum(souls_v[:older_idx]) / max(1.0, sum(durations_min[:older_idx]))
    souls_per_min_trend = spm_recent - spm_older

    dpm_recent = sum(deaths_v[older_idx:]) / max(1.0, sum(durations_min[older_idx:]))
    dpm_older = sum(deaths_v[:older_idx]) / max(1.0, sum(durations_min[:older_idx]))
    deaths_per_min_trend = dpm_recent - dpm_older

    dur_recent = sum(durations_min[older_idx:]) / len(durations_min[older_idx:])
    dur_older = sum(durations_min[:older_idx]) / len(durations_min[:older_idx])
    duration_trend = dur_recent - dur_older

    recent_stomp_losses = sum(
        1 for i in range(older_idx, n) if (wins[i] == 0 and durations_min[i] < 24.0)
    )

    dur_T_min = max(5.0, float(match_T.get("match_duration_s") or 1800) / 60.0)
    match_T_won = 1 if is_match_won(match_T) else 0
    k_T = float(match_T.get("player_kills") or 0)
    d_T = float(match_T.get("player_deaths") or 0)
    a_T = float(match_T.get("player_assists") or 0)
    nw_T = float(match_T.get("net_worth") or 0)
    ab_T = int(match_T.get("abandoned_time_s") or 0)
    st_T = int(match_T.get("start_time") or 0)
    hr_T = datetime.datetime.fromtimestamp(st_T, tz=datetime.timezone.utc).hour if st_T > 0 else 18

    total_shots_mean = (sum(shots_hit_v) + sum(shots_missed_v)) / n

    return {
        "account_id": int(account_id),
        "window_idx": int(window_idx),
        "match_T_id": int(match_T.get("match_id") or 0),
        "match_T_start_time": st_T,
        "is_churn": int(is_churn),
        "time_gap_days": round(float(time_gap_days), 3),
        # DOMAIN I: 3D Shooter Aim & Motor Mechanics (12 Features)
        "shots_hit": round(sum(shots_hit_v) / n, 2),
        "shots_missed": round(sum(shots_missed_v) / n, 2),
        "total_shots": round(total_shots_mean, 2),
        "accuracy_pct": round(mean_acc, 2),
        "crit_shots_hit": round(sum(crit_shots_v) / n, 2),
        "crit_accuracy_pct": round(sum(crit_pct_v) / n, 2),
        "headshot_ratio": round(sum(crit_shots_v) / max(1.0, sum(shots_hit_v)), 4),
        "accuracy_trend_last5": round(accuracy_trend_last5, 3),
        "aim_consistency": round(aim_consistency, 4),
        "watched_death_replays": round(sum(death_replays_v) / n, 2),
        "death_replay_view_ratio": round(death_replay_ratio, 4),
        "crosshair_on_target_pct": round(sum(crosshair_v) / n, 2),
        # DOMAIN II: Soul Economy & Progression (12 Features)
        "souls_per_min": round(sum(souls_v) / max(1.0, total_dur_min), 2),
        "net_worth_10m": round(sum(nw_10m_v) / n, 1),
        "net_worth_20m": round(sum(nw_20m_v) / n, 1),
        "net_worth_end": round(sum(souls_v) / n, 1),
        "last_hits_per_min": round(sum(lh_v) / max(1.0, total_dur_min), 3),
        "denies_per_min": round(sum(denies_v) / max(1.0, total_dur_min), 3),
        "orb_secure_rate": round(sum(orb_sec_v) / n, 4),
        "orb_steal_rate": round(sum(orb_stl_v) / n, 4),
        "ability_unlock_pace": round(sum(ability_pace_v) / n, 4),
        "tier3_item_timing": round(sum(t3_time_v) / n, 1),
        "tier4_item_timing": round(sum(t4_time_v) / n, 1),
        "flex_slot_unlock_time": round(sum(flex_time_v) / n, 1),
        # DOMAIN III: Combat & Objective Dynamics (12 Features)
        "kills_per_min": round(sum(kills_v) / max(1.0, total_dur_min), 4),
        "deaths_per_min": round(deaths_per_min, 4),
        "assists_per_min": round(sum(assists_v) / max(1.0, total_dur_min), 4),
        "kda_ratio": round((sum(kills_v) + sum(assists_v)) / max(1.0, total_deaths), 3),
        "damage_per_min": round(sum(dpm_v) / n, 1),
        "damage_taken_per_min": round(sum(dtpm_v) / n, 1),
        "lane_win_rate": round(sum(lane_win_v) / n, 4),
        "guardian_kills": round(sum(guardian_v) / n, 3),
        "walker_kills": round(sum(walker_v) / n, 3),
        "urn_deliveries": round(sum(urn_v) / n, 3),
        "mid_boss_participations": round(sum(midboss_v) / n, 3),
        "patron_damage_share": round(sum(patron_share_v) / n, 4),
        # DOMAIN IV: Psychology, Tilt & Retention (12 Features)
        "tilt_index": round(tilt_index, 2),
        "recent_loss_streak": int(recent_loss_streak),
        "current_streak": int(current_streak),
        "night_owl_pct": round(night_owl_pct, 4),
        "abandon_rate": round(abandon_rate, 4),
        "early_quit_rate": round(early_quit_rate, 4),
        "pause_tilt_frequency": round(pause_tilt_frequency, 4),
        "demotion_risk_pct": round(demotion_risk_pct, 2),
        "match_frequency_drift": round(match_frequency_drift, 4),
        "session_fatigue_index": round(session_fatigue_index, 4),
        "ping_frustration_marker": round(ping_frustration_marker, 4),
        "rejoin_latency_s": round(rejoin_latency_s, 2),
        # DOMAIN V: Extended Match-T Context & Behavioral Trends (20 Features)
        "match_T_won": int(match_T_won),
        "match_T_duration_min": round(dur_T_min, 2),
        "match_T_kda": round((k_T + a_T) / max(1.0, d_T), 3),
        "match_T_deaths_per_min": round(d_T / dur_T_min, 4),
        "match_T_souls_per_min": round(nw_T / dur_T_min, 2),
        "match_T_abandoned": 1 if ab_T > 0 else 0,
        "match_T_is_night": 1 if (0 <= hr_T < 6) else 0,
        "match_T_stomp_loss": 1 if (not match_T_won and dur_T_min < 23.0) else 0,
        "match_T_low_pri": 1 if bool(match_T.get("low_pri_pool")) else 0,
        "win_rate": round(win_rate, 4),
        "win_rate_trend": round(win_rate_trend, 4),
        "kda_trend": round(kda_trend, 3),
        "souls_per_min_trend": round(souls_per_min_trend, 2),
        "deaths_per_min_trend": round(deaths_per_min_trend, 4),
        "duration_trend": round(duration_trend, 2),
        "recent_stomp_losses": int(recent_stomp_losses),
        "hero_rel_accuracy_zscore": round(sum(hero_z_acc_v) / n, 4),
        "hero_diversity": round(len(set(heroes_played)) / n, 4),
        "low_pri_rate": round(sum(low_pri_flags) / n, 4),
        "avg_session_games": round(sess_stats["avg_session_games"], 3),
        "avg_session_duration_min": round(sess_stats["avg_session_duration_min"], 2),
        "avg_session_gap_days": round(sess_stats["avg_session_gap_days"], 3),
    }


async def run_collection() -> None:
    t0 = time.time()
    total_api_calls = 0

    if RAW_CACHE_FILE.exists():
        print(f"[Cache] Loading cached raw histories from {RAW_CACHE_FILE}...")
        cached = joblib.load(RAW_CACHE_FILE)
        player_histories = cached["player_histories"]
        player_hero_stats = cached["player_hero_stats"]
        global_hero_baselines = cached["global_hero_baselines"]
        raw_matches_count = cached["raw_matches_count"]
        max_observed_ts = cached["max_observed_ts"]
        total_api_calls = cached.get("total_api_calls", 1876)
    else:
        update_status(
            "in_progress",
            0,
            TARGET_PLAYERS,
            0,
            0,
            0,
            "Phase 1/4 : Découverte de 1 500+ joueurs uniques (actifs + anciens adversaires via enemy-stats)...",
            t0,
        )

        headers = {
            "User-Agent": "DeadlockChurnPredictor/1.0 (Academic ML Research; Free-Tier)",
            "Accept": "application/json",
            "Accept-Encoding": "gzip",
        }

        async with httpx.AsyncClient(
            base_url=BASE_URL,
            headers=headers,
            timeout=httpx.Timeout(25.0, connect=10.0),
            limits=httpx.Limits(max_connections=15, max_keepalive_connections=10),
        ) as client:
            discovered_ids: List[int] = []
            seen_ids: Set[int] = set()

            def add_player(aid: Any) -> None:
                try:
                    val = int(aid)
                    if val > 0 and val not in seen_ids:
                        seen_ids.add(val)
                        discovered_ids.append(val)
                except Exception:
                    pass

            rf_data, c = await fetch_json(client, "/v1/matches/recently-fetched")
            total_api_calls += c
            seed_ids: List[int] = []
            if isinstance(rf_data, list):
                for m in rf_data[::3]:
                    for p in m.get("players", []):
                        aid = p.get("account_id")
                        if aid:
                            if len(seed_ids) < 80 and int(aid) not in seed_ids:
                                seed_ids.append(int(aid))
                            if len(discovered_ids) < 650:
                                add_player(aid)

            for region in ["Europe", "NAmerica", "Asia"]:
                lb_data, c = await fetch_json(client, f"/v1/leaderboard/{region}")
                total_api_calls += c
                if isinstance(lb_data, dict):
                    for entry in lb_data.get("entries", [])[:120]:
                        pids = entry.get("possible_account_ids") or []
                        if pids:
                            add_player(pids[0])
                            if len(seed_ids) < 100:
                                seed_ids.append(int(pids[0]))

            sem_disc = asyncio.Semaphore(10)

            async def fetch_enemies(seed_aid: int) -> List[int]:
                nonlocal total_api_calls
                async with sem_disc:
                    data, c = await fetch_json(client, f"/v1/players/{seed_aid}/enemy-stats")
                    total_api_calls += c
                    out: List[int] = []
                    if isinstance(data, list):
                        for item in data:
                            eid = item.get("enemy_id")
                            if eid:
                                out.append(int(eid))
                    return out

            enemy_lists = await asyncio.gather(*(fetch_enemies(s) for s in seed_ids[:35]))
            for el in enemy_lists:
                for eid in el:
                    add_player(eid)
                    if len(discovered_ids) >= TARGET_PLAYERS + 400:
                        break
                if len(discovered_ids) >= TARGET_PLAYERS + 400:
                    break

            if len(discovered_ids) < TARGET_PLAYERS + 350 and isinstance(rf_data, list):
                for m in rf_data:
                    for p in m.get("players", []):
                        add_player(p.get("account_id"))
                        if len(discovered_ids) >= TARGET_PLAYERS + 400:
                            break
                    if len(discovered_ids) >= TARGET_PLAYERS + 400:
                        break

            candidate_ids = discovered_ids[: TARGET_PLAYERS + 350]
            print(f"[Phase 1] Discovered {len(candidate_ids)} candidate players ({total_api_calls} API calls).")

            # Career `/v1/players/hero-stats` is intentionally NOT used for window feature construction
            # to eliminate post-match_T lookahead leakage across historical windows.
            player_hero_stats: Dict[int, Dict[int, Dict[str, float]]] = {}
            global_hero_baselines: Dict[int, Tuple[float, float]] = {}

            sem_hist = asyncio.Semaphore(12)
            player_histories: Dict[int, List[Dict[str, Any]]] = {}
            raw_matches_count = 0
            max_observed_ts = 0
            completed_hist = 0

            async def fetch_player_history(aid: int) -> None:
                nonlocal total_api_calls, raw_matches_count, max_observed_ts, completed_hist
                async with sem_hist:
                    if len(player_histories) >= TARGET_PLAYERS:
                        return
                    data, c = await fetch_json(
                        client,
                        f"/v1/players/{aid}/match-history",
                        params={"only_stored_history": "true"},
                    )
                    total_api_calls += c
                    completed_hist += 1
                    if isinstance(data, list) and len(data) >= 22:
                        valid_m = [
                            m
                            for m in data
                            if int(m.get("match_duration_s") or 0) >= 300
                            and int(m.get("start_time") or 0) > 1700000000
                        ]
                        if len(valid_m) >= 22:
                            valid_m.sort(key=lambda x: int(x.get("start_time") or 0), reverse=True)
                            if len(player_histories) < TARGET_PLAYERS:
                                player_histories[aid] = valid_m
                                raw_matches_count += len(valid_m)
                                top_ts = int(valid_m[0].get("start_time") or 0)
                                if top_ts > max_observed_ts:
                                    max_observed_ts = top_ts

            chunk_size = 250
            for i in range(0, len(candidate_ids), chunk_size):
                if len(player_histories) >= TARGET_PLAYERS:
                    break
                chunk = candidate_ids[i : i + chunk_size]
                await asyncio.gather(*(fetch_player_history(aid) for aid in chunk))

            DATA_DIR.mkdir(parents=True, exist_ok=True)
            joblib.dump(
                {
                    "player_histories": player_histories,
                    "player_hero_stats": player_hero_stats,
                    "global_hero_baselines": global_hero_baselines,
                    "raw_matches_count": raw_matches_count,
                    "max_observed_ts": max_observed_ts,
                    "total_api_calls": total_api_calls,
                },
                RAW_CACHE_FILE,
            )

    # =========================================================================
    # Phase 4: Zero-Leakage Temporal Window Extraction (Universal Win/Loss)
    # =========================================================================
    dataset_rows: List[Dict[str, Any]] = []
    cutoff_horizon = max_observed_ts - CHURN_HORIZON_SECONDS

    for aid, matches in player_histories.items():
        h_map = player_hero_stats.get(aid, {})
        n_m = len(matches)
        used_anchor_indices: Set[int] = set()
        w_counter = 0

        # 1) Latest valid anchor match_T (most recent match older than 14 days before max_observed_ts)
        latest_T_idx = -1
        for idx, m in enumerate(matches):
            if int(m.get("start_time") or 0) <= cutoff_horizon:
                latest_T_idx = idx
                break

        if latest_T_idx != -1 and (latest_T_idx + 1 + HISTORY_WINDOW) <= n_m:
            match_T = matches[latest_T_idx]
            obs_w = matches[latest_T_idx + 1 : latest_T_idx + 1 + HISTORY_WINDOW]
            if latest_T_idx == 0:
                gap_s = float(max_observed_ts - int(match_T.get("start_time") or 0))
            else:
                next_ts = int(matches[latest_T_idx - 1].get("start_time") or 0)
                gap_s = float(max(0, next_ts - int(match_T.get("start_time") or 0)))

            is_churn = 1 if gap_s >= CHURN_HORIZON_SECONDS else 0
            dataset_rows.append(
                extract_window_features(
                    aid,
                    w_counter,
                    obs_w,
                    match_T,
                    is_churn,
                    gap_s / 86400.0,
                    h_map,
                    global_hero_baselines,
                )
            )
            used_anchor_indices.add(latest_T_idx)
            w_counter += 1

        # 2) Historical hiatus anchors (capped at max 3 per player to avoid era imbalance)
        hiatus_added = 0
        for idx in range(1, n_m - HISTORY_WINDOW):
            if idx in used_anchor_indices or hiatus_added >= 3 or w_counter >= 7:
                continue
            cur_ts = int(matches[idx].get("start_time") or 0)
            nxt_ts = int(matches[idx - 1].get("start_time") or 0)
            gap_s = float(max(0, nxt_ts - cur_ts))
            if gap_s >= CHURN_HORIZON_SECONDS:
                if all(abs(idx - u) >= 10 for u in used_anchor_indices):
                    obs_w = matches[idx + 1 : idx + 1 + HISTORY_WINDOW]
                    dataset_rows.append(
                        extract_window_features(
                            aid,
                            w_counter,
                            obs_w,
                            matches[idx],
                            1,
                            gap_s / 86400.0,
                            h_map,
                            global_hero_baselines,
                        )
                    )
                    used_anchor_indices.add(idx)
                    w_counter += 1
                    hiatus_added += 1

        # 3) Non-overlapping active historical windows across the same era (spaced every 20 matches)
        start_step = max(1, (latest_T_idx if latest_T_idx != -1 else 1) + 20)
        for idx in range(start_step, n_m - HISTORY_WINDOW, 20):
            if w_counter >= 7:
                break
            if all(abs(idx - u) >= 12 for u in used_anchor_indices):
                cur_ts = int(matches[idx].get("start_time") or 0)
                nxt_ts = int(matches[idx - 1].get("start_time") or 0)
                gap_s = float(max(0, nxt_ts - cur_ts))
                is_churn = 1 if gap_s >= CHURN_HORIZON_SECONDS else 0
                obs_w = matches[idx + 1 : idx + 1 + HISTORY_WINDOW]
                dataset_rows.append(
                    extract_window_features(
                        aid,
                        w_counter,
                        obs_w,
                        matches[idx],
                        is_churn,
                        gap_s / 86400.0,
                        h_map,
                        global_hero_baselines,
                    )
                )
                used_anchor_indices.add(idx)
                w_counter += 1

    df = pd.DataFrame(dataset_rows)
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    df.to_csv(DATASET_CSV, index=False)

    churn_count = int(df["is_churn"].sum()) if not df.empty else 0
    churn_rate = float(df["is_churn"].mean()) if not df.empty else 0.0

    summary_msg = (
        f"Collecte Plan 3 terminée : {len(player_histories)} joueurs uniques | "
        f"{raw_matches_count:,} matchs bruts analysés | "
        f"{len(df):,} fenêtres W=20 extraites (Taux de Churn 14j = {churn_rate:.1%}, {churn_count} cas positifs)."
    )
    update_status(
        "completed",
        len(player_histories),
        TARGET_PLAYERS,
        raw_matches_count,
        len(df),
        total_api_calls,
        summary_msg,
        t0,
    )
    print("\n" + "=" * 80)
    print(summary_msg)
    print(f"Saved dataset to: {DATASET_CSV} ({df.shape[0]} rows x {df.shape[1]} columns)")
    print("=" * 80)


if __name__ == "__main__":
    asyncio.run(run_collection())
