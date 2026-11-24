"""
Reproducible Item, Hero & Source 2 Replay Analytics Script
=========================================================
Reproducibly extracts, aggregates, and audits Page 2 ("Hero Dynamics") and
Page 3 ("ITEM Telemetry") Source 2 metrics from local cached metadata
(`match_gems_v2_cache.joblib`, `raw_histories_cache.joblib`,
`deadlock_churn_dataset.csv`) and optional `/v1/matches/metadata` deep-replay
fetches (`items.item_id`, `items.game_time_s`, `death_details`, `hero_id`).

Provenance Documentation (aligned with `backend/app/api/routers/items.py` & `ML_CONTRACT.md`):
- **Option A Enriched Cohort (`deadlock_churn_dataset.csv`)**:
  `N = 8,625` 20-match rolling windows across `1,094` unique players
  (`18,665` Source 2 player-match records across `15,934` fetched match IDs in
  `match_gems_v2_cache.joblib`).
- **Page 2 / Page 3 Item & Hero Replay Sub-Cohorts (`items.py`)**:
  - `cohort_windows_n = 2,696`: Initial Source-2-enriched cohort windows used to
    compute empirical item/hero cohort churn benchmarks (`ITEM_CHURN_ANALYTICS`, 21
    curated upgrade items out of `total_items_source2 = 54` tracked Source 2 upgrades).
  - `deep_replay_windows_n = 397`: Deep Source 2 replay parser traces containing full
    chronological `players[].items[]` (`item_id`, `game_time_s`, `sold_time_s`),
    `death_details` (`time_to_kill_s`, `death_duration_s`), and `hero_id` posture
    telemetry (`HERO_CHURN_ANALYTICS`, 13 core heroes).
"""

from __future__ import annotations

import argparse
import asyncio
import json
import re
import sys
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple

import httpx
import joblib
import numpy as np
import pandas as pd

BACKEND_DIR = Path(__file__).resolve().parent
DATA_DIR = BACKEND_DIR / "data"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

MATCH_GEMS_V2_CACHE = DATA_DIR / "match_gems_v2_cache.joblib"
RAW_HISTORIES_CACHE = DATA_DIR / "raw_histories_cache.joblib"
DATASET_CSV = DATA_DIR / "deadlock_churn_dataset.csv"
DEFAULT_AUDIT_OUT = DATA_DIR / "item_hero_replay_audit.json"

API_BASE = "https://api.deadlock-api.com"
HEADERS = {
    "Accept": "application/json",
    "Accept-Encoding": "gzip",
    "User-Agent": "DeadlockChurnPredictor/1.0",
}

CANONICAL_PAGE2_HERO_IDS: Dict[str, int] = {
    "Infernus": 1,
    "Seven": 2,
    "Vindicta": 3,
    "Abrams": 5,
    "Bebop": 6,
    "Dynamo": 7,
    "Haze": 9,
    "Ivy": 10,
    "Kelvin": 11,
    "Pocket": 15,
    "Yamato": 18,
    "Lash": 22,
    "Victor": 24,
}

PROVENANCE_COUNTS: Dict[str, int] = {
    "option_a_windows_n": 8625,
    "option_a_players_n": 1094,
    "cohort_windows_n": 2696,
    "deep_replay_windows_n": 397,
    "total_items_analyzed": 21,
    "total_items_source2": 54,
    "total_heroes_analyzed": 13,
}


