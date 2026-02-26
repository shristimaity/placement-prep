import { useState, useEffect, useRef, useCallback } from "react";

/* ─────────────────────────────────────────
   PURE UTILITY FUNCTIONS  (no hooks, no JSX)
───────────────────────────────────────── */

function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function getWeekKey() {
  const now = new Date();
  return `${now.getFullYear()}-W${String(getISOWeek(now)).padStart(2, "0")}`;
}

function getTodayDate() {
  return new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function buildSmoothPath(pts) {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const cpx = (pts[i - 1].x + pts[i].x) / 2;
    d += ` C ${cpx} ${pts[i - 1].y}, ${cpx} ${pts[i].y}, ${pts[i].x} ${pts[i].y}`;
  }
  return d;
}

function aggregateHistory(history) {
  const map = {};
  [...history].reverse().forEach((e) => {
    map[e.date] = (map[e.date] || 0) + e.problems;
  });
  return Object.entries(map)
    .map(([date, problems]) => ({ date, problems }))
    .slice(-14);
}

function getBestDay(history) {
  const map = {};
  history.forEach((e) => {
    map[e.date] = (map[e.date] || 0) + e.problems;
  });
  return Math.max(0, ...Object.values(map));
}

/* ─────────────────────────────────────────
   STORAGE  (async, isolated)
───────────────────────────────────────── */

async function storageGet(key) {
  try {
    const r = await window.storage.get(key);
    return r ? JSON.parse(r.value) : null;
  } catch (err) {
    console.warn("storageGet failed:", err);
    return null;
  }
}

async function storageSet(key, val) {
  try {
    await window.storage.set(key, JSON.stringify(val));
  } catch (err) {
    console.warn("storageSet failed:", err);
  }
}

/* ─────────────────────────────────────────
   GRAPH: SVG CONSTANTS & SCALE HELPERS
───────────────────────────────────────── */

const W = 520;
const H = 190;
const PAD = { top: 22, right: 22, bottom: 44, left: 46 };
const CHART_W = W - PAD.left - PAD.right;
const CHART_H = H - PAD.top - PAD.bottom;

function xScale(i, total) {
  return PAD.left + (total > 1 ? (i / (total - 1)) * CHART_W : CHART_W / 2);
}

function yScale(v, maxVal) {
  return PAD.top + CHART_H - (v / maxVal) * CHART_H;
}

function makePoints(agg, maxVal) {
  return agg.map((d, i) => ({
    x: xScale(i, agg.length),
    y: yScale(d.problems, maxVal),
  }));
}

/* ─────────────────────────────────────────
   GRAPH SUB-COMPONENTS
───────────────────────────────────────── */

