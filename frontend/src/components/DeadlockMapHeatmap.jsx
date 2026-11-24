import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { getHeroIcon } from '../data/deadlockAssetIcons';
import { DEADLOCK_MAP_ZONES, DEADLOCK_TELEMETRY_EVENTS } from '../data/deadlockMapData';

/**
 * DeadlockMapHeatmap Component (V2 - Attenuated Heatmap & 6s Laning Simulation)
 *
 * Improvements:
 * - Attenuated, non-blinding heatmap colors (source-over blending, soft gradients, no pure white burn).
 * - Smooth 0-10 min playback simulation running in 6.0 seconds (5-8s spec).
 * - Visual motion of heat clusters shifting along the 4 lanes from T1 Guardians to Walkers and Fountains.
 * - Real-time statistics, tactical phase ticker, and zone recalculation during playback.
 */
export default function DeadlockMapHeatmap({ lang = 'fr', t }) {
  const isFr = lang === 'fr';

  // State: Mode ('death' | 'disconnect')
  const [mode, setMode] = useState('death');

  // State: Hero filter ('all' | hero name)
  const [selectedHero, setSelectedHero] = useState('all');

  // State: Time window [min_minutes, max_minutes]
  const [timeMin, setTimeMin] = useState(0);
  const [timeMax, setTimeMax] = useState(10);

  // Simulation mode ('wave' = moving 2.2m wave showing motion, 'cumulative' = 0 to t)
  const [simMode, setSimMode] = useState('wave');

  // State: 0-10m simulation animation
  const [isSimulating, setIsSimulating] = useState(false);
  const [simTimeMin, setSimTimeMin] = useState(0);
  const simStartTimestampRef = useRef(null);
  const simReqRef = useRef(null);
  const SIM_DURATION_MS = 6000; // 6.0 seconds (within 5-8s spec)

  // State: Hovered point or zone
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [mousePos, setMousePos] = useState(null);

  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const heroList = [
    { id: 'all', name: isFr ? 'Tous les Héros' : 'All Heroes', churn: '32.4%', color: 'var(--accent-emerald)' },
    { id: 'Yamato', name: 'Yamato', churn: '60.0%', color: 'var(--accent-rose)' },
    { id: 'Vindicta', name: 'Vindicta', churn: '44.8%', color: 'var(--accent-cyan)' },
    { id: 'Seven', name: 'Seven', churn: '41.7%', color: 'var(--accent-amber)' },
    { id: 'Lash', name: 'Lash', churn: '35.7%', color: 'var(--dl-spirit-bright)' },
    { id: 'Infernus', name: 'Infernus', churn: '41.7%', color: 'var(--accent-rose)' },
    { id: 'Abrams', name: 'Abrams', churn: '18.2%', color: 'var(--accent-emerald)' },
    { id: 'Pocket', name: 'Pocket', churn: '18.8%', color: 'var(--dl-spirit-bright)' },
    { id: 'Dynamo', name: 'Dynamo', churn: '20.0%', color: 'var(--dl-vitality-bright)' }
  ];

  // Quick Time Presets
  const timePresets = [
    { label: isFr ? 'Laning (0 - 10m)' : 'Laning (0 - 10m)', min: 0, max: 10 },
    { label: isFr ? 'Mid : Mid-Boss (10 - 25m)' : 'Mid: Mid-Boss (10 - 25m)', min: 10, max: 25 },
    { label: isFr ? 'Late : Siège (25 - 45m)' : 'Late: Base Siege (25 - 45m)', min: 25, max: 45 },
    { label: isFr ? 'Match Entier (0 - 45m)' : 'Full Match (0 - 45m)', min: 0, max: 45 }
  ];

  // Filter events based on active filters
  const filteredEvents = useMemo(() => {
    return DEADLOCK_TELEMETRY_EVENTS.filter((evt) => {
      if (evt.type !== mode) return false;
      if (selectedHero !== 'all' && evt.hero !== selectedHero) return false;
      if (evt.time_min < timeMin || evt.time_min > timeMax) return false;
      return true;
    });
  }, [mode, selectedHero, timeMin, timeMax]);

  // Aggregate stats for the current filtered view
  const stats = useMemo(() => {
    const totalCount = filteredEvents.length;
    if (totalCount === 0) {
      return { total: 0, topZone: 'N/A', peakTime: 'N/A', churnRisk: '0%' };
    }

    // Zone frequency count
    const zoneCounts = {};
    filteredEvents.forEach((e) => {
      const zName = isFr ? e.zone_fr : e.zone_en;
      zoneCounts[zName] = (zoneCounts[zName] || 0) + 1;
    });

    let topZone = isFr ? 'Lane Ambre • Gardien T1' : 'Amber Lane • T1 Guardian';
    let topMax = 0;
    Object.entries(zoneCounts).forEach(([name, cnt]) => {
      if (cnt > topMax) {
        topMax = cnt;
        topZone = name;
      }
    });

    // Peak time bucket (in 2-min intervals during early game)
    const timeBuckets = {};
    filteredEvents.forEach((e) => {
      const bucket = Math.floor(e.time_min / 2) * 2;
      timeBuckets[bucket] = (timeBuckets[bucket] || 0) + 1;
    });

    let peakBucket = 2;
    let peakCount = 0;
    Object.entries(timeBuckets).forEach(([bucket, cnt]) => {
      if (cnt > peakCount) {
        peakCount = cnt;
        peakBucket = parseInt(bucket, 10);
      }
    });

    const churnRate = mode === 'disconnect' ? '88.4%' : '44.8%';

    return {
      total: totalCount,
      topZone,
      topCount: topMax,
      peakTime: `${peakBucket}m - ${peakBucket + 2}m`,
      churnRisk: churnRate
    };
  }, [filteredEvents, mode, isFr]);

  // Current narrative phase description for the 0-10m simulation
  const currentPhaseDesc = useMemo(() => {
    const t = isSimulating ? simTimeMin : timeMax;
    if (t <= 2.5) {
      return isFr
        ? "00:00 - 02:30 • Premières escarmouches aux Gardiens T1 sur les 4 voies"
        : "00:00 - 02:30 • Initial laning clashes at T1 Guardians across all 4 lanes";
    }
    if (t <= 5.5) {
      return isFr
        ? "02:30 - 05:30 • Assauts téméraires sous les Gardiens & premières éliminations"
        : "02:30 - 05:30 • Aggressive Guardian dives & First Blood eliminations";
    }
    if (t <= 8.0) {
      return isFr
        ? "05:30 - 08:00 • Embuscades entre couloirs, ruelle de l'Urne & pièges en jungle"
        : "05:30 - 08:00 • Cross-lane ganks, Urn alley skirmishes & jungle picks";
    }
    return isFr
      ? "08:00 - 10:00 • Chute des T1, repli vers les Walkers T2 & premiers ragequits"
      : "08:00 - 10:00 • T1 collapses, pushes toward T2 Walkers & early fountain quits";
  }, [isSimulating, simTimeMin, timeMax, isFr]);

  // Handle Smooth 0-10 Min Simulation Animation (in 6.0 seconds)
  const stopSimulation = useCallback(() => {
    setIsSimulating(false);
    if (simReqRef.current) {
      cancelAnimationFrame(simReqRef.current);
      simReqRef.current = null;
    }
  }, []);

  const startSimulation = useCallback(() => {
    stopSimulation();
    setIsSimulating(true);
    simStartTimestampRef.current = performance.now();

    const animate = (now) => {
      const elapsed = now - simStartTimestampRef.current;
      const progress = Math.min(1.0, elapsed / SIM_DURATION_MS);
      const currentMin = progress * 10.0;
      setSimTimeMin(currentMin);

      // In wave mode: show a moving 2.2-minute battle wave so heat points visibly travel!
      // In cumulative mode: show all events from 0 to currentMin
      if (simMode === 'wave') {
        const wStart = Math.max(0, currentMin - 2.2);
        const wEnd = Math.max(0.6, currentMin);
        setTimeMin(Math.round(wStart * 10) / 10);
        setTimeMax(Math.round(wEnd * 10) / 10);
      } else {
        setTimeMin(0);
        setTimeMax(Math.max(0.6, Math.round(currentMin * 10) / 10));
      }

      if (progress < 1.0) {
        simReqRef.current = requestAnimationFrame(animate);
      } else {
        setIsSimulating(false);
        // On finish, display full 0 to 10m range so user sees final 10m picture
        setTimeMin(0);
        setTimeMax(10);
      }
    };

    simReqRef.current = requestAnimationFrame(animate);
  }, [simMode, stopSimulation]);

  useEffect(() => {
    return () => {
      if (simReqRef.current) cancelAnimationFrame(simReqRef.current);
    };
  }, []);

  // Draw Heatmap on Canvas (Attenuated, non-blinding colors with soft blending)
  const drawHeatmap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset canvas (1350x1350 coordinate space)
    ctx.clearRect(0, 0, 1350, 1350);

    if (filteredEvents.length === 0) return;

    // Use default 'source-over' so colors blend softly without burning into pure white
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';

    const radius = mode === 'death' ? 34 : 38;

    // Step 1: Draw soft translucent thermal radial gradients
    filteredEvents.forEach((evt) => {
      const grad = ctx.createRadialGradient(evt.x, evt.y, 0, evt.x, evt.y, radius);

      if (mode === 'death') {
        // Combat Fatality Palette: Deep ruby/crimson -> focused red -> soft fade (NO pure white!)
        grad.addColorStop(0, 'rgba(239, 68, 68, 0.40)');
        grad.addColorStop(0.38, 'rgba(220, 38, 38, 0.24)');
        grad.addColorStop(0.72, 'rgba(220, 38, 38, 0.12)');
        grad.addColorStop(1, 'rgba(185, 28, 28, 0)');
      } else {
        // Disconnect / Ragequit Palette: Soft cyan -> deep violet -> muted indigo (NO pure white!)
        grad.addColorStop(0, 'rgba(56, 189, 248, 0.38)');
        grad.addColorStop(0.38, 'rgba(147, 51, 234, 0.24)');
        grad.addColorStop(0.72, 'rgba(67, 56, 202, 0.10)');
        grad.addColorStop(1, 'rgba(30, 27, 75, 0)');
      }

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(evt.x, evt.y, radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Step 2: Draw subtle tactical center pings for precise event reading
    filteredEvents.forEach((evt) => {
      ctx.beginPath();
      ctx.arc(evt.x, evt.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = mode === 'death'
        ? 'rgba(254, 202, 202, 0.65)'
        : 'rgba(186, 230, 253, 0.65)';
      ctx.fill();
    });

    ctx.restore();

    // Step 3: Draw tactical zone rings around active epicenters
    ctx.save();
    DEADLOCK_MAP_ZONES.forEach((zone) => {
      const countInZone = filteredEvents.filter((e) => e.zone_id === zone.id).length;
      if (countInZone >= 10) {
        ctx.strokeStyle = mode === 'death' ? 'rgba(239, 68, 68, 0.35)' : 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(zone.x, zone.y, zone.radius * 0.9, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = mode === 'death' ? 'rgba(239, 68, 68, 0.6)' : 'rgba(168, 85, 247, 0.65)';
        ctx.beginPath();
        ctx.arc(zone.x, zone.y, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.restore();

    // Step 4: Draw Hover HUD reticle if an event is hovered
    if (hoveredEvent) {
      ctx.save();
      const hColor = mode === 'death' ? '#f87171' : '#38bdf8';

      // Concentric targeting rings
      ctx.strokeStyle = hColor;
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(hoveredEvent.x, hoveredEvent.y, 14, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(hoveredEvent.x, hoveredEvent.y, 24, 0, Math.PI * 2);
      ctx.stroke();

      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(hoveredEvent.x - 30, hoveredEvent.y);
      ctx.lineTo(hoveredEvent.x + 30, hoveredEvent.y);
      ctx.moveTo(hoveredEvent.x, hoveredEvent.y - 30);
      ctx.lineTo(hoveredEvent.x, hoveredEvent.y + 30);
      ctx.stroke();

      ctx.restore();
    }
  }, [filteredEvents, mode, hoveredEvent]);

  // Re-render canvas whenever filtered events or mode or hover changes
  useEffect(() => {
    drawHeatmap();
  }, [drawHeatmap]);

  // Handle canvas pointer (mouse/touch) to detect closest telemetry event
  const detectClosestEvent = (clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const scaleX = 1350 / rect.width;
    const scaleY = 1350 / rect.height;

    const mapX = (clientX - rect.left) * scaleX;
    const mapY = (clientY - rect.top) * scaleY;

    setMousePos({
      x: clientX - rect.left,
      y: clientY - rect.top,
      containerW: rect.width,
      containerH: rect.height
    });

    // Dynamic capture radius scaled to viewport width for crisp mobile & desktop selection
    let closest = null;
    let minDist = 50 * (1350 / Math.max(200, rect.width));

    filteredEvents.forEach((evt) => {
      const dist = Math.hypot(evt.x - mapX, evt.y - mapY);
      if (dist < minDist) {
        minDist = dist;
        closest = evt;
      }
    });

    setHoveredEvent(closest);
  };

  const handleMouseMove = (e) => {
    detectClosestEvent(e.clientX, e.clientY);
  };

  const handleTouchSelect = (e) => {
    if (e.touches && e.touches.length > 0) {
      detectClosestEvent(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleMouseLeave = () => {
    setHoveredEvent(null);
    setMousePos(null);
  };

  return (
    <div id="lab-step-heatmap" className="card lab-heatmap-glass-card">
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 className="lab-chapter-title" style={{ fontSize: 'clamp(1.35rem, 2.5vw, 1.85rem)', margin: '0 0 0.35rem' }}>
            {isFr
              ? 'Carte de Chaleur Tactique : Où Meurent & Déconnectent les Joueurs'
              : 'Tactical Heatmap: Where Players Die & Ragequit Across Deadlock'}
          </h2>
          <p className="lab-chapter-subtitle" style={{ fontSize: '0.88rem' }}>
            {isFr
              ? 'Visualisation thermique translucide sur la carte officielle de Deadlock (N = 10 000 matchs cohorte). Utilisez "Simulation (0-10m)" pour observer le déplacement des combats en 6 secondes.'
              : 'Soft translucent thermal visualization on Deadlock’s official map (N = 10,000 match cohorts). Click "Laning Simulation (0-10m)" to watch combat shift across the map in 6 seconds.'}
          </p>
        </div>

        {/* Mode Selector Pill Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--color-paper-inset)', padding: '0.35rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <button
            type="button"
            onClick={() => {
              stopSimulation();
              setMode('death');
            }}
            className={`btn ${mode === 'death' ? 'btn-primary' : 'btn-ghost'}`}
            style={{
              padding: '0.45rem 0.95rem',
              fontSize: '0.84rem',
              background: mode === 'death' ? 'var(--ml-churn-bg)' : 'transparent',
              color: mode === 'death' ? 'var(--ml-churn)' : 'var(--color-ink-2)',
              border: mode === 'death' ? '1px solid var(--ml-churn)' : '1px solid transparent'
            }}
          >
            <span>{isFr ? 'Morts des Héros' : 'Hero Fatalities'}</span>
            <span className="font-mono tabular-nums" style={{ fontSize: '0.75rem', opacity: 0.8 }}>
              850 pts
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              stopSimulation();
              setMode('disconnect');
            }}
            className={`btn ${mode === 'disconnect' ? 'btn-primary' : 'btn-ghost'}`}
            style={{
              padding: '0.45rem 0.95rem',
              fontSize: '0.84rem',
              background: mode === 'disconnect' ? 'var(--dl-souls-bg)' : 'transparent',
              color: mode === 'disconnect' ? 'var(--dl-souls)' : 'var(--color-ink-2)',
              border: mode === 'disconnect' ? '1px solid var(--dl-souls)' : '1px solid transparent'
            }}
          >
            <span>{isFr ? 'Déconnexions & Ragequits' : 'Disconnects & Churn'}</span>
            <span className="font-mono tabular-nums" style={{ fontSize: '0.75rem', opacity: 0.8 }}>
              400 pts
            </span>
          </button>
        </div>
      </div>

      {/* Hero Filter Bar */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {isFr ? '1. Filtrer par héros :' : '1. Filter by hero:'}
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            {selectedHero === 'all'
              ? isFr ? 'Tous les 10 000 profils répertoriés' : 'All 10,000 tracked match cohorts'
              : `${selectedHero} (${heroList.find((h) => h.id === selectedHero)?.churn || ''} Churn Rate)`}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
          {heroList.map((h) => {
            const isSelected = selectedHero === h.id;
            const heroIcon = h.id === 'all' ? null : getHeroIcon(h.id);

            return (
              <button
                key={h.id}
                type="button"
                onClick={() => setSelectedHero(h.id)}
                className="badge"
                style={{
                  cursor: 'pointer',
                  padding: '0.32rem 0.65rem',
                  fontSize: '0.78rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  background: isSelected ? 'var(--color-paper-3)' : 'transparent',
                  color: isSelected ? 'var(--color-ink)' : 'var(--text-secondary)',
                  border: isSelected ? `1px solid ${h.color}` : '1px solid var(--border-subtle)',
                  textTransform: 'none',
                  letterSpacing: 0
                }}
              >
                {heroIcon ? (
                  <img
                    src={heroIcon}
                    alt={h.name}
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      objectFit: 'contain',
                      background: 'var(--color-paper-inset)'
                    }}
                  />
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                )}
                <span style={{ fontWeight: isSelected ? 700 : 500 }}>{h.name}</span>
                <span className="font-mono tabular-nums" style={{ fontSize: '0.72rem', color: h.color }}>{h.churn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Slider & 0-10m Simulation Controller */}
      <div
        style={{
          background: 'rgba(0, 0, 0, 0.35)',
          padding: '1.1rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '1.5rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
              {isFr ? '2. Curseur Temporel :' : '2. Time Window:'}
            </span>
            <span
              className="badge"
              style={{
                background: isSimulating ? 'rgba(239, 68, 68, 0.15)' : 'rgba(56, 189, 248, 0.12)',
                color: isSimulating ? 'var(--accent-rose)' : 'var(--accent-cyan)',
                border: isSimulating ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid rgba(56, 189, 248, 0.3)',
                fontWeight: 800,
                fontSize: '0.78rem',
                fontFamily: 'var(--font-mono)'
              }}
            >
              ⏱ [{String(Math.floor(timeMin)).padStart(2, '0')}:{String(Math.round((timeMin % 1) * 60)).padStart(2, '0')} ➔ {String(Math.floor(timeMax)).padStart(2, '0')}:{String(Math.round((timeMax % 1) * 60)).padStart(2, '0')}]
            </span>

            {/* Simulation Motion Mode Indicator */}
            {isSimulating && (
              <span className="badge badge-amber" style={{ fontSize: '0.65rem', animation: 'pulse 1.5s infinite' }}>
                ● {isFr ? 'Vague mobile en cours (6.0s)' : 'Moving wave active (6.0s)'}
              </span>
            )}
          </div>

          {/* Quick Presets & Simulation Trigger */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* 0-10 Min 6-Second Simulation Button */}
            <button
              type="button"
              onClick={() => {
                if (isSimulating) {
                  stopSimulation();
                } else {
                  startSimulation();
                }
              }}
              className="btn btn-primary"
              style={{
                fontSize: '0.8rem',
                padding: '0.4rem 0.9rem',
                background: isSimulating ? 'var(--ml-churn)' : 'var(--color-accent)',
                color: 'var(--color-accent-ink)',
                fontWeight: 700,
                boxShadow: 'none'
              }}
            >
              <span>
                {isSimulating
                  ? (isFr ? 'Pause simulation' : 'Pause simulation')
                  : (isFr ? 'Lancer simulation (0 - 10 min en 6s)' : 'Run laning simulation (0 - 10m in 6s)')}
              </span>
            </button>

            {timePresets.map((p) => {
              const isActive = !isSimulating && timeMin === p.min && timeMax === p.max;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    stopSimulation();
                    setTimeMin(p.min);
                    setTimeMax(p.max);
                  }}
                  className="badge"
                  style={{
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    padding: '0.3rem 0.65rem',
                    background: isActive ? 'var(--color-paper-3)' : 'transparent',
                    color: isActive ? 'var(--color-ink)' : 'var(--text-secondary)',
                    border: isActive ? '1px solid var(--ml-retention)' : '1px solid var(--border-subtle)',
                    fontWeight: isActive ? 600 : 500,
                    textTransform: 'none',
                    letterSpacing: 0
                  }}
                >
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Narrative Live Phase Ticker (Highlights movement during 0-10m) */}
        <div
          style={{
            background: 'var(--color-paper-inset)',
            padding: '0.55rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            borderLeft: `2px solid ${isSimulating ? 'var(--accent-cyan)' : 'var(--accent-emerald)'}`,
            marginBottom: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: isSimulating ? 'var(--accent-cyan)' : 'var(--color-ink)', fontWeight: 600 }}>
              {currentPhaseDesc}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>{isFr ? 'Mode de lecture :' : 'Motion mode:'}</span>
            <button
              type="button"
              onClick={() => setSimMode(simMode === 'wave' ? 'cumulative' : 'wave')}
              className="badge"
              style={{
                cursor: 'pointer',
                fontSize: '0.75rem',
                background: 'var(--color-paper-3)',
                color: 'var(--color-ink)',
                border: '1px solid var(--border-subtle)',
                padding: '0.2rem 0.5rem',
                textTransform: 'none',
                letterSpacing: 0
              }}
            >
              {simMode === 'wave'
                ? isFr ? 'Vague mobile (déplacement visible)' : 'Moving wave'
                : isFr ? 'Cumulatif (0 à t)' : 'Cumulative (0 to t)'}
            </button>
          </div>
        </div>

        {/* Simulation Progress Timeline Bar */}
        {isSimulating && (
          <div style={{ marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
              <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
                {isFr ? 'Progression simulation (0 à 10 min en 6.0s)' : 'Simulation progress (0 to 10m in 6.0s)'}
              </span>
              <span className="font-mono tabular-nums" style={{ color: 'var(--color-ink)', fontWeight: 700 }}>
                {(simTimeMin).toFixed(1)} / 10.0 min
              </span>
            </div>
            <div style={{ height: '6px', borderRadius: '3px', background: 'var(--color-rule)', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${(simTimeMin / 10.0) * 100}%`,
                  background: 'var(--dl-souls)'
                }}
              />
            </div>
          </div>
        )}

        {/* Dual Range Sliders for Manual Window Control */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              <span>{isFr ? 'Début de fenêtre :' : 'Window Start:'}</span>
              <span className="font-mono tabular-nums" style={{ color: 'var(--color-ink)', fontWeight: 700 }}>{timeMin.toFixed(1)} min</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="0.5"
              value={timeMin}
              onChange={(e) => {
                stopSimulation();
                const val = parseFloat(e.target.value);
                if (val < timeMax) setTimeMin(val);
              }}
              style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent-cyan)' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              <span>{isFr ? 'Fin de fenêtre :' : 'Window End:'}</span>
              <span className="font-mono tabular-nums" style={{ color: 'var(--color-ink)', fontWeight: 700 }}>{timeMax.toFixed(1)} min</span>
            </div>
            <input
              type="range"
              min="1"
              max="45"
              step="0.5"
              value={timeMax}
              onChange={(e) => {
                stopSimulation();
                const val = parseFloat(e.target.value);
                if (val > timeMin) setTimeMax(val);
              }}
              style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent-rose)' }}
            />
          </div>
        </div>
      </div>

      {/* Main Heatmap Stage (Grid: Interactive Map + Tactical Radar Panel) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1.5rem', alignItems: 'start' }}>
        {/* Map Stage Container */}
        <div
          ref={containerRef}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '620px',
            aspectRatio: '1 / 1',
            margin: '0 auto',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            border: '1px solid var(--border-subtle)',
            background: 'var(--color-paper-inset)'
          }}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchSelect}
          onTouchMove={handleTouchSelect}
          onMouseLeave={handleMouseLeave}
        >
          {/* Official Dark Vector Minimap Background */}
          <img
            src="/images/deadlock_map_dark.svg"
            alt="Deadlock Official Map"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              opacity: 0.94,
              userSelect: 'none',
              pointerEvents: 'none'
            }}
          />

          {/* Canvas Heatmap Overlay */}
          <canvas
            ref={canvasRef}
            width={1350}
            height={1350}
            aria-label={isFr ? 'Carte thermique des morts et déconnexions Deadlock' : 'Deadlock deaths and disconnects thermal heatmap'}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              cursor: 'crosshair',
              pointerEvents: 'auto'
            }}
          />

          {/* Map Tactical HUD Overlays (Labels on Lanes & Mid-Boss) */}
          <div style={{ position: 'absolute', top: 12, left: 14, pointerEvents: 'none', display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--accent-brass-bright)', fontWeight: 700 }}>
              {isFr ? 'Lane Ambre (Ouest)' : 'Amber Lane (West)'}
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--dl-vitality-bright)', fontWeight: 700 }}>
              {isFr ? 'Lane Jade (Int-Ouest)' : 'Jade Lane (Inner-West)'}
            </span>
          </div>

          <div style={{ position: 'absolute', top: 12, right: 14, pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--dl-souls)', fontWeight: 700 }}>
              {isFr ? 'Lane Saphir (Int-Est)' : 'Sapphire Lane (Inner-East)'}
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--dl-spirit-bright)', fontWeight: 700 }}>
              {isFr ? 'Lane Orchidée (Est)' : 'Orchid Lane (East)'}
            </span>
          </div>

          {/* Central Mid-Boss Vault Callout */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              textAlign: 'center'
            }}
          >
            <span
              style={{
                fontSize: '0.68rem',
                color: mode === 'death' ? 'var(--accent-brass-bright)' : 'var(--dl-souls)',
                fontWeight: 700,
                background: 'var(--color-paper-inset)',
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
                border: '1px solid var(--color-rule-strong)'
              }}
            >
              {isFr ? 'Fosse du Mid-Boss' : 'Mid-Boss Vault'}
            </span>
          </div>

          {/* Bottom Bases Callouts */}
          <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none', textAlign: 'center' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--color-ink-2)', background: 'var(--color-paper-inset)', padding: '0.15rem 0.5rem', borderRadius: '4px', border: '1px solid var(--color-rule)' }}>
              {isFr ? 'Sanctuaire Patron Sud (Fontaine)' : 'South Patron Sanctuary (Fountain)'}
            </span>
          </div>

          {/* Tooltip on Hover */}
          {hoveredEvent && mousePos && (() => {
            const containerW = mousePos.containerW || containerRef.current?.clientWidth || 320;
            const containerH = mousePos.containerH || containerRef.current?.clientHeight || 320;
            const tooltipW = Math.min(240, Math.max(180, containerW - 16));
            const clampedLeft = Math.max(8, Math.min(mousePos.x + 12, containerW - tooltipW - 8));
            const clampedTop = Math.max(8, Math.min(mousePos.y - 70, containerH - 135));
            return (
            <div
              style={{
                position: 'absolute',
                left: clampedLeft,
                top: clampedTop,
                zIndex: 20,
                pointerEvents: 'none',
                background: 'var(--color-paper-2)',
                border: `1px solid ${mode === 'death' ? 'var(--accent-rose)' : 'var(--accent-cyan)'}`,
                borderRadius: 'var(--radius-sm)',
                padding: '0.65rem 0.85rem',
                width: `${tooltipW}px`,
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: mode === 'death' ? 'var(--accent-rose)' : 'var(--accent-cyan)'
                  }}
                >
                  {mode === 'death' ? (isFr ? 'Mort Replay' : 'Replay Fatality') : 'Ragequit / Churn'}
                </span>
                <span className="font-mono tabular-nums" style={{ fontSize: '0.72rem', color: 'var(--color-ink)', fontWeight: 700 }}>
                  {hoveredEvent.time_min}m
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
                {getHeroIcon(hoveredEvent.hero) && (
                  <img
                    src={getHeroIcon(hoveredEvent.hero)}
                    alt={hoveredEvent.hero}
                    style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'contain' }}
                  />
                )}
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-ink)' }}>
                  {hoveredEvent.hero}
                </span>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', fontWeight: 600, marginBottom: '0.25rem' }}>
                {isFr ? hoveredEvent.zone_fr : hoveredEvent.zone_en}
              </div>

              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                {isFr ? hoveredEvent.cause_fr : hoveredEvent.cause_en}
              </p>
            </div>
            );
          })()}
        </div>

        {/* Tactical Telemetry Summary & Hotspot Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Key Spatial Metrics Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            <div style={{ background: 'var(--color-paper-inset)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                {isFr ? 'Événements filtrés' : 'Filtered events'}
              </span>
              <div className="tabular-nums" style={{ fontSize: '1.45rem', fontWeight: 700, color: mode === 'death' ? 'var(--accent-rose)' : 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                {stats.total}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {mode === 'death' ? (isFr ? 'Morts recensées' : 'Deaths logged') : (isFr ? 'Déconnexions brutes' : 'Ragequits logged')}
              </span>
            </div>

            <div style={{ background: 'var(--color-paper-inset)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                {isFr ? 'Pic temporel critique' : 'Critical time peak'}
              </span>
              <div className="tabular-nums" style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--color-ink)', fontFamily: 'var(--font-mono)' }}>
                {stats.peakTime}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-amber)' }}>
                {mode === 'death' ? (isFr ? 'Assauts & 1res morts' : 'First blood dives') : (isFr ? 'Alt+F4 après stomp' : 'Alt+F4 post stomp')}
              </span>
            </div>
          </div>

          {/* Top Hotspot Epicenter Card */}
          <div style={{ background: 'var(--color-paper-inset)', padding: '0.9rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', borderLeft: `2px solid ${mode === 'death' ? 'var(--accent-rose)' : 'var(--accent-cyan)'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {mode === 'death' ? (isFr ? 'Épicentre #1 de mortalité' : '#1 fatality epicenter') : (isFr ? 'Épicentre #1 de ragequit' : '#1 ragequit epicenter')}
              </span>
              <span className="dl-risk-text dl-risk-churn font-mono tabular-nums">
                {stats.topCount} {isFr ? 'cas' : 'cases'}
              </span>
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '0.35rem' }}>
              {stats.topZone}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
              {mode === 'death'
                ? isFr
                  ? 'Durant la phase de Laning (0-10m), les Gardiens T1 concentrent plus de 64% des éliminations directes. Les héros à fort churn (Yamato 60%, Vindicta 45%) y meurent en tentant des agressions hâtives sans item de Vitalité.'
                  : 'During Laning (0-10m), T1 Guardians concentrate over 64% of direct eliminations. High-churn heroes (Yamato 60%, Vindicta 45%) repeatedly die attempting early dives without Vitality items.'
                : isFr
                  ? 'Les premiers ragequits (0-10m) sont enregistrés à la Fontaine de Spawn : après deux morts consécutives sous Gardien T1, le joueur abandonne la partie sans attendre le milieu de jeu.'
                  : 'Early ragequits (0-10m) are recorded directly at the Spawn Fountain: after two consecutive deaths under T1 Guardians, players abandon without waiting for mid-game.'}
            </p>
          </div>

          {/* Thermal Intensity Legend */}
          <div style={{ background: 'var(--color-paper-inset)', padding: '0.75rem 0.9rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.45rem' }}>
              {isFr ? 'Échelle thermique translucide :' : 'Translucent thermal scale:'}
            </span>
            <div
              style={{
                height: 8,
                borderRadius: 4,
                background: mode === 'death' ? 'var(--ml-churn)' : 'var(--dl-souls)',
                opacity: 0.75,
                marginBottom: '0.35rem'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              <span>{isFr ? '0% translucide' : '0% translucent'}</span>
              <span>{isFr ? '50% fréquence laning' : '50% moderate density'}</span>
              <span style={{ color: 'var(--color-ink)', fontWeight: 600 }}>{isFr ? '100% saturation ciblée' : '100% focused density'}</span>
            </div>
          </div>

          {/* Tactical takeaway box */}
          <div style={{ background: 'var(--color-paper-inset)', padding: '0.75rem 0.9rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--dl-souls-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-cyan)', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.2rem' }}>
              <span>{isFr ? 'Lecture de la simulation 0 - 10 min :' : '0 - 10 min simulation reading:'}</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
              {isFr
                ? "En activant la simulation en 6 secondes, observez l'onde de choc : les morts s'allument d'abord aux Gardiens T1 extérieurs (2-4 min), glissent le long des lanes avec les premiers ganks (5-7 min), puis atteignent les Walkers et les Fontaines de ragequit avant la 10e minute."
                : "During the 6-second simulation, track the shockwave: fatalities light up at outer T1 Guardians (2-4 min), drift along lanes with early roaming ganks (5-7 min), and reach Walkers and ragequit Fountains before the 10th minute."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