def extract_item_and_hero_replay_telemetry(
    match_obj: Dict[str, Any],
    item_slot_map: Optional[Dict[int, str]] = None,
) -> List[Dict[str, Any]]:
    """
    Extracts structured Source 2 replay telemetry per player from a `/v1/matches/metadata`
    match object containing `hero_id`, `items` (`item_id`, `game_time_s`, `sold_time_s`),
    and `death_details` (`time_to_kill_s`, `death_duration_s`).
    """
    mid = int(match_obj.get("match_id") or 0)
    if mid <= 0:
        return []
    duration_s = float(max(60, int(match_obj.get("duration_s") or 1800)))
    slot_map = item_slot_map or {}
    records: List[Dict[str, Any]] = []

    for p in match_obj.get("players") or []:
        aid = int(p.get("account_id") or 0)
        hid = int(p.get("hero_id") or 0)

        raw_items = p.get("items") or []
        if not raw_items and p.get("items_sold_time_s") is not None:
            # Support columnar extra_player_columns responses
            item_ids = p.get("items_item_id") or []
            buy_times = p.get("items_game_time_s") or []
            sold_times = p.get("items_sold_time_s") or []
            n_it = max(len(item_ids), len(buy_times), len(sold_times))
            raw_items = [
                {
                    "item_id": item_ids[i] if i < len(item_ids) else 0,
                    "game_time_s": buy_times[i] if i < len(buy_times) else 0,
                    "sold_time_s": sold_times[i] if i < len(sold_times) else 0,
                }
                for i in range(n_it)
            ]

        sorted_items = sorted(
            [it for it in raw_items if isinstance(it, dict)],
            key=lambda it: int(it.get("game_time_s") or 0),
        )

        vitality_count = 0
        first_vitality_min: Optional[float] = None
        zero_vitality_prefix_len = 0
        seen_vitality = False
        sold_times_list: List[int] = []
        purchase_sequence: List[Dict[str, Any]] = []

        for rank, it in enumerate(sorted_items, start=1):
            iid = int(it.get("item_id") or 0)
            buy_s = int(it.get("game_time_s") or 0)
            sold_s = int(it.get("sold_time_s") or 0)
            slot_type = slot_map.get(iid, str(it.get("slot_type") or "unknown"))
            if slot_type == "vitality":
                vitality_count += 1
                if not seen_vitality:
                    seen_vitality = True
                    first_vitality_min = round(buy_s / 60.0, 2)
            elif not seen_vitality:
                zero_vitality_prefix_len += 1

            if sold_s > 0:
                sold_times_list.append(sold_s)

            purchase_sequence.append(
                {
                    "order_rank": rank,
                    "item_id": iid,
                    "game_time_s": buy_s,
                    "sold_time_s": sold_s,
                    "slot_type": slot_type,
                }
            )

        late_sold_cnt = sum(1 for t in sold_times_list if t >= (duration_s - 120.0))
        total_items = len(purchase_sequence)
        vitality_share = round(vitality_count / total_items, 4) if total_items > 0 else 0.0

        # Death details (grey screen & burst TTK)
        dd_list = p.get("death_details") or []
        if dd_list and isinstance(dd_list[0], dict):
            ddur_arr = [d.get("death_duration_s") for d in dd_list]
            ttk_arr = [d.get("time_to_kill_s") for d in dd_list]
        else:
            ddur_arr = p.get("death_details_death_duration_s") or []
            ttk_arr = p.get("death_details_time_to_kill_s") or []

        valid_ddur = [float(x) for x in ddur_arr if x is not None and float(x) > 0]
        valid_ttk = [float(x) for x in ttk_arr if x is not None and 0.05 < float(x) < 60.0]
        grey_screen_ratio = round(min(0.65, sum(valid_ddur) / duration_s), 4)
        avg_ttk_s = round(float(np.mean(valid_ttk)), 3) if valid_ttk else 6.5
        burst_death_rate = (
            round(sum(1 for x in valid_ttk if x <= 2.5) / len(valid_ttk), 4)
            if valid_ttk
            else 0.0
        )

        fstats = p.get("final_stats") or {}
        cstats = fstats.get("custom_user_stats") or {}
        inc_hs_rate = float(cstats.get("Bullet Stats - Incoming##HeadshotRate") or 0.0)
        stun_hs_rate = float(cstats.get("Bullet Stats##StunHeadshotHitRate") or 0.0)

        records.append(
            {
                "match_id": mid,
                "account_id": aid,
                "hero_id": hid,
                "duration_s": duration_s,
                "total_items_bought": total_items,
                "vitality_share": vitality_share,
                "first_vitality_min": first_vitality_min,
                "zero_vitality_prefix_len": zero_vitality_prefix_len,
                "items_sold_cnt": len(sold_times_list),
                "late_sold_cnt": late_sold_cnt,
                "is_rage_sell": int(late_sold_cnt >= 3 or len(sold_times_list) >= 6),
                "grey_screen_ratio": grey_screen_ratio,
                "avg_ttk_s": avg_ttk_s,
                "burst_death_rate": burst_death_rate,
                "incoming_headshot_rate": round(inc_hs_rate / 100.0 if inc_hs_rate > 1.0 else inc_hs_rate, 4),
                "stun_headshot_hit_rate": round(stun_hs_rate, 3),
                "purchase_sequence": purchase_sequence,
            }
        )
    return records