function GraphDefs() {
  return (
    <defs>
      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stopColor="#38bdf8" stopOpacity="0.22" />
        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%"   stopColor="#818cf8" />
        <stop offset="100%" stopColor="#38bdf8" />
      </linearGradient>
      <filter id="dotGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2.5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

function GraphGrid({ maxVal }) {
  const ticks = [0, Math.round(maxVal / 2), maxVal];
  return (
    <g>
      {ticks.map((t) => (
        <g key={t}>
          <line
            x1={PAD.left}      y1={yScale(t, maxVal)}
            x2={W - PAD.right} y2={yScale(t, maxVal)}
            stroke="#1a2740" strokeWidth="1" strokeDasharray="4 4"
          />
          <text
            x={PAD.left - 8} y={yScale(t, maxVal) + 4}
            fill="#3a526b" fontSize="10"
            textAnchor="end" fontFamily="Space Mono,monospace"
          >
            {t}
          </text>
        </g>
      ))}
    </g>
  );
}

function GraphXLabels({ agg }) {
  return (
    <g>
      {agg.map((d, i) => {
        if (agg.length > 7 && i % 2 !== 0) return null;
        return (
          <text
            key={d.date + String(i)}
            x={xScale(i, agg.length)} y={H - 8}
            fill="#3a526b" fontSize="9"
            textAnchor="middle" fontFamily="Space Mono,monospace"
          >
            {d.date}
          </text>
        );
      })}
    </g>
  );
}

function GraphDots({ points, activeIdx, dotsRef }) {
  return (
    <g>
      {points.map((p, i) => (
        <g
          key={i}
          ref={(el) => { dotsRef.current[i] = el; }}
          style={{ transformOrigin: `${p.x}px ${p.y}px` }}
        >
          {activeIdx === i && (
            <circle cx={p.x} cy={p.y} r="6" fill="none" stroke="#38bdf8" strokeWidth="1.5">
              <animate attributeName="r"       values="6;14;6"    dur="1.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0;0.6" dur="1.8s" repeatCount="indefinite" />
            </circle>
          )}
          <circle
            cx={p.x} cy={p.y} r="5"
            fill="#0d1525"
            stroke={activeIdx === i ? "#38bdf8" : "#4f7999"}
            strokeWidth="2"
            filter="url(#dotGlow)"
          />
        </g>
      ))}
    </g>
  );
}

function GraphTooltip({ tooltip }) {
  if (!tooltip.visible) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: `${(tooltip.svgY / H) * 100}%`,
        left: `${(tooltip.svgX / W) * 100}%`,
        transform: "translate(-50%, -120%)",
        pointerEvents: "none",
        background: "linear-gradient(135deg, #0f1e35 0%, #0d1525 100%)",
        border: "1px solid #38bdf8",
        borderRadius: 12,
        padding: "12px 16px",
        minWidth: 150,
        boxShadow: "0 12px 40px rgba(56,189,248,0.25), 0 4px 16px rgba(0,0,0,0.5)",
        zIndex: 20,
      }}
    >
      <div
        style={{
          position: "absolute",
          bottom: -7,
          left: "50%",
          width: 12,
          height: 12,
          background: "#0d1525",
          border: "1px solid #38bdf8",
          borderTop: "none",
          borderLeft: "none",
          transform: "translateX(-50%) rotate(45deg)",
        }}
      />
      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#64748b", marginBottom: 6 }}>
        📅 {tooltip.date}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
        <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 22, fontWeight: 700, color: "#38bdf8" }}>
          +{tooltip.problems}
        </span>
        <span style={{ fontSize: 11, color: "#64748b" }}>today</span>
      </div>
      <div style={{ height: 1, background: "#1e2d45", margin: "6px 0" }} />
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 16, fontWeight: 700, color: "#10b981" }}>
          ∑ {tooltip.total}
        </span>
        <span style={{ fontSize: 11, color: "#64748b" }}>cumulative</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   DAILY GRAPH  (orchestrator — now slim)
───────────────────────────────────────── */

function DailyGraph({ history }) {
  const svgRef  = useRef(null);
  const lineRef = useRef(null);
  const dotsRef = useRef([]);

  const [tooltip, setTooltip] = useState({
    visible: false, svgX: 0, svgY: 0,
    date: "", problems: 0, total: 0, idx: -1,
  });

  const agg    = aggregateHistory(history);
  const maxVal = agg.length ? Math.max(...agg.map((d) => d.problems), 1) : 10;
  const points = makePoints(agg, maxVal);
  const line   = buildSmoothPath(points);
  const area   = points.length
    ? `${line} L ${points[points.length - 1].x} ${PAD.top + CHART_H} L ${points[0].x} ${PAD.top + CHART_H} Z`
    : "";

  /* Animate line draw */
  const aggKey = agg.map((d) => d.problems).join(",");

  useEffect(() => {
    const path = lineRef.current;
    if (!path || !agg.length) return;
    const len = path.getTotalLength ? path.getTotalLength() : 0;
    if (!len) return;
    path.style.strokeDasharray  = String(len);
    path.style.strokeDashoffset = String(len);
    path.style.transition = "none";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        path.style.transition = "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)";
        path.style.strokeDashoffset = "0";
      });
    });
    dotsRef.current.forEach((dot, i) => {
      if (!dot) return;
      dot.style.opacity   = "0";
      dot.style.transform = "scale(0)";
      setTimeout(() => {
        dot.style.transition = "opacity 0.3s ease, transform 0.45s cubic-bezier(0.34,1.56,0.64,1)";
        dot.style.opacity    = "1";
        dot.style.transform  = "scale(1)";
      }, 1000 + i * 70);
    });
  }, [aggKey]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Nearest-point hover */
  const handleMouseMove = useCallback((e) => {
    if (!svgRef.current || !agg.length) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mx   = ((e.clientX - rect.left) / rect.width) * W;
    let closest = 0;
    let minDist = Infinity;
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - mx);
      if (dist < minDist) { minDist = dist; closest = i; }
    });
    const d     = agg[closest];
    const total = agg.slice(0, closest + 1).reduce((s, x) => s + x.problems, 0);
    setTooltip({ visible: true, svgX: points[closest].x, svgY: points[closest].y, date: d.date, problems: d.problems, total, idx: closest });
  }, [agg, points]);

  const handleMouseLeave = useCallback(() => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  }, []);

  if (!agg.length) {
    return (
      <div style={{ height: 190, display: "flex", alignItems: "center", justifyContent: "center", color: "#2d3f55", fontSize: 13, fontFamily: "'Space Mono',monospace" }}>
        Start logging to see your graph
      </div>
    );
  }

  return (
    <div style={{ position: "relative", userSelect: "none" }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", height: "auto", overflow: "visible", cursor: "crosshair", display: "block" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <GraphDefs />
        <GraphGrid maxVal={maxVal} />
        <GraphXLabels agg={agg} />
        <path d={area} fill="url(#areaGrad)" />
        {tooltip.visible && (
          <line
            x1={tooltip.svgX} y1={PAD.top}
            x2={tooltip.svgX} y2={PAD.top + CHART_H}
            stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" opacity="0.5"
          />
        )}
        <path ref={lineRef} d={line} fill="none" stroke="url(#lineGrad)" strokeWidth="2.5" strokeLinecap="round" />
        <GraphDots points={points} activeIdx={tooltip.idx} dotsRef={dotsRef} />
      </svg>
      <GraphTooltip tooltip={tooltip} />
    </div>
  );
}

