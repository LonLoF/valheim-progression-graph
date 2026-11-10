import { Page, Section, Input, Segmented, Legend, Text, Table, Callout, useGrokTheme, useState, useMemo, useRef, useEffect } from "grok/canvas";
import type { CSSProperties, ReactNode } from "grok/canvas";

import {
  D, type N, b, ok, LANES, LANE_SUB, GROUPS, GL, SUB_EN, DEF_CLOSED,
  isCre, isBuilt, HAMMER, COINS, TRIDX, KINDS, UPS, EK, EXV, xl,
  DROPPERS, SELLS, GATES, UPGR, VALS, DOWNS, closure, COUNTS, KINDC, isStructEdge, splitUpgradeLabel,
} from "../graph";
import { DetailExtras } from "../details";
import { handleSearchKey } from "../keys";
import { sortedItems } from "../order";
import { PlayerBar } from "../playerTools";
import { evaluateProgress, useProgress } from "../progress";
import { useAppUrl } from "../urlState";
import { useViewport } from "../viewport";
import { DetailTabs, FarmRank, FoodBadge, FoodFilters, NextBetter, PanelActions, passesFood } from "../widgets";
import type { FoodRole } from "../graph";

function groupShown(gi: number[], closedGroup: boolean, sel: number | null, up: Set<number>, down: Set<number>): number[] {
  return closedGroup ? gi.filter((i) => i === sel || up.has(i) || down.has(i)) : gi;
}

type Seg = { d: string; c: string; dash: boolean };

// Same hall skin as the compact view: wood, iron, runes, ember selection, parchment notes.
const RUNE = "'Cinzel', 'Cinzel Fallback', 'Cinzel System', 'Norse', 'Trajan Pro', 'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif";
const BODY = "'Alegreya', 'Alegreya Fallback', 'Alegreya System', 'IM Fell English', 'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif";
const RUNIC = "'Noto Sans Runic', 'Segoe UI Historic', 'Segoe UI Symbol', serif";
const INK = { hi: "#f3e6c8", mid: "#d8c49c", lo: "#b3a084", dark: "#2a1b0e", amber: "#e8b04f" };
const SKIN_CSS = ".vh-in::placeholder{color:#a8957a;opacity:1}.vh-scroll::-webkit-scrollbar{width:8px;height:6px}.vh-scroll::-webkit-scrollbar-thumb{background:#6e5232;border-radius:4px}.vh-scroll::-webkit-scrollbar-track{background:transparent}";
const NOISE = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.20 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";
const GRAIN = "repeating-linear-gradient(91deg, rgba(0,0,0,0.10) 0px, rgba(0,0,0,0.10) 2px, rgba(255,230,190,0.018) 2px, rgba(255,230,190,0.018) 6px, rgba(0,0,0,0.05) 6px, rgba(0,0,0,0.05) 11px)";
const BIOME: [string, string, string][] = [
  ["#46542a", "#1b220f", "#d8cf78"],
  ["#1f3a28", "#0a140e", "#7fb48a"],
  ["#33402a", "#0e1c1b", "#8fb59a"],
  ["#3e5064", "#141c26", "#d6e8f6"],
  ["#5c4b20", "#21180a", "#f0cc6c"],
  ["#3d2f50", "#140e1c", "#c4a6e4"],
  ["#521a12", "#100505", "#ff7a45"],
  ["#4f5e6c", "#1a2129", "#eaf4fb"],
  ["#16385a", "#06111d", "#7cc0e2"],
];
const BRUNE = ["ᚠ", "ᚢ", "ᚦ", "ᚺ", "ᛃ", "ᛈ", "ᚲ", "ᛁ", "ᛚ"];