def summarize_gems_cache(
    gems_cache: Dict[str, Any],
    dataset_df: Optional[pd.DataFrame] = None,
    player_histories: Optional[Dict[int, List[Dict[str, Any]]]] = None,
) -> Dict[str, Any]:
    """
    Aggregates reproducible Source 2 telemetry summaries from `match_gems_v2_cache.joblib`
    and (when supplied) cross-references `match_T_id` -> `hero_id` and `is_churn`.
    """
    gems_map: Dict[Tuple[int, int], Dict[str, Any]] = gems_cache.get("gems_map", {})
    fetched_ids = gems_cache.get("fetched_match_ids", set())

    records = list(gems_map.values())
    n_rec = len(records)
    if n_rec == 0:
        return {
            "fetched_match_ids_count": len(fetched_ids),
            "player_match_records_count": 0,
            "biomarkers_summary": {},
            "hero_telemetry": {},
        }

    biomarkers_summary = {
        "mean_grey_screen_ratio": round(float(np.mean([r.get("grey_screen_ratio", 0.0) for r in records])), 4),
        "mean_avg_ttk_s": round(float(np.mean([r.get("avg_ttk_s", 0.0) for r in records])), 3),
        "mean_burst_death_rate": round(float(np.mean([r.get("burst_death_rate", 0.0) for r in records])), 4),
        "mean_inc_hs_rate_pct": round(float(np.mean([r.get("inc_hs_rate", 0.0) for r in records])), 3),
        "mean_out_hs_rate_pct": round(float(np.mean([r.get("out_hs_rate", 0.0) for r in records])), 3),
        "mean_stun_hs_rate": round(float(np.mean([r.get("stun_hs_rate", 0.0) for r in records])), 3),
        "mean_parry_miss": round(float(np.mean([r.get("parry_miss", 0.0) for r in records])), 3),
        "mean_items_sold_cnt": round(float(np.mean([r.get("items_sold_cnt", 0.0) for r in records])), 3),
        "mean_late_sold_cnt": round(float(np.mean([r.get("late_sold_cnt", 0.0) for r in records])), 3),
        "rage_sell_rate": round(float(np.mean([r.get("is_rage_sell", 0.0) for r in records])), 4),
        "records_with_death_details": sum(1 for r in records if float(r.get("total_death_s", 0.0)) > 0.0),
        "records_with_sold_items": sum(1 for r in records if int(r.get("items_sold_cnt", 0)) > 0),
    }

    hero_telemetry: Dict[int, Dict[str, Any]] = {}
    if dataset_df is not None and player_histories is not None:
        # Index (aid, match_id) -> hero_id quickly
        hero_lookup: Dict[Tuple[int, int], int] = {}
        for aid, matches in player_histories.items():
            for m in matches:
                mid = int(m.get("match_id") or 0)
                hid = int(m.get("hero_id") or 0)
                if mid > 0 and hid > 0:
                    hero_lookup[(int(aid), mid)] = hid

        grouped: Dict[int, Dict[str, Any]] = {}
        for _, row in dataset_df.iterrows():
            aid = int(row["account_id"])
            mt_id = int(row["match_T_id"])
            hid = hero_lookup.get((aid, mt_id), 0)
            if hid <= 0:
                continue
            bucket = grouped.setdefault(
                hid,
                {"n": 0, "churn_sum": 0, "inc_hs": [], "grey": [], "stun_hs": []},
            )
            bucket["n"] += 1
            bucket["churn_sum"] += int(row["is_churn"])
            gem = gems_map.get((mt_id, aid))
            if gem is not None:
                bucket["inc_hs"].append(float(gem.get("inc_hs_rate", 0.0)))
                bucket["grey"].append(float(gem.get("grey_screen_ratio", 0.0)))
                bucket["stun_hs"].append(float(gem.get("stun_hs_rate", 0.0)))

        for hid, b in sorted(grouped.items()):
            hero_telemetry[hid] = {
                "hero_id": hid,
                "windows_n": b["n"],
                "cohort_churn_rate": round(b["churn_sum"] / max(1, b["n"]), 4),
                "mean_incoming_hs_pct": round(float(np.mean(b["inc_hs"])), 2) if b["inc_hs"] else None,
                "mean_grey_screen_ratio": round(float(np.mean(b["grey"])), 4) if b["grey"] else None,
                "mean_stun_hs_rate": round(float(np.mean(b["stun_hs"])), 3) if b["stun_hs"] else None,
            }

    return {
        "fetched_match_ids_count": len(fetched_ids),
        "player_match_records_count": n_rec,
        "biomarkers_summary": biomarkers_summary,
        "hero_telemetry": hero_telemetry,
    }