/* ─────────────────────────────────────────
   STYLES
───────────────────────────────────────── */

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #080c14; }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .prt-root {
    min-height: 100vh;
    background: #080c14;
    background-image:
      radial-gradient(ellipse at 15% 60%, rgba(56,189,248,0.05) 0%, transparent 55%),
      radial-gradient(ellipse at 85% 15%, rgba(129,140,248,0.05) 0%, transparent 55%);
    font-family: 'DM Sans', sans-serif;
    color: #e2e8f0;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 40px 20px 80px;
  }

  .prt-layout {
    width: 100%;
    max-width: 1200px;
    display: grid;
    grid-template-columns: 360px 1fr;
    gap: 22px;
    align-items: start;
  }

  @media (max-width: 820px) {
    .prt-layout { grid-template-columns: 1fr; }
  }

  .card {
    background: #0d1525;
    border: 1px solid #1a2740;
    border-radius: 20px;
    padding: 32px 28px;
    box-shadow: 0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03);
  }

  .card-tracker { animation: slideUp 0.5s ease both; }
  .card-graph   { animation: slideUp 0.5s 0.12s ease both; }

  .prt-title {
    font-family: 'Space Mono', monospace;
    font-size: 20px;
    font-weight: 700;
    line-height: 1.3;
    margin-bottom: 6px;
  }
  .prt-title em { font-style: normal; color: #38bdf8; }

  .week-badge {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    color: #3a526b;
    background: #0a1220;
    border: 1px solid #1a2740;
    border-radius: 6px;
    padding: 3px 9px;
    letter-spacing: 1px;
    display: inline-block;
    margin-top: 6px;
    margin-bottom: 28px;
  }

  .section { margin-bottom: 22px; }

  .label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.8px;
    text-transform: uppercase;
    color: #3a526b;
    margin-bottom: 9px;
  }

  .row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }

  .inp {
    flex: 1;
    min-width: 100px;
    padding: 9px 12px;
    background: #0a1220;
    border: 1px solid #1a2740;
    border-radius: 9px;
    color: #e2e8f0;
    font-family: 'Space Mono', monospace;
    font-size: 13px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .inp:focus {
    border-color: #38bdf8;
    box-shadow: 0 0 0 3px rgba(56,189,248,0.1);
  }
  .inp::placeholder { color: #1e3048; }

  .btn {
    padding: 9px 16px;
    border: none;
    border-radius: 9px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.15s, transform 0.1s;
    white-space: nowrap;
  }
  .btn:hover  { opacity: 0.82; }
  .btn:active { transform: scale(0.95); }
  .b-blue  { background: #0ea5e9; color: #fff; }
  .b-green { background: #10b981; color: #fff; }
  .b-red   { background: #ef4444; color: #fff; }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 9px;
    margin-bottom: 16px;
  }

  .stat {
    background: #0a1220;
    border: 1px solid #1a2740;
    border-radius: 11px;
    padding: 13px 12px;
  }
  .stat-label { font-size: 9px; color: #3a526b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 3px; }
  .stat-value { font-family: 'Space Mono', monospace; font-size: 18px; font-weight: 700; }

  .bar-bg {
    width: 100%;
    height: 10px;
    background: #0f1e35;
    border-radius: 5px;
    overflow: hidden;
    margin-bottom: 7px;
  }
  .bar-fill {
    height: 100%;
    border-radius: 5px;
    transition: width 0.55s cubic-bezier(.4,0,.2,1);
  }

  .status-row { display: flex; justify-content: space-between; align-items: center; }
  .status-text { font-size: 12px; font-weight: 700; letter-spacing: 0.5px; }
  .pct-text    { font-family: 'Space Mono', monospace; font-size: 12px; color: #3a526b; }

  .divider { border: none; border-top: 1px solid #1a2740; margin: 18px 0; }

  .hist-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 5px;
    max-height: 170px;
    overflow-y: auto;
    padding-right: 4px;
  }
  .hist-list::-webkit-scrollbar       { width: 3px; }
  .hist-list::-webkit-scrollbar-thumb { background: #1a2740; border-radius: 4px; }

  .hist-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #0a1220;
    border: 1px solid #1a2740;
    border-radius: 8px;
    padding: 7px 11px;
  }
  .hist-date  { color: #3a526b; font-family: 'Space Mono', monospace; font-size: 11px; }
  .hist-count { font-family: 'Space Mono', monospace; font-weight: 700; color: #38bdf8; font-size: 12px; }

  .graph-title { font-family: 'Space Mono', monospace; font-size: 17px; font-weight: 700; margin-bottom: 3px; }
  .graph-sub   { font-size: 12px; color: #3a526b; margin-bottom: 22px; }

  .graph-mini-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 24px;
  }
  .graph-mini {
    background: #0a1220;
    border: 1px solid #1a2740;
    border-radius: 10px;
    padding: 11px 13px;
  }
  .gm-label { font-size: 9px; color: #3a526b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 3px; }
  .gm-value { font-family: 'Space Mono', monospace; font-size: 17px; font-weight: 700; }

  .graph-legend {
    display: flex;
    gap: 18px;
    flex-wrap: wrap;
    margin-top: 18px;
    padding-top: 14px;
    border-top: 1px solid #1a2740;
    align-items: center;
  }
  .leg-item { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #3a526b; font-family: 'Space Mono', monospace; }
  .leg-dot  { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .leg-hint { margin-left: auto; font-size: 10px; color: #1e3048; }
`;

/* ─────────────────────────────────────────
   MAIN APP
───────────────────────────────────────── */

export default function PRT() {
  const WEEK_KEY = getWeekKey();

  const [loaded,     setLoaded]     = useState(false);
  const [weeklyGoal, setWeeklyGoal] = useState(0);
  const [completed,  setCompleted]  = useState(0);
  const [history,    setHistory]    = useState([]);
  const [goalInput,  setGoalInput]  = useState("");
  const [solvedInput, setSolvedInput] = useState("");

  /* Load persisted data */
  useEffect(() => {
    async function load() {
      const weekData = await storageGet(`week:${WEEK_KEY}`);
      if (weekData) {
        setWeeklyGoal(weekData.weeklyGoal ?? 0);
        setCompleted(weekData.completed  ?? 0);
      }
      const hist = await storageGet("history");
      if (hist) setHistory(hist);
      setLoaded(true);
    }
    load();
  }, [WEEK_KEY]);

  /* Persist week data */
  useEffect(() => {
    if (!loaded) return;
    storageSet(`week:${WEEK_KEY}`, { weeklyGoal, completed });
  }, [weeklyGoal, completed, loaded, WEEK_KEY]);

  /* Handlers */
  function handleSetGoal() {
    const g = parseInt(goalInput, 10);
    if (!g || g <= 0) return;
    setWeeklyGoal(g);
    setGoalInput("");
  }

  function handleAddSolved() {
    if (!weeklyGoal) { alert("Set a weekly goal first!"); return; }
    const v = parseInt(solvedInput, 10);
    if (!v || v <= 0) return;
    const newCompleted = completed + v;
    setCompleted(newCompleted);
    const entry      = { date: getTodayDate(), problems: v, week: WEEK_KEY };
    const newHistory = [entry, ...history];
    setHistory(newHistory);
    storageSet("history", newHistory);
    setSolvedInput("");
    if (newCompleted >= weeklyGoal) setTimeout(() => alert("🎉 Weekly Goal Completed!"), 100);
  }

  function handleReset() {
    if (!window.confirm("Reset this week's progress?")) return;
    setCompleted(0);
  }

  /* Derived values */
  const percentage   = weeklyGoal ? Math.min((completed / weeklyGoal) * 100, 100) : 0;
  const remaining    = Math.max(weeklyGoal - completed, 0);
  const totalAllTime = history.reduce((s, e) => s + e.problems, 0);
  const uniqueDays   = new Set(history.map((e) => e.date)).size;
  const dailyAvg     = uniqueDays ? Math.round(totalAllTime / uniqueDays) : 0;
  const bestDay      = getBestDay(history);

  let status = "No goal set";
  let color  = "#3a526b";
  if (weeklyGoal) {
    if (percentage < 40)      { status = "Lagging Behind"; color = "#ef4444"; }
    else if (percentage < 80) { status = "Keep Pushing";   color = "#f97316"; }
    else                      { status = "On Track 🔥";    color = "#10b981"; }
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="prt-root">
        <div className="prt-layout">

          {/* ── TRACKER ── */}
          <div className="card card-tracker">
            <div className="prt-title">Placement<br /><em>Readiness</em> Tracker</div>
            <div className="week-badge">WEEK · {WEEK_KEY}</div>

            <div className="section">
              <div className="label">Weekly Goal</div>
              <div className="row">
                <input className="inp" type="number" min="1" value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSetGoal()}
                  placeholder="e.g. 50"
                />
                <button className="btn b-blue" onClick={handleSetGoal}>Set Goal</button>
              </div>
            </div>

            <div className="section">
              <div className="label">Log Problems Solved</div>
              <div className="row">
                <input className="inp" type="number" min="1" value={solvedInput}
                  onChange={(e) => setSolvedInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddSolved()}
                  placeholder="Today's count"
                />
                <button className="btn b-green" onClick={handleAddSolved}>Add</button>
                <button className="btn b-red"   onClick={handleReset}>Reset</button>
              </div>
            </div>

            <hr className="divider" />

            <div className="section">
              <div className="label">Progress</div>
              <div className="stats-grid">
                <div className="stat">
                  <div className="stat-label">Goal</div>
                  <div className="stat-value" style={{ color: "#38bdf8" }}>{weeklyGoal}</div>
                </div>
                <div className="stat">
                  <div className="stat-label">Done</div>
                  <div className="stat-value" style={{ color: "#10b981" }}>{completed}</div>
                </div>
                <div className="stat">
                  <div className="stat-label">Left</div>
                  <div className="stat-value" style={{ color: "#f97316" }}>{remaining}</div>
                </div>
              </div>
              <div className="bar-bg">
                <div className="bar-fill" style={{ width: `${percentage}%`, background: color }} />
              </div>
              <div className="status-row">
                <span className="status-text" style={{ color }}>{status}</span>
                <span className="pct-text">{percentage.toFixed(1)}%</span>
              </div>
            </div>

            <hr className="divider" />

            <div>
              <div className="label">Daily History</div>
              {history.length === 0
                ? <p style={{ color: "#1e3048", fontSize: 13 }}>No logs yet</p>
                : (
                  <ul className="hist-list">
                    {history.map((item, i) => (
                      <li className="hist-item" key={i}>
                        <span className="hist-date">{item.date}</span>
                        <span className="hist-count">+{item.problems}</span>
                      </li>
                    ))}
                  </ul>
                )
              }
            </div>
          </div>

          {/* ── GRAPH ── */}
          <div className="card card-graph">
            <div className="graph-title">Daily Progression</div>
            <div className="graph-sub">Hover over any point to see details · last 14 days</div>

            <div className="graph-mini-grid">
              <div className="graph-mini">
                <div className="gm-label">All-Time</div>
                <div className="gm-value" style={{ color: "#38bdf8" }}>{totalAllTime}</div>
              </div>
              <div className="graph-mini">
                <div className="gm-label">Daily Avg</div>
                <div className="gm-value" style={{ color: "#10b981" }}>{dailyAvg}</div>
              </div>
              <div className="graph-mini">
                <div className="gm-label">Best Day</div>
                <div className="gm-value" style={{ color: "#f59e0b" }}>{bestDay}</div>
              </div>
            </div>

            <DailyGraph history={history} />

            <div className="graph-legend">
              <div className="leg-item">
                <div className="leg-dot" style={{ background: "linear-gradient(90deg,#818cf8,#38bdf8)" }} />
                Problems / Day
              </div>
              <div className="leg-item">
                <div className="leg-dot" style={{ background: "#10b981" }} />
                Cumulative Total
              </div>
              <div className="leg-hint">← hover dots to inspect</div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

// import { useState, useEffect } from "react";

// /* ── ISO week number (Monday-based, reliable) ── */
// function getISOWeek(date = new Date()) {
//   const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
//   const dayNum = d.getUTCDay() || 7;
//   d.setUTCDate(d.getUTCDate() + 4 - dayNum);
//   const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
//   return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
// }

// function getWeekKey(date = new Date()) {
//   return `${date.getFullYear()}-W${String(getISOWeek(date)).padStart(2, "0")}`;
// }

// function getTodayDate() {
//   return new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
// }

// /* ── Storage helpers (window.storage API) ── */
// async function storageGet(key) {
//   try {
//     const res = await window.storage.get(key);
//     return res ? JSON.parse(res.value) : null;
//   } catch {
//     return null;
//   }
// }

// async function storageSet(key, value) {
//   try {
//     await window.storage.set(key, JSON.stringify(value));
//   } catch (e) {
//     console.error("Storage error:", e);
//   }
// }

// /* ── CSS injected once ── */
// const CSS = `
//   @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');

//   *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

//   body { background: #080c14; }

//   .prt-root {
//     min-height: 100vh;
//     background: #080c14;
//     font-family: 'DM Sans', sans-serif;
//     color: #e2e8f0;
//     display: flex;
//     justify-content: center;
//     align-items: flex-start;
//     padding: 40px 20px 60px;
//   }

//   .prt-card {
//     width: 100%;
//     max-width: 780px;
//     background: #0d1525;
//     border: 1px solid #1e2d45;
//     border-radius: 20px;
//     padding: 44px 48px;
//     box-shadow: 0 30px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04);
//   }

//   .prt-header {
//     display: flex;
//     align-items: flex-start;
//     justify-content: space-between;
//     margin-bottom: 40px;
//     flex-wrap: wrap;
//     gap: 12px;
//   }

//   .prt-title {
//     font-family: 'Space Mono', monospace;
//     font-size: 26px;
//     font-weight: 700;
//     letter-spacing: -0.5px;
//     line-height: 1.2;
//   }

//   .prt-title span {
//     color: #38bdf8;
//   }

//   .prt-week-badge {
//     font-family: 'Space Mono', monospace;
//     font-size: 11px;
//     color: #475569;
//     background: #111c2e;
//     border: 1px solid #1e2d45;
//     border-radius: 6px;
//     padding: 6px 12px;
//     letter-spacing: 1px;
//     white-space: nowrap;
//   }

//   .prt-section {
//     margin-bottom: 32px;
//   }

//   .prt-label {
//     font-size: 11px;
//     font-weight: 600;
//     letter-spacing: 1.5px;
//     text-transform: uppercase;
//     color: #475569;
//     margin-bottom: 12px;
//   }

//   .prt-row {
//     display: flex;
//     gap: 10px;
//     align-items: center;
//     flex-wrap: wrap;
//   }

//   .prt-input {
//     flex: 1;
//     min-width: 120px;
//     max-width: 220px;
//     padding: 10px 14px;
//     background: #111c2e;
//     border: 1px solid #1e2d45;
//     border-radius: 10px;
//     color: #e2e8f0;
//     font-family: 'Space Mono', monospace;
//     font-size: 14px;
//     outline: none;
//     transition: border-color 0.2s;
//   }

//   .prt-input:focus {
//     border-color: #38bdf8;
//   }

//   .prt-input::placeholder {
//     color: #334155;
//   }

//   .prt-btn {
//     padding: 10px 20px;
//     border: none;
//     border-radius: 10px;
//     font-family: 'DM Sans', sans-serif;
//     font-size: 14px;
//     font-weight: 600;
//     cursor: pointer;
//     transition: opacity 0.15s, transform 0.1s;
//     white-space: nowrap;
//   }

//   .prt-btn:hover { opacity: 0.85; }
//   .prt-btn:active { transform: scale(0.97); }

//   .btn-blue  { background: #0ea5e9; color: #fff; }
//   .btn-green { background: #10b981; color: #fff; }
//   .btn-red   { background: #ef4444; color: #fff; }

//   /* ── Progress panel ── */
//   .prt-stats-grid {
//     display: grid;
//     grid-template-columns: repeat(3, 1fr);
//     gap: 14px;
//     margin-bottom: 24px;
//   }

//   .prt-stat {
//     background: #111c2e;
//     border: 1px solid #1e2d45;
//     border-radius: 12px;
//     padding: 16px 18px;
//   }

//   .prt-stat-label {
//     font-size: 11px;
//     color: #475569;
//     text-transform: uppercase;
//     letter-spacing: 1px;
//     margin-bottom: 6px;
//   }

//   .prt-stat-value {
//     font-family: 'Space Mono', monospace;
//     font-size: 22px;
//     font-weight: 700;
//   }

//   /* ── Progress bar ── */
//   .prt-bar-bg {
//     width: 100%;
//     height: 12px;
//     background: #1e2d45;
//     border-radius: 6px;
//     overflow: hidden;
//     margin-bottom: 10px;
//   }

//   .prt-bar-fill {
//     height: 100%;
//     border-radius: 6px;
//     transition: width 0.4s cubic-bezier(.4,0,.2,1);
//   }

//   .prt-status {
//     font-size: 13px;
//     font-weight: 600;
//     letter-spacing: 0.5px;
//   }

//   /* ── History ── */
//   .prt-history-list {
//     list-style: none;
//     display: flex;
//     flex-direction: column;
//     gap: 8px;
//     max-height: 260px;
//     overflow-y: auto;
//     padding-right: 4px;
//   }

//   .prt-history-list::-webkit-scrollbar { width: 4px; }
//   .prt-history-list::-webkit-scrollbar-thumb { background: #1e2d45; border-radius: 4px; }

//   .prt-history-item {
//     display: flex;
//     justify-content: space-between;
//     align-items: center;
//     background: #111c2e;
//     border: 1px solid #1e2d45;
//     border-radius: 10px;
//     padding: 10px 16px;
//     font-size: 13px;
//     animation: slideIn 0.2s ease;
//   }

//   @keyframes slideIn {
//     from { opacity: 0; transform: translateY(-6px); }
//     to   { opacity: 1; transform: translateY(0); }
//   }

//   .prt-history-date { color: #64748b; font-family: 'Space Mono', monospace; font-size: 12px; }
//   .prt-history-count { font-family: 'Space Mono', monospace; font-weight: 700; color: #38bdf8; }

//   .prt-empty { color: #334155; font-size: 14px; padding: 20px 0; }

//   .prt-divider {
//     border: none;
//     border-top: 1px solid #1e2d45;
//     margin: 32px 0;
//   }

//   @media (max-width: 520px) {
//     .prt-card { padding: 28px 20px; }
//     .prt-stats-grid { grid-template-columns: 1fr 1fr; }
//     .prt-title { font-size: 20px; }
//   }
// `;

// export default function PRT() {
//   /* ── State ── */
//   const [loaded, setLoaded] = useState(false);
//   const [weeklyGoal, setWeeklyGoal] = useState(0);
//   const [completed, setCompleted] = useState(0);
//   const [history, setHistory] = useState([]);        // full all-time history
//   const [goalInput, setGoalInput] = useState("");
//   const [solvedInput, setSolvedInput] = useState("");

//   const currentWeekKey = getWeekKey();

//   /* ── Load persisted data on mount ── */
//   useEffect(() => {
//     (async () => {
//       // Load this week's snapshot
//       const weekData = await storageGet(`week:${currentWeekKey}`);
//       if (weekData) {
//         setWeeklyGoal(weekData.weeklyGoal ?? 0);
//         setCompleted(weekData.completed ?? 0);
//       }
//       // Load full history
//       const hist = await storageGet("history");
//       if (hist) setHistory(hist);
//       setLoaded(true);
//     })();
//   }, []); // eslint-disable-line react-hooks/exhaustive-deps

//   /* ── Persist week data whenever goal/completed change (after load) ── */
//   useEffect(() => {
//     if (!loaded) return;
//     storageSet(`week:${currentWeekKey}`, { weeklyGoal, completed });
//   }, [weeklyGoal, completed, loaded]); // eslint-disable-line react-hooks/exhaustive-deps

//   /* ── Handlers ── */
//   const handleSetGoal = () => {
//     const g = parseInt(goalInput, 10);
//     if (!g || g <= 0) return;
//     setWeeklyGoal(g);
//     // Don't reset completed — user may update goal mid-week
//     setGoalInput("");
//   };

//   const handleAddSolved = () => {
//     if (!weeklyGoal) { alert("Set a weekly goal first!"); return; }
//     const v = parseInt(solvedInput, 10);
//     if (!v || v <= 0) return;

//     const newCompleted = completed + v;
//     setCompleted(newCompleted);

//     const entry = { date: getTodayDate(), problems: v, week: currentWeekKey };
//     const newHistory = [entry, ...history]; // newest first
//     setHistory(newHistory);
//     storageSet("history", newHistory);

//     setSolvedInput("");
//     if (newCompleted >= weeklyGoal) alert("🎉 Weekly Goal Completed!");
//   };

//   const handleReset = () => {
//     if (!window.confirm("Reset this week's progress?")) return;
//     setCompleted(0);
//   };

//   /* ── Calculations ── */
//   const percentage = weeklyGoal ? Math.min((completed / weeklyGoal) * 100, 100) : 0;
//   const remaining  = Math.max(weeklyGoal - completed, 0);

//   let status = "No goal set";
//   let color  = "#475569";
//   if (weeklyGoal) {
//     if (percentage < 40)      { status = "Lagging Behind"; color = "#ef4444"; }
//     else if (percentage < 80) { status = "Keep Pushing";   color = "#f97316"; }
//     else                      { status = "On Track 🔥";    color = "#10b981"; }
//   }

//   /* ── Render ── */
//   return (
//     <>
//       <style>{CSS}</style>
//       <div className="prt-root">
//         <div className="prt-card">

//           {/* Header */}
//           <div className="prt-header">
//             <h1 className="prt-title">Placement<br /><span>Readiness</span> Tracker</h1>
//             <div className="prt-week-badge">WEEK · {currentWeekKey}</div>
//           </div>

//           {/* Set Goal */}
//           <div className="prt-section">
//             <div className="prt-label">Weekly Goal</div>
//             <div className="prt-row">
//               <input
//                 className="prt-input"
//                 type="number"
//                 min="1"
//                 value={goalInput}
//                 onChange={e => setGoalInput(e.target.value)}
//                 onKeyDown={e => e.key === "Enter" && handleSetGoal()}
//                 placeholder="e.g. 50"
//               />
//               <button className="prt-btn btn-blue" onClick={handleSetGoal}>Set Goal</button>
//             </div>
//           </div>

//           {/* Add Progress */}
//           <div className="prt-section">
//             <div className="prt-label">Log Problems Solved</div>
//             <div className="prt-row">
//               <input
//                 className="prt-input"
//                 type="number"
//                 min="1"
//                 value={solvedInput}
//                 onChange={e => setSolvedInput(e.target.value)}
//                 onKeyDown={e => e.key === "Enter" && handleAddSolved()}
//                 placeholder="Today's count"
//               />
//               <button className="prt-btn btn-green" onClick={handleAddSolved}>Add</button>
//               <button className="prt-btn btn-red"   onClick={handleReset}>Reset Week</button>
//             </div>
//           </div>

//           <hr className="prt-divider" />

//           {/* Stats */}
//           <div className="prt-section">
//             <div className="prt-label">Progress</div>
//             <div className="prt-stats-grid">
//               <div className="prt-stat">
//                 <div className="prt-stat-label">Goal</div>
//                 <div className="prt-stat-value" style={{ color: "#38bdf8" }}>{weeklyGoal}</div>
//               </div>
//               <div className="prt-stat">
//                 <div className="prt-stat-label">Completed</div>
//                 <div className="prt-stat-value" style={{ color: "#10b981" }}>{completed}</div>
//               </div>
//               <div className="prt-stat">
//                 <div className="prt-stat-label">Remaining</div>
//                 <div className="prt-stat-value" style={{ color: "#f97316" }}>{remaining}</div>
//               </div>
//             </div>

//             <div className="prt-bar-bg">
//               <div
//                 className="prt-bar-fill"
//                 style={{ width: `${percentage}%`, background: color }}
//               />
//             </div>
//             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//               <span className="prt-status" style={{ color }}>{status}</span>
//               <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "13px", color: "#475569" }}>
//                 {percentage.toFixed(1)}%
//               </span>
//             </div>
//           </div>

//           <hr className="prt-divider" />

//           {/* History */}
//           <div className="prt-section">
//             <div className="prt-label">Daily History</div>
//             {history.length === 0
//               ? <p className="prt-empty">No logs yet — start solving!</p>
//               : (
//                 <ul className="prt-history-list">
//                   {history.map((item, i) => (
//                     <li className="prt-history-item" key={i}>
//                       <span className="prt-history-date">{item.date}</span>
//                       <span className="prt-history-count">+{item.problems} problems</span>
//                     </li>
//                   ))}
//                 </ul>
//               )
//             }
//           </div>

//         </div>
//       </div>
//     </>
//   );
// }