export default function App() {
  const theme = useGrokTheme();
  const { state: url, commit, back } = useAppUrl();
  const progress = useProgress();
  const marks = useMemo(() => evaluateProgress(progress), [progress]);
  const q = url.q;
  const sel = url.item;
  const depth = url.chain ? "all" : "1";
  const [food, setFood] = useState<FoodRole | "all">("all");
  const [hidden, setHidden] = useState<string[]>([]);
  const [closed, setClosed] = useState<string[]>(DEF_CLOSED);
  // Read the real viewport on the first paint so a phone does not draw the
  // desktop lanes and then jump.
  const [width, setWidth] = useState(() => (typeof window !== "undefined" ? window.innerWidth : 1000));
  const [tick, setTick] = useState(0);
  const [paths, setPaths] = useState<Seg[]>([]);
  const [box, setBox] = useState<[number, number]>([0, 0]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const chips = useRef<Map<number, HTMLElement>>(new Map());
  const qRef = useRef(q);
  const resultIdsRef = useRef<number[]>([]);
  const selectRef = useRef<(index: number | null) => void>(() => {});
  const setQRef = useRef<(value: string) => void>(() => {});
  qRef.current = q;
  const viewport = useViewport();
  const wide = !viewport.portrait && width >= 760;
  const KC: Record<string, string> = KINDC;
  const upC = theme.text.primary;
  const downC = theme.text.secondary;

  const upSet = useMemo(() => (sel === null ? new Set<number>() : depth === "all" ? closure(sel, UPS) : new Set<number>(UPS[sel])), [sel, depth]);
  const downSet = useMemo(() => (sel === null ? new Set<number>() : depth === "all" ? closure(sel, DOWNS) : new Set<number>(DOWNS[sel])), [sel, depth]);
  const ql = q.trim().toLowerCase();

  const visible = useMemo(() => D.map((r: N, i: number) => {
    const linked = sel !== null && (i === sel || upSet.has(i) || downSet.has(i));
    // A selection with an empty query keeps only the chain, so the lanes fit the screen.
    if (sel !== null && !ql) return linked;
    if (linked) return true;
    if (!passesFood(i, food)) return false;
    if (hidden.indexOf(r.t) >= 0) return false;
    if (ql && r.n.toLowerCase().indexOf(ql) < 0) return false;
    return true;
  }), [ql, hidden, sel, upSet, downSet, food]);
  const visCount = visible.filter((v: boolean) => v).length;
  const resultIds = useMemo(() => {
    const ids: number[] = [];
    for (let li = 0; li < LANES.length; li++) {
      const idxs: number[] = [];
      for (let i = 0; i < D.length; i++) if (D[i].l === li && visible[i]) idxs.push(i);
      GROUPS.forEach(([g]) => {
        const gi = idxs.filter((i) => D[i].t === g);
        if (!gi.length) return;
        const shown = groupShown(gi, closed.indexOf(g) >= 0 && !ql, sel, upSet, downSet);
        const matched = ql ? shown.filter((i) => D[i].n.toLowerCase().includes(ql)) : shown;
        ids.push(...sortedItems(matched));
      });
    }
    return ids;
  }, [visible, closed, ql, sel, upSet, downSet]);
  resultIdsRef.current = resultIds;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      handleSearchKey(e, {
        getQuery: () => qRef.current,
        clearQuery: () => setQRef.current(""),
        closePanel: () => selectRef.current(null),
        openIndex: (i: number) => selectRef.current(i),
        getResultIds: () => resultIdsRef.current,
      });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => { setWidth(el.clientWidth); setTick((t: number) => t + 1); });
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const c = contentRef.current;
    if (!c) return;
    const cr = c.getBoundingClientRect();
    setBox([c.scrollWidth, c.scrollHeight]);
    if (sel === null) { setPaths([]); return; }
    const edges: [number, number, boolean][] = [];
    if (depth === "all") {
      [sel, ...Array.from(upSet)].forEach((n: number) => UPS[n].forEach((u: number) => { if (upSet.has(u)) edges.push([u, n, false]); }));
      [sel, ...Array.from(downSet)].forEach((n: number) => DOWNS[n].forEach((d: number) => { if (downSet.has(d)) edges.push([n, d, true]); }));
    } else {
      UPS[sel].forEach((u: number) => edges.push([u, sel, false]));
      DOWNS[sel].forEach((d: number) => edges.push([sel, d, true]));
    }
    const out: Seg[] = [];
    edges.slice(0, 400).forEach(([a, bb, dn]: [number, number, boolean]) => {
      const ea = chips.current.get(a); const eb = chips.current.get(bb);
      if (!ea || !eb) return;
      const ra = ea.getBoundingClientRect(); const rb = eb.getBoundingClientRect();
      const ax = ra.left - cr.left + ra.width / 2, ay = ra.top - cr.top + ra.height / 2;
      const bx = rb.left - cr.left + rb.width / 2, by = rb.top - cr.top + rb.height / 2;
      const dx = bx - ax, dy = by - ay;
      let d = "";
      if (Math.abs(dx) >= Math.abs(dy)) {
        const sx = dx >= 0 ? ax + ra.width / 2 : ax - ra.width / 2;
        const ex = dx >= 0 ? bx - rb.width / 2 : bx + rb.width / 2;
        const o = Math.max(30, Math.abs(ex - sx) / 2) * (dx >= 0 ? 1 : -1);
        d = `M${sx},${ay} C${sx + o},${ay} ${ex - o},${by} ${ex},${by}`;
      } else {
        const sy = dy >= 0 ? ay + ra.height / 2 : ay - ra.height / 2;
        const ey = dy >= 0 ? by - rb.height / 2 : by + rb.height / 2;
        const o = Math.max(20, Math.abs(ey - sy) / 2) * (dy >= 0 ? 1 : -1);
        d = `M${ax},${sy} C${ax},${sy + o} ${bx},${ey - o} ${bx},${ey}`;
      }
      out.push({ d, c: KC[EK.get(a + ">" + bb) || "o"], dash: dn });
    });
    setPaths(out);
  }, [sel, depth, upSet, downSet, visible, closed, tick, wide]);

  useEffect(() => {
    if (sel !== null && panelRef.current) panelRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
    if (sel == null) return;
    const chip = document.querySelector(`[data-vh-id="${sel}"]`);
    chip?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [sel]);
  useEffect(() => {
    document.body.classList.toggle("vh-selection", sel !== null);
    document.documentElement.classList.toggle("vh-selection", sel !== null);
    return () => {
      document.body.classList.remove("vh-selection");
      document.documentElement.classList.remove("vh-selection");
    };
  }, [sel]);

  const setQ = (value: string) => commit({ q: value }, "replace");
  const selectItem = (i: number | null) => {
    if (i == null) commit({ item: null }, "push");
    else commit({ item: i, biome: D[i].l }, "push");
  };
  selectRef.current = selectItem;
  setQRef.current = setQ;
  const pick = (i: number) => selectItem(sel === i ? null : i);
  const toggle = (arr: string[], k: string): string[] => (arr.indexOf(k) >= 0 ? arr.filter((x: string) => x !== k) : [...arr, k]);

  const muted = { ...theme.font.label, fontFamily: BODY, color: INK.mid };
  const parchMeta = { ...theme.font.label, fontFamily: BODY, color: "#5a4128" };
  const h3 = { fontFamily: RUNE, fontSize: "15px", lineHeight: "20px", fontWeight: 700, letterSpacing: "0.04em", color: "#6a3211", marginTop: 10, marginBottom: 4 };
  const pill = (on: boolean) => ({ ...theme.font.label, fontFamily: BODY, fontSize: "13px", cursor: "pointer", padding: "4px 10px", borderRadius: 4, whiteSpace: "nowrap" as const, border: `1px solid ${on ? "#ffb25e" : "#7a5a36"}`, background: on ? "linear-gradient(180deg, #b45c1f 0%, #6e3110 100%)" : "linear-gradient(180deg, #3d2e20 0%, #22180f 100%)", color: on ? "#fff3dc" : INK.mid, boxShadow: on ? "0 0 10px rgba(255,140,50,0.45), inset 0 1px 0 rgba(255,220,170,0.35)" : "inset 0 1px 0 rgba(255,225,170,0.10), 0 1px 2px rgba(0,0,0,0.6)", textShadow: "0 1px 1px rgba(0,0,0,0.7)", userSelect: "none" as const });
  const rivet = (pos: { top?: number; left?: number; right?: number; bottom?: number }) => <span style={{ position: "absolute", width: 8, height: 8, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, #e0d3b8 0%, #857259 35%, #2b2219 80%)", boxShadow: "0 1px 1px rgba(0,0,0,0.8)", pointerEvents: "none", ...pos }} />;
  const ek = (a: number, z: number): string => KC[EK.get(a + ">" + z) || "o"];

  const chip = (i: number) => {
    const r = D[i];
    const isSel = sel === i, isUp = upSet.has(i), isDown = downSet.has(i);
    const dim = sel !== null && !isSel && !isUp && !isDown;
    const color = isSel ? "#ffb25e" : sel !== null && depth === "1" && isUp ? ek(i, sel) : sel !== null && depth === "1" && isDown ? ek(sel, i) : isUp || isDown ? "#d9a44e" : "#6e5232";
    const inResults = !ql || r.n.toLowerCase().includes(ql);
    const mark = marks[i];
    const showGate = !!mark?.gated;
    const showCraft = !!mark?.craftable;
    return (
      <button
        type="button"
        key={"c" + i}
        className={"vh-btn vh-chip" + (showGate ? " vh-gated" : "") + (showCraft ? " vh-craftable" : "")}
        data-vh-result={inResults ? "" : undefined}
        data-vh-id={inResults ? i : undefined}
        data-vh-name={inResults ? r.n : undefined}
        data-vh-gated={showGate ? "" : undefined}
        data-vh-craftable={showCraft ? "" : undefined}
        data-vh-owned={mark?.owned ? "" : undefined}
        aria-pressed={isSel}
        ref={(el: HTMLButtonElement | null) => { if (el) chips.current.set(i, el); else chips.current.delete(i); }}
        onClick={() => pick(i)}
        style={{
          ...theme.font.label, fontFamily: BODY, fontSize: "13px", display: "inline-flex", alignItems: "center", padding: "4px 9px", borderRadius: 4, cursor: "pointer",
          border: `${isSel || isUp || isDown ? 2 : 1}px ${isDown && !isUp ? "dashed" : "solid"} ${color}`,
          background: isSel ? "linear-gradient(180deg, #7a3a14 0%, #4a210b 100%)" : "linear-gradient(180deg, #45321f 0%, #2b1e13 100%)", color: INK.hi, opacity: showGate && !isSel ? 0.42 : dim ? 0.3 : 1,
          boxShadow: isSel ? "0 0 10px rgba(255,140,50,0.55)" : showCraft ? "0 0 10px rgba(232,176,79,0.8), inset 0 0 0 1px #e8b04f" : "inset 0 1px 0 rgba(255,225,170,0.10), 0 1px 2px rgba(0,0,0,0.6)",
          fontWeight: r.t === "B" || r.t === "M" || r.t === "T" || isSel ? 700 : 400,
          transition: theme.motion.hover, position: "relative", zIndex: 1, maxWidth: "100%",
        }}
          >{r.n}{r.v === 0 ? " ?" : ""}<FoodBadge index={i} /></button>
    );
  };
  const link = (i: number, extra?: string, c?: string, level?: string) => (ok(i) ?
    <button type="button" key={"k" + i + (extra || "")} className="vh-btn vh-chip" data-vh-jump="" data-vh-name={D[i].n} onClick={() => selectItem(i)} style={{ ...theme.font.label, fontFamily: BODY, fontSize: "13px", cursor: "pointer", display: "inline-flex", gap: 4, alignItems: "baseline", padding: "3px 8px", borderRadius: 4, border: `2px solid ${c || "#6e5232"}`, background: "linear-gradient(180deg, #4a3522 0%, #2e2015 100%)", color: INK.hi, boxShadow: "0 1px 2px rgba(0,0,0,0.45)" }}>
      {extra ? extra + " " : ""}{D[i].n}{level ? ` (${level})` : ""} <span style={{ color: "#cdb98f" }}>· {LANES[D[i].l]}</span>
    </button> : null
  );
  const row = (label: string, body: ReactNode, k: string) => (
    <div key={k} style={{ ...theme.font.body2, fontFamily: BODY, color: "#3b2a18", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "baseline", marginBottom: 4 }}>
      <span style={{ ...parchMeta, minWidth: 90 }}>{label}</span>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "baseline", flex: "1 1 200px" }}>{body}</div>
    </div>
  );
  const wrapL = (els: ReactNode[]) => <ul className="vh-chips" style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{els.map((el, n) => (el ? <li key={n}>{el}</li> : null))}</ul>;
  const ul = (i: number) => (ok(i) ? <button type="button" className="vh-btn" data-vh-jump="" data-vh-name={D[i].n} onClick={() => selectItem(i)} style={{ fontFamily: BODY, fontSize: "13px", lineHeight: "18px", textDecoration: "underline", cursor: "pointer", color: "#6a3211", background: "transparent", border: 0, padding: 0 }}>{D[i].n}</button> : null);
  const TN: Record<string, string> = { H: "Haldor", h: "Hildir", W: "Bog Witch" };

  const srcRows = (r: N): ReactNode[] => r.src.map((t: string, k: number) => {
    const c = t[0], body = t.slice(1);
    if (c === "g") {
      const at = body.indexOf("@");
      const objs = at >= 0 ? body.slice(0, at) : body;
      return row("Gathered", <span>{objs ? objs.split(",").join(", ") : "picked up / harvested in the world"}{at >= 0 ? <span> · needs {ul(b(body.slice(at + 1)))}</span> : null}</span>, "s" + k);
    }
    if (c === "f") return row("Found in", <span>{body.split("").map((x: string) => LANES[+x]).join(", ")} (chests, ruins)</span>, "s" + k);
    if (c === "t") {
      const at = body.indexOf("@");
      const price = at >= 0 ? body.slice(1, at) : body.slice(1);
      return row("Bought from", <span>{ul(TRIDX[body[0]])} for {price} Coins{at >= 0 ? <span> · available after {ul(b(body.slice(at + 1)))}</span> : null}</span>, "s" + k);
    }
    if (c === "v") return row("Sell", <span>to any trader (Haldor, Hildir, Bog Witch) for {body} {ul(COINS)} each</span>, "s" + k);
    if (c === "l") return row("Laid by", link(b(body), "", KC.o), "s" + k);
    if (c === "e") return row("Upgrades", link(b(body), "", KC.b), "s" + k);
    if (c === "k") return row("Key", link(b(body), "", KC.o), "s" + k);
    if (c === "b") return row("Bait", link(b(body), "", KC.o), "s" + k);
    return row("Note", <span>{body}</span>, "s" + k);
  });

  const panel = () => {
    if (sel === null) return null;
    const r = D[sel];
    const cre = isCre(sel);
    const built = isBuilt(sel);
    const shown = new Set<number>();
    const craftedHere = r.t === "S" ? DOWNS[sel].filter((u: number) => !isBuilt(u) && D[u].st.indexOf(sel) >= 0) : [];
    const builtNear = r.t === "S" ? DOWNS[sel].filter((u: number) => isBuilt(u) && D[u].st.indexOf(sel) >= 0 && UPGR[sel].indexOf(u) < 0) : [];
    const gated = GATES[sel];
    const sells = SELLS[sel];
    const spentAt = sel === COINS ? Object.keys(TRIDX).map((k: string) => TRIDX[k]).filter(ok) : [];
    [...craftedHere, ...builtNear, ...UPGR[sel], ...gated, ...sells.map((s: [number, string, number]) => s[0]), ...spentAt].forEach((x: number) => shown.add(x));
    if (cre) r.dr.forEach((d: string[]) => shown.add(b(d[0])));
    if (r.t === "T") shown.add(COINS);
    const uses = DOWNS[sel].filter((u: number) => !shown.has(u) && !isStructEdge(sel, u));
    const raw = depth === "all" ? Array.from(upSet).filter((n: number) => UPS[n].length === 0) : [];
    const stations = r.st.filter((s: number) => s >= 0);
    const stTxt = stations.map((s: number) => D[s].n).join(" → ");
    const ext = r.src.filter((t: string) => t[0] === "e").map((t: string) => b(t.slice(1)));
    const xr = r.ex.filter((t: string) => "uap".indexOf(t[0]) >= 0);
    const fuel = r.ex.filter((t: string) => t[0] === "F").map((t: string) => b(t.slice(1)));
    const sec = (title: string, body: ReactNode) => <div><div style={h3}>{title}</div>{body}</div>;
    return (
      <div ref={panelRef} key="panel" data-vh-panel="" style={{ border: "1px solid #8a6a3e", borderRadius: 6, padding: 14, background: `${NOISE}, radial-gradient(ellipse at 50% 35%, #f1e3c0 0%, #e4cf9f 65%, #c8aa72 100%)`, boxShadow: "inset 0 0 30px rgba(110,70,30,0.45), 0 3px 10px rgba(0,0,0,0.6)", color: INK.dark, fontFamily: BODY, width: "100%", boxSizing: "border-box", position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div>
            <div data-vh-title="" style={{ fontFamily: RUNE, fontSize: "22px", lineHeight: "28px", fontWeight: 700, letterSpacing: "0.02em", color: INK.dark }}>{r.n}</div>
            <div style={parchMeta}>{LANES[r.l]} · {GL[r.t]}{r.sub ? ` · ${SUB_EN[r.sub] || r.sub}` : ""}{r.eats.length ? " · tameable" : ""}</div>
          </div>
          <PanelActions onBack={back} onClose={() => selectItem(null)} />
        </div>
        <DetailTabs index={sel} onOpen={selectItem} plan={url.plan} onPlan={(plan) => commit({ plan }, "replace")}>
        <NextBetter index={sel} onOpen={selectItem} />
        <FarmRank index={sel} onOpen={selectItem} />
        {cre && r.rec.length > 0 && sec("Summoning (altar offering)", wrapL(r.rec.map((x: number[]) => link(x[0], `${x[1]}×`, KC.o))))}
        {!cre && !built && (r.rec.length > 0 || r.st.length > 0) && sec(
          `Crafted ${r.st[0] === -1 ? "by hand (inventory)" : `at ${stTxt || "—"}`}${r.lvl > 1 ? ` (station level ${r.lvl})` : ""}${r.y > 1 ? ` · makes ${r.y}` : ""}`,
          wrapL([...stations.map((s: number) => link(s, "station:", KC.c)), ...r.rec.map((x: number[]) => link(x[0], `${x[1]}×`, KC.c))]),
        )}
        {built && sec(
          `Built with the Hammer${stations.length ? ` near ${stTxt}` : " (no station needed nearby)"}${r.lvl > 1 ? ` (level ${r.lvl})` : ""}`,
          wrapL([...(HAMMER >= 0 ? [link(HAMMER, "tool:", KC.b)] : []), ...stations.map((s: number) => link(s, "near:", KC.b)), ...r.rec.map((x: number[]) => link(x[0], `${x[1]}×`, KC.b))]),
        )}
        {xr.length > 0 && sec("Upgrades, alternative recipes & Forge of Potential", <div>{xr.map((t: string, k: number) => { const p = t.slice(1).split("~"); return row(xl(t), wrapL([...(p[1] ? p[1].split(">").map((s: string) => link(b(s), "station:", KC.c)) : []), ...(p[2] ? p[2].split(",").map((x: string) => { const q = x.split("*"); return link(b(q[0]), `${q.length > 1 ? q[1] : "1"}×`, KC.c); }) : [])]), "x" + k); })}</div>)}
        {fuel.length > 0 && sec("Fuel", wrapL(fuel.map((j: number) => link(j, "", KC.o))))}
        {ext.length > 0 && sec("Upgrades station", wrapL(ext.map((s: number) => link(s, "→", KC.b))))}
        {DROPPERS[sel].length > 0 && sec("Dropped by", wrapL(DROPPERS[sel].map((d: [number, string, string]) => link(d[0], `${d[1]}% · ${d[2]}×`, KC.d))))}
        {sel === COINS && VALS.length > 0 && sec("Sell valuables to any trader", wrapL(VALS.map((v: [number, string]) => link(v[0], `${v[1]} Coins ←`, KC.t))))}
        {r.src.length > 0 && sec("Other sources & notes", srcRows(r))}
        {spentAt.length > 0 && sec("Spent at", wrapL(spentAt.map((t: number) => link(t, "→", KC.t))))}
        {r.t === "T" && sec("Paid with", wrapL([link(COINS, "", KC.t)]))}
        {sells.length > 0 && sec(`Sells (${sells.length})`, wrapL(sells.map((s: [number, string, number]) => link(s[0], `${s[1]} Coins${ok(s[2]) ? ` · after ${D[s[2]].n}` : ""} →`, KC.t))))}
        {r.t === "T" && VALS.length > 0 && sec("Buys valuables (same price at all traders)", wrapL(VALS.map((v: [number, string]) => link(v[0], `${v[1]} Coins ←`, KC.t))))}
        {cre && r.dr.length > 0 && sec(`Drops (${r.dr.length})`, wrapL(r.dr.map((d: string[]) => link(b(d[0]), `${d[1] || "100"}% · ${d[2] || "1"}×`, KC.d))))}
        {r.eats.length > 0 && sec("Taming – eats", wrapL(r.eats.map((e: number) => link(e))))}
        {gated.length > 0 && sec(`Unlocks at traders (${gated.length})`, wrapL(gated.map((u: number) => link(u, "→", KC.g))))}
        {craftedHere.length > 0 && sec(`Crafted here (${craftedHere.length})`, wrapL(craftedHere.map((u: number) => link(u, D[u].lvl > 1 ? `lvl ${D[u].lvl} →` : "→", KC.c))))}
        {UPGR[sel].length > 0 && sec(`Upgrades for this station – built with the Hammer nearby (${UPGR[sel].length})`, wrapL(UPGR[sel].map((u: number) => link(u, "→", KC.b))))}
        {builtNear.length > 0 && sec(`Built with the Hammer near this (${builtNear.length})`, wrapL(builtNear.map((u: number) => link(u, "→", KC.b))))}
        {uses.length > 0 && sec(`Used in (${uses.length})`, wrapL(uses.map((u: number) => {
          const rec = D[u].rec.find((x: number[]) => x[0] === sel);
          const k = EK.get(sel + ">" + u) || "o";
          const verb = k === "b" ? "build" : k === "c" ? "craft" : "";
          const xv = EXV.get(sel + ">" + u) || "";
          const up = splitUpgradeLabel(xv);
          if (rec) return link(u, `${rec[1]}× ${verb ? verb + " " : ""}→`, KC[k]);
          if (up) return link(u, up.prefix, KC[k], up.level);
          return link(u, xv ? `${xv} →` : verb ? `${verb} →` : "→", KC[k]);
        })))}
        {raw.length > 0 && sec("All raw sources in the chain", <div style={{ ...theme.font.body2, fontFamily: BODY, color: "#3b2a18" }}>{raw.map((n: number) => `${D[n].n} (${LANES[D[n].l]})`).join(", ")}</div>)}
        {r.note && <div style={{ ...theme.font.body2, fontFamily: BODY, color: "#3b2a18", marginTop: 10 }}>{r.note}</div>}
        <DetailExtras index={sel} onOpen={selectItem} />
        <div style={{ ...parchMeta, marginTop: 10 }}>{r.v === 2 ? "Verified: valheim.tools, 28 Oct 2026" : r.v === 1 ? "Source: valheim.source.gs (Valheim 1.0.20), read 28 Oct 2026" : "Unverified – CSV or general game knowledge only"}</div>
        </DetailTabs>
      </div>
    );
  };

  const lane = (li: number) => {
    const idxs = D.map((_r: N, i: number) => i).filter((i: number) => D[i].l === li && visible[i]);
    if (!idxs.length) return null;
    const hot = sel !== null && idxs.some((i: number) => i === sel || upSet.has(i) || downSet.has(i));
    const B = BIOME[li];
    return (
      <div key={"l" + li} style={{ flex: wide ? "0 0 250px" : "1 1 auto", width: wide ? 250 : "100%", boxSizing: "border-box", border: `1px solid ${hot ? B[2] : "#5c4329"}`, borderRadius: 6, padding: 10, background: `radial-gradient(ellipse at 50% 0%, ${B[2]}40 0%, transparent 62%), ${GRAIN}, linear-gradient(180deg, ${B[0]} 0%, ${B[1]} 100%)`, boxShadow: hot ? `0 0 14px ${B[2]}55, inset 0 0 18px rgba(0,0,0,0.45)` : "inset 0 0 18px rgba(0,0,0,0.55), 0 2px 6px rgba(0,0,0,0.35)", position: "relative" }}>
        <div style={{ fontFamily: RUNE, fontSize: wide ? "16px" : "18px", lineHeight: "22px", fontWeight: 700, letterSpacing: "0.04em", color: INK.hi, textShadow: `0 0 10px ${B[2]}66, 0 1px 2px #000` }}><span style={{ fontFamily: RUNIC, fontWeight: 400, color: B[2], marginRight: 6 }}>{BRUNE[li]}</span>{li < 8 ? `${li + 1}. ` : ""}{LANES[li]}</div>
        <div style={{ ...muted, marginBottom: 4 }}>{LANE_SUB[li]} · {idxs.length}/{COUNTS[li]}</div>
        {GROUPS.map(([g, label]: [string, string]) => {
          const gi = idxs.filter((i: number) => D[i].t === g);
          if (!gi.length) return null;
          const isClosed = closed.indexOf(g) >= 0 && !ql;
          const shown = sortedItems(groupShown(gi, isClosed, sel, upSet, downSet));
          const listId = `vh-lane-${li}-${g}`;
          return (
            <div key={g} style={{ marginTop: 8 }}>
              <button type="button" className="vh-btn vh-group" aria-expanded={!isClosed} aria-controls={listId} onClick={() => setClosed((c: string[]) => toggle(c, g))} style={{ ...muted, display: "flex", alignItems: "center", width: "100%", margin: 0, marginBottom: 4, padding: "2px 0", textAlign: "left", cursor: "pointer", userSelect: "none", background: "transparent", border: 0, color: INK.mid }}>
                <span aria-hidden="true">{isClosed ? "▸ " : "▾ "}</span>
                <span>{label} ({gi.length}){isClosed && shown.length ? ` · ${shown.length} linked` : ""}</span>
              </button>
              <ul id={listId} className="vh-chips" hidden={shown.length === 0} style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>{shown.map((i: number) => <li key={i}>{chip(i)}</li>)}</ul>
            </div>
          );
        })}
      </div>
    );
  };

  const flow = () => {
    const els: ReactNode[] = [];
    for (let li = 0; li < LANES.length; li++) {
      els.push(lane(li));
      if (!wide && sel !== null && D[sel].l === li) els.push(panel());
    }
    return (
      <div id="vh-results" className="vh-lanes" ref={wrapRef} style={{ width: "100%" }}>
        {wide && sel !== null && <div className="vh-panel-slot" style={{ marginBottom: 12 }}>{panel()}</div>}
        <div className="vh-scroll vh-lane-scroll" style={{ overflowX: wide ? "auto" : "visible", width: "100%", maxWidth: "100%", paddingBottom: wide ? 8 : 0, scrollbarColor: "#7a5a36 transparent" }}>
          <div ref={contentRef} style={{ position: "relative", display: "flex", flexDirection: wide ? "row" : "column", alignItems: wide ? "flex-start" : "stretch", gap: wide ? 30 : 14, width: wide ? "max-content" : "100%" }}>
            {els}
            <svg width={box[0]} height={box[1]} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", zIndex: 3, overflow: "visible" }}>
              {paths.map((p: Seg, k: number) => <path key={k} d={p.d} fill="none" stroke={p.c} strokeWidth={2} strokeOpacity={0.85} strokeDasharray={p.dash ? "5 4" : undefined} />)}
            </svg>
          </div>
        </div>
      </div>
    );
  };

  const typeCount = (g: string) => D.filter((r: N) => r.t === g).length;

  const frame: CSSProperties = { position: "relative", borderRadius: 8, border: "2px solid #120c07", outline: "1px solid #6b5233", outlineOffset: -6, padding: wide ? "16px 14px 14px" : "14px 8px 12px", background: `radial-gradient(ellipse at 50% -8%, rgba(216,207,120,0.16) 0%, transparent 48%), radial-gradient(ellipse at 50% 112%, rgba(255,120,40,0.16) 0%, transparent 46%), ${NOISE}, ${GRAIN}, linear-gradient(180deg, #2c241c 0%, #120e0a 100%)`, boxShadow: "inset 0 0 70px rgba(0,0,0,0.75), 0 4px 18px rgba(0,0,0,0.45)", color: INK.hi, fontFamily: BODY };
  return (
    <Page
      title="Valheim Progression"
      width="full"
      skin="valheim"
      summary="Every creature, gatherable, material, food, piece of gear, station and trader by biome (left to right on desktop, top to bottom on a phone). Tap anything: solid lines and outlines show where it comes from, dashed ones show what it leads to; line colour shows the relation type."
      sources={["valheim.source.gs (Valheim 1.0.20), read 28 Oct 2026", "valheim.tools (verified 28 Oct 2026)", "Rimmo's CSV (1477 rows), corrected", "Audit 28 Oct 2026: Jotunn datamine, Fandom wiki, valheim.tools browser checks"]}
    >
      <style>{SKIN_CSS}</style>
      <div className="vh-frame" style={frame}>
        {rivet({ top: 4, left: 4 })}{rivet({ top: 4, right: 4 })}{rivet({ bottom: 4, left: 4 })}{rivet({ bottom: 4, right: 4 })}
      <Section heading="Biome flow">
        <Input id="vh-search" label="Search" ariaLabel="Search" type="search" autoComplete="off" controls="vh-results" value={q} onChange={(v: string) => setQ(v)} placeholder="e.g. Bone Fragments, Raspberries, Troll, Haldor" />
        <FoodFilters value={food} onChange={setFood} />
        <PlayerBar plan={url.plan} onPlan={(plan) => commit({ plan }, "replace")} />
        <div className="vh-chips vh-type-row" style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
          <span style={muted}>Show types:</span>
          {GROUPS.map(([g, label]: [string, string]) => (
            <button type="button" key={g} className="vh-btn vh-chip" aria-pressed={hidden.indexOf(g) < 0} onClick={() => setHidden((h: string[]) => toggle(h, g))} style={pill(hidden.indexOf(g) < 0)}>{label} {typeCount(g)}</button>
          ))}
        </div>
        <div className="vh-chips vh-tool-row" style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
          <span style={muted}>Groups:</span>
          <button type="button" className="vh-btn vh-chip" onClick={() => setClosed([])} style={pill(false)}>Expand all</button>
          <button type="button" className="vh-btn vh-chip" onClick={() => setClosed(GROUPS.map((g: [string, string]) => g[0]))} style={pill(false)}>Collapse all</button>
          <button type="button" className="vh-btn vh-chip" onClick={() => setClosed(DEF_CLOSED)} style={pill(false)}>Default</button>
          <button type="button" className="vh-btn vh-chip" onClick={() => setHidden([])} style={pill(false)}>All types</button>
        </div>
        <Segmented options={[{ value: "1", label: "Direct links" }, { value: "all", label: "Whole chain" }]} value={depth} onChange={(v: string) => commit({ chain: v === "all" }, "replace")} />
        <Legend names={KINDS.map((k: [string, string]) => k[1])} />
        {sel === null && <Text>{`${visCount} / ${D.length} entries visible. Solid line = source or ingredient of the selected entry; dashed line = what it is used for. Crafted means made from a recipe at a crafting station (or by hand); built means placed with the Hammer using materials, with the named station nearby. Tap a collapsed group header to open it; linked entries always show. "?" = unverified.`}</Text>}
        {flow()}
      </Section>
      {sel === null && <Section heading="About the data" collapsible defaultOpen={false}>
        <Text>{`Dataset 2026-10-28 v9: ${D.length} entries, including structures (dungeons, villages, ruins and fortresses).`}</Text>
        <Table columns={["Biome", "Entries"]} rows={LANES.map((l: string, i: number) => [l, String(COUNTS[i])])} />
        <Text>{"Biome = the progression tier where you can first reasonably get the thing: creatures by their native biome; drops by the earliest creature; gatherables and ores by biome and the tool they need (e.g. Finewood needs a Bronze Axe → Black Forest); crafted and built things by their latest ingredient or station; trader stock by the trader's biome or its unlock (boss or Hildir's returned chest)."}</Text>
        <Text>{"Sources: valheim.source.gs (Valheim 1.0.20), read 28 Oct 2026; valheim.tools (verified 28 Oct 2026); Rimmo's CSV (1477 rows), corrected; Audit 28 Oct 2026: Jotunn datamine, Fandom wiki, valheim.tools browser checks."}</Text>
        <Callout tone="info" lead="Open points">{"No entries are unverified any more (328 verified on valheim.tools, 770 from valheim.source.gs 1.0.20). Still unknown: Deer White spawn location (rare variant, spawn unconfirmed), the exact source of Ice Skates and Ice Shoes, and Nord Sword upgrade costs (Black Forge 5/6/7). Upgrade costs are not recorded for the other Nord gear. Not shown: Fermenter yields, specific chest/dungeon names and decorative build pieces."}</Callout>
      </Section>}
      </div>
    </Page>
  );
}