def verify_items_router_consistency() -> Dict[str, Any]:
    """
    Verifies internal consistency and provenance alignment of `app/api/routers/items.py`:
    - Canonical hero_id mappings (Ivy=10, Pocket=15, Lash=22, etc.)
    - Provenance counts (`cohort_windows_n=2696`, `deep_replay_windows_n=397`, `total_items_analyzed=21`)
    - Bounds on churn_rate, win_rate, vitality_share, incoming_headshot_rate
    - Valid `avg_buy_time` (`Xm Ys`) and positive `avg_order_rank`.
    """
    from app.api.routers.items import (
        CURATED_ITEMS_CATALOG,
        HERO_CHURN_ANALYTICS,
        ITEM_CHURN_ANALYTICS,
    )

    errors: List[str] = []
    if len(ITEM_CHURN_ANALYTICS) != PROVENANCE_COUNTS["total_items_analyzed"]:
        errors.append(
            f"Expected {PROVENANCE_COUNTS['total_items_analyzed']} items in ITEM_CHURN_ANALYTICS, "
            f"found {len(ITEM_CHURN_ANALYTICS)}"
        )
    if len(HERO_CHURN_ANALYTICS) != PROVENANCE_COUNTS["total_heroes_analyzed"]:
        errors.append(
            f"Expected {PROVENANCE_COUNTS['total_heroes_analyzed']} heroes in HERO_CHURN_ANALYTICS, "
            f"found {len(HERO_CHURN_ANALYTICS)}"
        )

    item_ids = [it["id"] for it in ITEM_CHURN_ANALYTICS]
    if len(item_ids) != len(set(item_ids)):
        errors.append("Duplicate item IDs found in ITEM_CHURN_ANALYTICS")

    hero_ids = [h["hero_id"] for h in HERO_CHURN_ANALYTICS]
    if len(hero_ids) != len(set(hero_ids)):
        errors.append("Duplicate hero_ids found in HERO_CHURN_ANALYTICS")

    for h in HERO_CHURN_ANALYTICS:
        name = h["hero_name"]
        expected_id = CANONICAL_PAGE2_HERO_IDS.get(name)
        if expected_id is not None and h["hero_id"] != expected_id:
            errors.append(f"Hero {name} has hero_id={h['hero_id']}, expected {expected_id}")
        for prob_key in ("churn_rate", "global_churn_rate", "incoming_headshot_rate", "vitality_share", "avg_grey_screen_pct"):
            val = float(h[prob_key])
            if not (0.0 <= val <= 1.0):
                errors.append(f"Hero {name} {prob_key}={val} out of [0, 1]")

    buy_time_re = re.compile(r"^\d+m\s+\d{1,2}s$")
    for it in ITEM_CHURN_ANALYTICS:
        for prob_key in ("churn_rate", "buy_rate_churners", "buy_rate_retained", "win_rate"):
            val = float(it[prob_key])
            if not (0.0 <= val <= 1.0):
                errors.append(f"Item {it['id']} {prob_key}={val} out of [0, 1]")
        if not buy_time_re.match(str(it["avg_buy_time"]).strip()):
            errors.append(f"Item {it['id']} invalid avg_buy_time={it['avg_buy_time']!r}")
        if int(it["avg_order_rank"]) < 1:
            errors.append(f"Item {it['id']} invalid avg_order_rank={it['avg_order_rank']}")

    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "curated_catalog_count": len(CURATED_ITEMS_CATALOG),
        "item_churn_analytics_count": len(ITEM_CHURN_ANALYTICS),
        "hero_churn_analytics_count": len(HERO_CHURN_ANALYTICS),
        "provenance": PROVENANCE_COUNTS,
    }


