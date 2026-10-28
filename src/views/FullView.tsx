import { Page, Section, Input, Segmented, Legend, Text, Table, Callout, useGrokTheme, useState, useMemo, useRef, useEffect } from "grok/canvas";
import type { CSSProperties, ReactNode } from "grok/canvas";

import {
  D, type N, b, ok, LANES, LANE_SUB, GROUPS, GL, SUB_EN, DEF_CLOSED,
  isCre, isBuilt, HAMMER, COINS, TRIDX, KINDS, UPS, EK, EXV, xl,
  DROPPERS, SELLS, GATES, UPGR, VALS, DOWNS, closure, COUNTS, KINDC, isStructEdge,
} from "../graph";
import { DetailExtras } from "../details";

type Seg = { d: string; c: string; dash: boolean };

// Same hall skin as the compact view: wood, iron, runes, ember selection, parchment notes.
const RUNE = "'Cinzel', 'Norse', 'Trajan Pro', 'Palatino Linotype', 'Book Antiqua', Georgia, serif";
const BODY = "'Alegreya', 'IM Fell English', 'Palatino Linotype', 'Book Antiqua', Georgia, serif";
const RUNIC = "'Noto Sans Runic', 'Segoe UI Historic', 'Segoe UI Symbol', serif";
const INK = { hi: "#f3e6c8", mid: "#d8c49c", lo: "#b3a084", dark: "#2a1b0e", amber: "#e8b04f" };
const SKIN_CSS = "@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Alegreya:wght@400;700&family=Noto+Sans+Runic&display=swap');"
  + ".vh-in::placeholder{color:#a8957a;opacity:1}.vh-scroll::-webkit-scrollbar{width:8px;height:6px}.vh-scroll::-webkit-scrollbar-thumb{background:#6e5232;border-radius:4px}.vh-scroll::-webkit-scrollbar-track{background:transparent}";
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
  const [q, setQ] = useState("");
  const [hidden, setHidden] = useState<string[]>([]);
  const [closed, setClosed] = useState<string[]>(DEF_CLOSED);
  const [depth, setDepth] = useState("1");
  const [sel, setSel] = useState<number | null>(null);
  const [width, setWidth] = useState(1000);
  const [tick, setTick] = useState(0);
  const [paths, setPaths] = useState<Seg[]>([]);
  const [box, setBox] = useState<[number, number]>([0, 0]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const chips = useRef<Map<number, HTMLElement>>(new Map());
  const wide = width >= 760;
  const KC: Record<string, string> = KINDC;
  const upC = theme.text.primary;
  const downC = theme.text.secondary;

  const upSet = useMemo(() => (sel === null ? new Set<number>() : depth === "all" ? closure(sel, UPS) : new Set<number>(UPS[sel])), [sel, depth]);
  const downSet = useMemo(() => (sel === null ? new Set<number>() : depth === "all" ? closure(sel, DOWNS) : new Set<number>(DOWNS[sel])), [sel, depth]);
  const ql = q.trim().toLowerCase();

  const visible = useMemo(() => D.map((r: N, i: number) => {
    if (i === sel || upSet.has(i) || downSet.has(i)) return true;
    if (hidden.indexOf(r.t) >= 0) return false;
    if (ql && r.n.toLowerCase().indexOf(ql) < 0) return false;
    return true;
  }), [ql, hidden, sel, upSet, downSet]);
  const visCount = visible.filter((v: boolean) => v).length;

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
  }, [sel]);

  const pick = (i: number) => setSel((s: number | null) => (s === i ? null : i));
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
    return (
      <div
        key={"c" + i}
        ref={(el: HTMLDivElement | null) => { if (el) chips.current.set(i, el); else chips.current.delete(i); }}
        onClick={() => pick(i)}
        style={{
          ...theme.font.label, fontFamily: BODY, fontSize: "13px", display: "inline-flex", alignItems: "center", padding: "4px 9px", borderRadius: 4, cursor: "pointer",
          border: `${isSel || isUp || isDown ? 2 : 1}px ${isDown && !isUp ? "dashed" : "solid"} ${color}`,
          background: isSel ? "linear-gradient(180deg, #7a3a14 0%, #4a210b 100%)" : "linear-gradient(180deg, #45321f 0%, #2b1e13 100%)", color: INK.hi, opacity: dim ? 0.3 : 1,
          boxShadow: isSel ? "0 0 10px rgba(255,140,50,0.55)" : "inset 0 1px 0 rgba(255,225,170,0.10), 0 1px 2px rgba(0,0,0,0.6)",
          fontWeight: r.t === "B" || r.t === "M" || r.t === "T" || isSel ? 700 : 400,
          transition: theme.motion.hover, position: "relative", zIndex: 1, maxWidth: "100%",
        }}
      >{r.n}{r.v === 0 ? " ?" : ""}</div>
    );
  };
  const link = (i: number, extra?: string, c?: string) => (ok(i) ?
    <div key={"k" + i + (extra || "")} onClick={() => setSel(i)} style={{ ...theme.font.label, fontFamily: BODY, fontSize: "13px", cursor: "pointer", display: "inline-flex", gap: 4, alignItems: "baseline", padding: "3px 8px", borderRadius: 4, border: `2px solid ${c || "#6e5232"}`, background: "linear-gradient(180deg, #4a3522 0%, #2e2015 100%)", color: INK.hi, boxShadow: "0 1px 2px rgba(0,0,0,0.45)" }}>
      {extra ? extra + " " : ""}{D[i].n} <span style={{ color: "#cdb98f" }}>· {LANES[D[i].l]}</span>
    </div> : null
  );
  const row = (label: string, body: ReactNode, k: string) => (
    <div key={k} style={{ ...theme.font.body2, fontFamily: BODY, color: "#3b2a18", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "baseline", marginBottom: 4 }}>
      <span style={{ ...parchMeta, minWidth: 90 }}>{label}</span>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "baseline", flex: "1 1 200px" }}>{body}</div>
    </div>
  );
  const wrapL = (els: ReactNode[]) => <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{els}</div>;
  const ul = (i: number) => (ok(i) ? <span onClick={() => setSel(i)} style={{ textDecoration: "underline", cursor: "pointer", color: "#6a3211" }}>{D[i].n}</span> : null);
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
      <div ref={panelRef} key="panel" style={{ border: "1px solid #8a6a3e", borderRadius: 6, padding: 14, background: `${NOISE}, radial-gradient(ellipse at 50% 35%, #f1e3c0 0%, #e4cf9f 65%, #c8aa72 100%)`, boxShadow: "inset 0 0 30px rgba(110,70,30,0.45), 0 3px 10px rgba(0,0,0,0.6)", color: INK.dark, fontFamily: BODY, width: "100%", boxSizing: "border-box", position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontFamily: RUNE, fontSize: "22px", lineHeight: "28px", fontWeight: 700, letterSpacing: "0.02em", color: INK.dark }}>{r.n}</div>
            <div style={parchMeta}>{LANES[r.l]} · {GL[r.t]}{r.sub ? ` · ${SUB_EN[r.sub] || r.sub}` : ""}{r.eats.length ? " · tameable" : ""}</div>
          </div>
          <div onClick={() => setSel(null)} style={pill(false)}>Close ✕</div>
        </div>
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
          const xv = EXV.get(sel + ">" + u);
          return link(u, rec ? `${rec[1]}× ${verb ? verb + " " : ""}→` : xv ? `${xv} →` : verb ? `${verb} →` : "→", KC[k]);
        })))}
        {raw.length > 0 && sec("All raw sources in the chain", <div style={{ ...theme.font.body2, fontFamily: BODY, color: "#3b2a18" }}>{raw.map((n: number) => `${D[n].n} (${LANES[D[n].l]})`).join(", ")}</div>)}
        {r.note && <div style={{ ...theme.font.body2, fontFamily: BODY, color: "#3b2a18", marginTop: 10 }}>{r.note}</div>}
        <DetailExtras index={sel} onOpen={setSel} />
        <div style={{ ...parchMeta, marginTop: 10 }}>{r.v === 2 ? "Verified: valheim.tools, 28 Oct 2026" : r.v === 1 ? "Source: valheim.source.gs (Valheim 1.0.20), read 28 Oct 2026" : "Unverified – CSV or general game knowledge only"}</div>
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
          const shown = isClosed ? gi.filter((i: number) => i === sel || upSet.has(i) || downSet.has(i)) : gi;
          return (
            <div key={g} style={{ marginTop: 8 }}>
              <div onClick={() => setClosed((c: string[]) => toggle(c, g))} style={{ ...muted, marginBottom: 4, cursor: "pointer", userSelect: "none" }}>{isClosed ? "▸" : "▾"} {label} ({gi.length}){isClosed && shown.length ? ` · ${shown.length} linked` : ""}</div>
              {shown.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>{shown.map((i: number) => chip(i))}</div>}
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
      <div ref={wrapRef} style={{ width: "100%" }}>
        {wide && sel !== null && <div style={{ marginBottom: 12 }}>{panel()}</div>}
        <div className="vh-scroll" style={{ overflowX: wide ? "auto" : "visible", width: "100%", maxWidth: "100%", paddingBottom: wide ? 8 : 0, scrollbarColor: "#7a5a36 transparent" }}>
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
      <div style={frame}>
        {rivet({ top: 4, left: 4 })}{rivet({ top: 4, right: 4 })}{rivet({ bottom: 4, left: 4 })}{rivet({ bottom: 4, right: 4 })}
      <Section heading="Biome flow">
        <Input label="Search" value={q} onChange={(v: string) => setQ(v)} placeholder="e.g. Bone Fragments, Raspberries, Troll, Haldor" />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
          <span style={muted}>Show types:</span>
          {GROUPS.map(([g, label]: [string, string]) => (
            <div key={g} onClick={() => setHidden((h: string[]) => toggle(h, g))} style={pill(hidden.indexOf(g) < 0)}>{label} {typeCount(g)}</div>
          ))}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
          <span style={muted}>Groups:</span>
          <div onClick={() => setClosed([])} style={pill(false)}>Expand all</div>
          <div onClick={() => setClosed(GROUPS.map((g: [string, string]) => g[0]))} style={pill(false)}>Collapse all</div>
          <div onClick={() => setClosed(DEF_CLOSED)} style={pill(false)}>Default</div>
          <div onClick={() => setHidden([])} style={pill(false)}>All types</div>
        </div>
        <Segmented options={[{ value: "1", label: "Direct links" }, { value: "all", label: "Whole chain" }]} value={depth} onChange={(v: string) => setDepth(v)} />
        <Legend names={KINDS.map((k: [string, string]) => k[1])} />
        <Text>{`${visCount} / ${D.length} entries visible. Solid line = source or ingredient of the selected entry; dashed line = what it is used for. Crafted means made from a recipe at a crafting station (or by hand); built means placed with the Hammer using materials, with the named station nearby. Tap a collapsed group header to open it; linked entries always show. "?" = unverified.`}</Text>
        {flow()}
      </Section>
      <Section heading="Data and corrections" collapsible defaultOpen={false}>
        <Text>{`Dataset ${"2026-10-28 v9"}: ${D.length} entries, including structures (dungeons, villages, ruins and fortresses). 17 items moved biome, among them the idols, Draugr, Draugr Elite and their drops, Frostcore and Frost Foundry.`}</Text>
        <Table columns={["Biome", "Entries"]} rows={LANES.map((l: string, i: number) => [l, String(COUNTS[i])])} />
        <Text>{"Biome = the progression tier where you can first reasonably get the thing: creatures by their native biome; drops by the earliest creature; gatherables and ores by biome and the tool they need (e.g. Finewood needs a Bronze Axe → Black Forest); crafted and built things by their latest ingredient or station; trader stock by the trader's biome or its unlock (boss or Hildir's returned chest)."}</Text>
        <Table columns={["What", "Change"]} rows={[["Audit 28 Oct (v8)", "All 1068 entries re-checked against valheim.source.gs (1.0.20), the Jotunn datamine and the Fandom wiki, plus valheim.tools in the browser for the open points. Now 1098 entries: 29 missing “Cast: …” intermediates of the Deep North casting chain and the Birds' Nest were added; 123 real errors fixed (lane, name, station, recipe, build, drop or missing source)"], ["New relation types", "Upgrade costs (quality 2–4) for 201 items, alternative recipes (e.g. Bronze 10 Copper + 5 Tin → 5, Smelter Scrap Bronze/Copper Scrap/Scrap Iron, Iron Cooking Station), Forge of Potential idols, station fuel (e.g. Bone Fragments and Charred Bone → Shield Generator, Coal → Smelter), Ballista/Catapult ammo, planting and the Obliterator. Shown in the item panel and as links"], ["Key lane changes", "Bone Fragments, Skeleton, Skeleton Trophy, Bone Tower Shield, Deer Hide Cape → Meadows (Dolmen skeletons, Stone graves). Bronze idols → Black Forest; Iron/Silver/Black Metal/Black Marble idols one biome later (0% in the earlier biome's chests). Seagull Ocean → Meadows (spawns on Meadows coasts, reachable from the start). Deer White and its trophy → Black Forest"], ["Boss rule", "Killing a boss = moving on: anything that only appears after a boss is killed belongs to the next biome. Greydwarf, Greydwarf Eye and Greydwarf Trophy stay in Black Forest (Greydwarfs only roam the Meadows after Eikthyr). Post-boss trader stock moved one biome on: Thunder Stone and Ymir Flesh → Swamp (after The Elder); Wider Pockets, Fragrant Bundle, Mountain Peak Pepper Powder, Toadstool, Scythe Handle → Plains (after Moder); Grasslands Herbalist Harvest → Mistlands (Yagluth); Deeper Pockets, Herbs of the Hidden Hills → Ashlands (The Queen); Fiery Spice Powder → Deep North (Fader). Follow-ons: Hearty Mountain Logger's Stew, Mead base: Berserkir, Berserkir Mead, Scythe → Plains; Plains Pie Picnic → Mistlands; Mushrooms Galore → Ashlands; Ashlands Gourmet Bowl → Deep North. Egg stays in Plains (Sealed Tower chest, Hens). Boss drops stay with their boss"], ["Console-only", "Riktig Fuling, Larva and Blue Mushroom exist only through console commands (Blue Mushroom's pickable never generates). They stay in their nominal biome without any links"], ["Browser-verified (valheim.tools)", "Deer White: rare passive Black Forest variant, 30 HP, 2 Deer Meat + trophy 100%, spawn unconfirmed. Ice Skates / Ice Shoes: found in the Deep North, exact source unknown. Frostcore: Frost Core Hangers in Mountain frost caves (do not regrow) + Frysling 100%. Midsummer Crown (event only) and Pointy Hat recipes and upgrades. Bloodgold idols: rare Deep North chest loot. Seagull, Crow, Ash Crow: 3 Feathers 100%. Leviathan: 3–4 Chitin per barnacle. Wider/Deeper Pockets 1000/2000 Coins. Yggdrasil Wood: Black Metal Axe or better. Club upgrades 5/10/20 Bone Fragments. Thungr Trophy from the Zil & Thungr fight"], ["Nord weapons", "Forge of Potential uses the Bloodgold Battle Idol (not Black Metal); e.g. Nord Sword past quality 4: 1 idol + 45 Bloodgold + 22 Timberwood. Nord Sword is cast at Black Forge level 4 (20 Bloodgold, 10 Timberwood, Mould) → Frost Foundry; upgrades at Black Forge 5/6/7"], ["Ballista & Catapult", "Ballista: Hammer near Workbench, 10 Black Metal, 10 Yggdrasil Wood, 3 Mechanical Spring; ammo Wooden, Black Metal, Flametal and Bloodgold Missile. Catapult: 20 Ashwood, 10 Flametal, 1 Charred Cogwheel; ammo Grausten, Explosive and Bloodgold Payload. Each ammo sits in the biome of its latest ingredient or station"], ["Names", "Mead Cauldron → Mead Ketill (in-game name; the earlier note was wrong). “Root (olend)” → Root (creature). The Kvastur trophy is listed as “Kvastur Trophy” to keep it apart from the miniboss (in game the item is just “Kvastur”)"], ["Loops avoided", "Two alternative inputs are shown as text only because a link would create a loop: Finewood → Coal and Copper Scrap → Copper"], ["Scope", "Turn 1: 183 hand-picked entries → now 1098 (after the audit): every non-decorative row of the CSV plus functional stations, upgrades, ships, beds, chests and the three traders"], ["Creatures", "110 creatures: regular, animals, tameables, minibosses (Brenna, Geirrhafa, Zil, Thungr, Kvastur, Lord Reto), Ocean (Serpent, Leviathan); each linked to its drops"], ["Coins (fixed)", "Coins used to show only the creatures that drop them. Now: sources = creature drops, chests in every biome and selling 9 valuables; uses = Haldor, Hildir and the Bog Witch, each linked to everything they sell with prices and unlocks (valheim.tools/traders)"], ["Traders (new)", "Hildir (camp in the Meadows on another island – needs a boat, so placed at the Black Forest stage; 38 items), Haldor (Black Forest, 11 items incl. Wider Pockets 1000 and Deeper Pockets 2000), Bog Witch (Swamp, 20 items). Boss unlocks and Hildir's returned chests are linked as unlock edges"], ["Valuables", "Amber 5, Amber Pearl 10, Ancient Coin 10, Ruby 20, Silver Necklace 30, Grimvarn 55, Solryth 95, Veydris 135, Draumyx 175 Coins – any of the three traders buys them at the same price"], ["Hildir's stock", "Items unlocked by the Brass Chest (Smouldering Tomb, Black Forest), Silver Chest (Howling Cavern, Mountain) and Bronze Chest (Sealed Tower, Plains) moved to that chest's biome"], ["Crafted vs built", "Two separate relation types: crafted from a recipe at a crafting station (or by hand), and built with the Hammer from materials with a station nearby. Stations and station upgrades are built; upgrades link from the station they improve instead of feeding into it"], ["Station upgrades (fixed)", "Before, an upgrade appeared as a source of its station (e.g. Chopping Block → Workbench), which made loops. Now Workbench → Chopping Block (built nearby, upgrades it)"], ["Yggdrasil Wood (fixed)", "Required tool was Jotun Bane, but Jotun Bane is made from Yggdrasil Wood (a loop). valheim.tools: Black Metal Axe or better"], ["Biome audit (found in)", "Putrid Hole (Morgen holes) was mapped to Deep North instead of Ashlands, and 7 dungeons were missing. Fixed on 18 entries, e.g. Ashwood, Charred Bone, Molten Core now found in Ashlands, not Deep North"], ["Lane rule", "Each entry sits in the EARLIEST biome where it can be obtained by any means: gathered or found, creature drop, chest loot, bought from a trader (trader's biome, after its unlock), or crafted/built (earliest biome where every ingredient AND the station at the required level are available). Computed as a fixed point over the whole graph; Ocean is a side lane only for things obtainable only at sea. No 'Multiple' lane: Amber, Amber Pearl, Coins, Ruby and Silver Necklace sit in Meadows with all chest locations listed under found in. 7 entries moved: Poison Arrow Mountain → Swamp (Swamp chest loot), Scrap Bronze Black Forest → Ashlands (only from Charred Fortress walls), Midsummer Crown → Meadows, Perch Meadows → Black Forest (rod and bait from Haldor), Trollfish → Swamp (Mossy bait needs the Food Preparation Table), Corked Vial and Woodland Herb Blend → Swamp (Bog Witch). Full list in lane_diff_v5.csv"], ["Boat rule", "Hildir is in the Meadows but never on the starting island, so reaching her needs a boat (Karve, Black Forest stage): Hildir and her items with no unlock (Headband, Simple Purple/Red Cap, Simple Undyed Dress/Tunic, Sparkler, Barber Kit, Iron Pit) moved Meadows → Black Forest, plus Iron Fire Pit (built from Iron Pit). Items that unlock with her chests stay in the chest's biome. Ocean items likewise count as needing a boat (Black Forest stage or later). Poison Arrow stays in Swamp: Swamp ruin and grave chest loot confirmed on valheim.tools and by the user. List in lane_diff_v6.csv"], ["Fireworks and cooking", "6 coloured Fireworks → Plains (need Basic Fireworks from Hildir after the Bronze Chest). 8 cooked foods: Cooking Station instead of Iron Cooking Station"], ["Hildir's keys", "Removed: never obtainable in a normal game (valheim.tools); Hildir unlocks her returned chests herself"], ["Nord gear", "All Nord weapons, shields, staves and armor (cast from a mould → Frost Foundry) plus Frostfire/Thunderblood variants"], ["Captive Fuling", "Plains → Deep North (Morkhalla dungeon, valheim.tools)"], ["Hen, Chicken, Egg", "Meadows → Plains (Egg: Haldor after Yagluth; chickens hatch from eggs)"], ["Finewood, Bronze Axe etc.", "Meadows → Black Forest: birch and oak need a Bronze Axe"], ["Copper Scrap", "Black Forest → Mistlands (Ancient Armour/Sword, Black Metal Pickaxe)"], ["Fader Relic", "Merged with Kindled Ribs (renamed in 1.0.15)"], ["Yagluth offering", "5 Fuling Totems – confirmed on valheim.tools"], ["Browser check (28 Oct)", "verify_list.csv checked against valheim.tools item/creature pages: 44 corrections on 39 entries, 111 entries newly marked verified. Examples: Crow → Black Forest (3 Feathers); Seagull later moved to Meadows by the audit; Midsummer Crown and Pointy Hat are Workbench recipes (seasonal, Black Forest); asksvin bones from carrion at Morgen Holes → new Asksvin Skeleton; Moose meat 4–6, hide/sinew 2–3; Seal pelt/blubber 2–3; Captive Fuling Ancient Coin 100% ×1–2; The Void drops only Ectoplasm; Pike also takes Cold Fishing Bait"], ["Coins sources (fixed)", "Meat Pile and Coin Pile removed as Coins sources (Coin Pile is a build piece made from Coins). Troll carries 20–30 Coins"], ["Riktig Fuling", "Console-only, never spawns in a normal world: drops removed so it has no links (same handling now for Larva and Blue Mushroom)"], ["Bronze Nails", "Makes 20 (turn 1 said 10); Iron Nails 10"], ["Left out", "Decorative build pieces, stacks, rugs, banners; places; 29 internal/unused/unobtainable rows (e.g. Skelett, Stone Pickaxe, The Hive, Bonemaw Scale, Hooded Lantern, summoned creatures, Hildir's keys)"], ["Biome differences", "Many entries sit in a different progression biome than the CSV biome – full list in lane_diff.csv"]]} />
        <Callout tone="info" lead="Open points">{"No entries are unverified any more (328 verified on valheim.tools, 770 from valheim.source.gs 1.0.20). Still unknown: Deer White spawn location (rare variant, spawn unconfirmed), the exact source of Ice Skates and Ice Shoes, and Nord Sword upgrade costs (Black Forge 5/6/7). Upgrade costs are not recorded for the other Nord gear. Not shown: Fermenter yields, specific chest/dungeon names and decorative build pieces."}</Callout>
      </Section>
      </div>
    </Page>
  );
}