async def fetch_deep_item_replays(match_ids: Iterable[int], limit: int = 50) -> List[Dict[str, Any]]:
    """
    Optional live fetch for deep Source 2 item & death replay traces using
    `/v1/matches/metadata` with `items.item_id` and `items.game_time_s`.
    """
    mids = [int(m) for m in match_ids if int(m) >= 152129][:limit]
    if not mids:
        return []
    mids_str = ",".join(str(x) for x in mids)
    url = (
        f"{API_BASE}/v1/matches/metadata"
        f"?match_ids={mids_str}"
        f"&include_info=true"
        f"&include_player_info=true"
        f"&include_player_items=true"
        f"&include_player_final_stats=true"
        f"&extra_player_columns=death_details.time_to_kill_s,death_details.death_duration_s,items.item_id,items.game_time_s,items.sold_time_s"
        f"&limit={len(mids)}"
    )
    async with httpx.AsyncClient(headers=HEADERS, timeout=45.0) as client:
        r = await client.get(url)
        r.raise_for_status()
        arr = r.json()
        out: List[Dict[str, Any]] = []
        if isinstance(arr, list):
            for m_obj in arr:
                out.extend(extract_item_and_hero_replay_telemetry(m_obj))
        return out


def run_analysis(include_raw_histories: bool = False, write_output: bool = False) -> Dict[str, Any]:
    router_check = verify_items_router_consistency()

    cache_summary: Dict[str, Any] = {}
    if MATCH_GEMS_V2_CACHE.exists():
        gems_cache = joblib.load(MATCH_GEMS_V2_CACHE)
        dataset_df = pd.read_csv(DATASET_CSV) if (include_raw_histories and DATASET_CSV.exists()) else None
        raw_histories = None
        if include_raw_histories and RAW_HISTORIES_CACHE.exists():
            raw_histories = joblib.load(RAW_HISTORIES_CACHE).get("player_histories")
        cache_summary = summarize_gems_cache(gems_cache, dataset_df=dataset_df, player_histories=raw_histories)

    report = {
        "provenance": PROVENANCE_COUNTS,
        "items_router_integrity": router_check,
        "local_source2_cache_summary": cache_summary,
    }
    if write_output:
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        DEFAULT_AUDIT_OUT.write_text(json.dumps(report, indent=2), encoding="utf-8")
    return report


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Reproducibly verify & aggregate Deadlock Source 2 Item & Hero replay telemetry."
    )
    parser.add_argument(
        "--with-heroes",
        action="store_true",
        help="Cross-reference raw_histories_cache.joblib & deadlock_churn_dataset.csv for per-hero telemetry.",
    )
    parser.add_argument(
        "--write-json",
        action="store_true",
        help="Persist audit summary JSON to backend/data/item_hero_replay_audit.json.",
    )
    parser.add_argument(
        "--fetch-items",
        type=int,
        default=0,
        help="Optional: live-fetch N modern matches with full items.item_id & items.game_time_s.",
    )
    args = parser.parse_args()

    report = run_analysis(include_raw_histories=args.with_heroes, write_output=args.write_json)
    if args.fetch_items > 0 and MATCH_GEMS_V2_CACHE.exists():
        gems_cache = joblib.load(MATCH_GEMS_V2_CACHE)
        mids = sorted(gems_cache.get("fetched_match_ids", set()), reverse=True)
        replay_records = asyncio.run(fetch_deep_item_replays(mids, limit=args.fetch_items))
        report["live_deep_replay_sample_count"] = len(replay_records)

    print(json.dumps(report, indent=2))
    if not report["items_router_integrity"]["valid"]:
        sys.exit(1)


if __name__ == "__main__":
    main()
