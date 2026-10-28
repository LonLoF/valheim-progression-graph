import { Page, useGrokTheme, useState, useMemo, useRef, useEffect } from "grok/canvas";

import {
  D, type N, b, ok, LANES, LANE_SUB, GROUPS, GL, SUB_EN,
  isCre, isBuilt, HAMMER, COINS, TRIDX, KINDS, UPS, EK, EXV,
  DROPPERS, SELLS, GATES, UPGR, VALS, DOWNS, COUNTS, KINDC, isStructEdge, xl,
} from "../graph";
import { DetailExtras } from "../details";

type Cat = [string, string, string, string];
const CATS: Cat[] = [["cre", "🐺", "Creatures & Bosses", "Creatures"], ["str", "🏰", "Structures", "Structures"], ["trd", "🪙", "Traders", "Traders"], ["raw", "🪨", "Raw materials (gathered / mined / wood)", "Raw"], ["drp", "🦴", "Creature drops & trophies", "Drops"], ["ref", "⚗️", "Refined & crafted materials", "Refined"], ["food", "🍖", "Food, Meads & Fish", "Food"], ["wpn", "⚔️", "Weapons & Shields", "Weapons"], ["ammo", "🏹", "Ammo & Bait", "Ammo"], ["arm", "🛡️", "Armor & Accessories", "Armor"], ["tool", "🔨", "Tools", "Tools"], ["stn", "⚒️", "Stations & upgrades", "Stations"], ["bld", "🏠", "Building, boats & storage", "Building"], ["val", "💎", "Valuables", "Valuables"], ["misc", "📦", "Misc (keys, chests, saddles…)", "Misc"]];
const STN = new Set<number>();
D.forEach((r: N) => r.st.forEach((x: number) => { if (x >= 0) STN.add(x); }));
const catOf = (i: number): string => {
  const r = D[i]; const t = r.t;
  if ("BMC".indexOf(t) >= 0) return "cre";
  if (t === "Z") return "str";
  if (t === "T") return "trd";
  if (r.src.some((s: string) => s[0] === "v")) return "val";
  if (t === "m") {
    if (r.rec.length || r.st.length) return "ref";
    if (DROPPERS[i].length && !r.src.some((s: string) => s[0] === "g" || s[0] === "x" || s[0] === "f")) return "drp";
    return "raw";
  }
  if (t === "r") return "drp";
  if (t === "f" || t === "d" || t === "h") return "food";
  if (t === "w" || t === "s") return "wpn";
  if (t === "o") return "ammo";
  if (t === "a") return "arm";
  if (t === "t") return "tool";
  if (t === "E") return "stn";
  if (t === "S") return STN.has(i) ? "stn" : "bld";
  return "misc";
};
const CAT: string[] = D.map((_r: N, i: number) => catOf(i));
type Rel = { i: number; label: string; k: string };

// ᚠ Valheim skin: a self-painted dark wood hall with its own ink, so it reads the same on light and dark hosts.
const RUNE = "'Cinzel', 'Norse', 'Trajan Pro', 'Palatino Linotype', 'Book Antiqua', Georgia, serif";
const BODY = "'Alegreya', 'IM Fell English', 'Palatino Linotype', 'Book Antiqua', Georgia, serif";
const RUNIC = "'Noto Sans Runic', 'Segoe UI Historic', 'Segoe UI Symbol', serif";
const INK = { hi: "#f3e6c8", mid: "#d8c49c", lo: "#b3a084", dark: "#2a1b0e", amber: "#e8b04f" };
const SKIN_CSS = "@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Alegreya:wght@400;700&family=Noto+Sans+Runic&display=swap');"
  + ".vh-in::placeholder{color:#a8957a;opacity:1}.vh-scroll::-webkit-scrollbar{width:8px;height:6px}.vh-scroll::-webkit-scrollbar-thumb{background:#6e5232;border-radius:4px}.vh-scroll::-webkit-scrollbar-track{background:transparent}";
const NOISE = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.20 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";
const GRAIN = "repeating-linear-gradient(91deg, rgba(0,0,0,0.10) 0px, rgba(0,0,0,0.10) 2px, rgba(255,230,190,0.018) 2px, rgba(255,230,190,0.018) 6px, rgba(0,0,0,0.05) 6px, rgba(0,0,0,0.05) 11px)";
// Per biome: [top, bottom, glow/accent]
const BIOME: [string, string, string][] = [
  ["#46542a", "#1b220f", "#d8cf78"], // Meadows: soft green-gold
  ["#1f3a28", "#0a140e", "#7fb48a"], // Black Forest: deep pine
  ["#33402a", "#0e1c1b", "#8fb59a"], // Swamp: murky olive / teal
  ["#3e5064", "#141c26", "#d6e8f6"], // Mountain: icy blue-white
  ["#5c4b20", "#21180a", "#f0cc6c"], // Plains: golden straw
  ["#3d2f50", "#140e1c", "#c4a6e4"], // Mistlands: purple mist
  ["#521a12", "#100505", "#ff7a45"], // Ashlands: lava red-black
  ["#4f5e6c", "#1a2129", "#eaf4fb"], // Deep North: pale frost
  ["#16385a", "#06111d", "#7cc0e2"], // Ocean: deep sea
];
const BRUNE = ["ᚠ", "ᚢ", "ᚦ", "ᚺ", "ᛃ", "ᛈ", "ᚲ", "ᛁ", "ᛚ"];
const CATC = ["#d9a44e", "#8fae6b", "#7fa6c4", "#c8774c", "#a98bc9", "#d6c08f", "#6fb0a8"];

export default function App() {
  const theme = useGrokTheme();
  const [lane, setLane] = useState(0);
  const [types, setTypes] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<number | null>(null);
  const [hist, setHist] = useState<number[]>([]);
  const [vh, setVh] = useState(700);
  const [w, setW] = useState(1000);
  const rootRef = useRef<HTMLDivElement>(null);
  const touch = useRef<number | null>(null);
  const cat = CATC;
  const KC: Record<string, string> = KINDC;
  const B = BIOME[lane];

  useEffect(() => {
    const upd = () => { setVh(window.innerHeight || 700); if (rootRef.current) setW(rootRef.current.clientWidth); };
    upd();
    window.addEventListener("resize", upd);
    return () => window.removeEventListener("resize", upd);
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName || "";
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowRight") setLane((l: number) => Math.min(8, l + 1));
      if (e.key === "ArrowLeft") setLane((l: number) => Math.max(0, l - 1));
      if (e.key === "Escape") setSel(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const wide = w >= 820;
  const boxH = Math.max(360, vh - (wide ? 262 : 282));
  const ql = q.trim().toLowerCase();
  const inLane = useMemo(() => D.map((_r: N, i: number) => i).filter((i: number) => D[i].l === lane), [lane]);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const base = ql ? D.map((_r: N, i: number) => i).filter((i: number) => D[i].n.toLowerCase().indexOf(ql) >= 0) : inLane;
  const present = CATS.filter((c: Cat) => base.some((i: number) => CAT[i] === c[0]));
  const items = base.filter((i: number) => !types.length || types.indexOf(CAT[i]) >= 0);

  const go = (i: number) => {
    if (!ok(i)) return;
    if (sel !== null && sel !== i) setHist((h: number[]) => [...h.slice(-19), sel]);
    setSel(i);
    setLane(D[i].l);
  };
  const back = () => {
    if (!hist.length) { setSel(null); return; }
    const p = hist[hist.length - 1];
    setHist((h: number[]) => h.slice(0, -1));
    setSel(p);
    setLane(D[p].l);
  };
  const toggleType = (g: string) => setTypes((t: string[]) => (t.indexOf(g) >= 0 ? t.filter((x: string) => x !== g) : [...t, g]));

  const muted = { ...theme.font.label, fontFamily: BODY, color: INK.lo };
  const pm = { ...theme.font.label, fontFamily: BODY, color: "#5a4128" };
  const pill = (on: boolean) => ({ ...theme.font.label, fontFamily: BODY, fontSize: "13px", cursor: "pointer", padding: "4px 10px", borderRadius: 4, whiteSpace: "nowrap" as const, border: `1px solid ${on ? "#ffb25e" : "#7a5a36"}`, background: on ? "linear-gradient(180deg, #b45c1f 0%, #6e3110 100%)" : "linear-gradient(180deg, #3d2e20 0%, #22180f 100%)", color: on ? "#fff3dc" : INK.mid, boxShadow: on ? "0 0 10px rgba(255,140,50,0.45), inset 0 1px 0 rgba(255,220,170,0.35)" : "inset 0 1px 0 rgba(255,225,170,0.10), 0 1px 2px rgba(0,0,0,0.6)", textShadow: "0 1px 1px rgba(0,0,0,0.7)", userSelect: "none" as const });
  const runeRule = (ink: string, glyphs: string) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8, color: ink, fontFamily: RUNIC, fontSize: 11, lineHeight: "14px", letterSpacing: 5 }}>
      <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${ink})` }} />
      <span>{glyphs}</span>
      <span style={{ flex: 1, height: 1, background: `linear-gradient(270deg, transparent, ${ink})` }} />
    </div>
  );
  const rivet = (pos: { top?: number; left?: number; right?: number; bottom?: number }) => <span style={{ position: "absolute", width: 8, height: 8, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, #e0d3b8 0%, #857259 35%, #2b2219 80%)", boxShadow: "0 1px 1px rgba(0,0,0,0.8)", pointerEvents: "none", ...pos }} />;

  const rels = (s: number): { from: [string, Rel[]][]; to: [string, Rel[]][] } => {
    const r = D[s];
    const from: [string, Rel[]][] = [];
    const to: [string, Rel[]][] = [];
    const push = (arr: [string, Rel[]][], title: string, list: Rel[]) => { if (list.length) arr.push([title, list]); };
    const stations = r.st.filter((x: number) => x >= 0);
    if (isCre(s)) push(from, "Summoned with", r.rec.map((x: number[]) => ({ i: x[0], label: `${x[1]}×`, k: "o" })));
    else if (isBuilt(s)) push(from, `Built with the Hammer${stations.length ? " near" : ""}`, [...(HAMMER >= 0 ? [{ i: HAMMER, label: "tool", k: "b" }] : []), ...stations.map((x: number) => ({ i: x, label: "near", k: "b" })), ...r.rec.map((x: number[]) => ({ i: x[0], label: `${x[1]}×`, k: "b" }))]);
    else if (r.rec.length || stations.length) push(from, `${stations.length ? "Crafted at station" : "Crafted by hand"}${r.lvl > 1 ? ` (level ${r.lvl})` : ""}${r.y > 1 ? ` · makes ${r.y}` : ""}`, [...stations.map((x: number) => ({ i: x, label: "station", k: "c" })), ...r.rec.map((x: number[]) => ({ i: x[0], label: `${x[1]}×`, k: "c" }))]);
    push(from, "Dropped by", DROPPERS[s].map((d: [number, string, string]) => ({ i: d[0], label: `${d[1]}% ${d[2]}×`, k: "d" })));
    if (s === COINS) push(from, "Sell valuables (any trader)", VALS.map((v: [number, string]) => ({ i: v[0], label: `${v[1]}c`, k: "t" })));
    const other: Rel[] = [];
    r.src.forEach((t: string) => {
      const c = t[0], body = t.slice(1), at = t.indexOf("@");
      if (c === "t") { other.push({ i: TRIDX[body[0]], label: `buy ${at >= 0 ? body.slice(1, at - 1) : body.slice(1)}c`, k: "t" }); if (at >= 0) other.push({ i: b(t.slice(at + 1)), label: "after", k: "g" }); }
      if (c === "g" && at >= 0) other.push({ i: b(t.slice(at + 1)), label: "tool", k: "o" });
      if (c === "l") other.push({ i: b(body), label: "laid by", k: "o" });
      if (c === "k") other.push({ i: b(body), label: "key", k: "o" });
      if (c === "b") other.push({ i: b(body), label: "bait", k: "o" });
      if (c === "e") other.push({ i: b(body), label: "upgrades", k: "b" });
    });
    push(from, "Trader, tool, unlock", other.filter((x: Rel) => ok(x.i)));
    r.ex.filter((t: string) => "uap".indexOf(t[0]) >= 0).forEach((t: string) => {
      const p = t.slice(1).split("~");
      push(from, xl(t), [...(p[1] ? p[1].split(">").map((x: string) => ({ i: b(x), label: "station", k: "c" })) : []), ...(p[2] ? p[2].split(",").map((x: string) => { const q = x.split("*"); return { i: b(q[0]), label: `${q.length > 1 ? q[1] : "1"}×`, k: "c" }; }) : [])].filter((x: Rel) => ok(x.i)));
    });
    push(from, "Fuel", r.ex.filter((t: string) => t[0] === "F").map((t: string) => ({ i: b(t.slice(1)), label: "", k: "o" })).filter((x: Rel) => ok(x.i)));
    if (r.t === "T") push(from, "Paid with", [{ i: COINS, label: "", k: "t" }]);
    const shown = new Set<number>();
    if (isCre(s)) { push(to, "Drops", r.dr.map((d: string[]) => ({ i: b(d[0]), label: `${d[1] || "100"}% ${d[2] || "1"}×`, k: "d" })).filter((x: Rel) => ok(x.i))); r.dr.forEach((d: string[]) => shown.add(b(d[0]))); }
    if (s === COINS) { const tr = Object.keys(TRIDX).map((k: string) => TRIDX[k]).filter(ok); push(to, "Spent at", tr.map((x: number) => ({ i: x, label: "", k: "t" }))); tr.forEach((x: number) => shown.add(x)); }
    push(to, "Sells", SELLS[s].map((x: [number, string, number]) => ({ i: x[0], label: `${x[1]}c`, k: "t" }))); SELLS[s].forEach((x: [number, string, number]) => shown.add(x[0]));
    push(to, "Unlocks at traders", GATES[s].map((x: number) => ({ i: x, label: "", k: "g" }))); GATES[s].forEach((x: number) => shown.add(x));
    push(to, "Station upgrades", UPGR[s].map((x: number) => ({ i: x, label: "", k: "b" }))); UPGR[s].forEach((x: number) => shown.add(x));
    const rest = DOWNS[s].filter((u: number) => !shown.has(u));
    const craft = rest.filter((u: number) => (EK.get(s + ">" + u) || "o") === "c");
    const build = rest.filter((u: number) => (EK.get(s + ">" + u) || "o") === "b");
    const oth = rest.filter((u: number) => craft.indexOf(u) < 0 && build.indexOf(u) < 0 && !isStructEdge(s, u));
    const qty = (u: number): string => { const x = D[u].rec.find((y: number[]) => y[0] === s); return x ? `${x[1]}×` : D[u].st.indexOf(s) >= 0 ? "here" : EXV.get(s + ">" + u) || ""; };
    push(to, r.t === "S" ? "Crafted here / with it" : "Used to craft", craft.map((u: number) => ({ i: u, label: qty(u), k: "c" })));
    push(to, r.t === "S" ? "Built near it / with it" : "Used to build", build.map((u: number) => ({ i: u, label: qty(u), k: "b" })));
    push(to, "Other uses", oth.map((u: number) => ({ i: u, label: EXV.get(s + ">" + u) || "", k: EK.get(s + ">" + u) || "o" })));
    return { from, to };
  };

  const relChip = (x: Rel, n: number) => (
    <div key={x.i + "-" + n} onClick={() => go(x.i)} style={{ ...theme.font.label, fontFamily: BODY, fontSize: "13px", cursor: "pointer", display: "inline-flex", gap: 4, alignItems: "baseline", padding: "3px 8px", borderRadius: 4, border: `2px solid ${KC[x.k]}`, background: "linear-gradient(180deg, #4a3522 0%, #2e2015 100%)", color: INK.hi, boxShadow: "0 1px 2px rgba(0,0,0,0.45)" }}>
      {x.label ? <span style={{ color: "#cdb98f" }}>{x.label}</span> : null}{D[x.i].n}{D[x.i].l !== lane ? <span style={{ color: "#cdb98f" }}>· {LANES[D[x.i].l]}</span> : null}
    </div>
  );
  const relBlock = (title: string, groups: [string, Rel[]][]) => (
    <div style={{ flex: "1 1 260px", minWidth: 0 }}>
      <div style={{ fontFamily: RUNE, fontSize: "15px", lineHeight: "20px", fontWeight: 700, letterSpacing: "0.04em", color: "#6a3211", marginBottom: 4, borderBottom: "1px solid rgba(106,50,17,0.35)", paddingBottom: 2 }}>{title}</div>
      {groups.length === 0 && <div style={pm}>—</div>}
      {groups.map(([t, list]: [string, Rel[]]) => (
        <div key={t} style={{ marginBottom: 8 }}>
          <div style={{ ...pm, marginBottom: 3 }}>{t}{list.length > 6 ? ` (${list.length})` : ""}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>{list.map((x: Rel, n: number) => relChip(x, n))}</div>
        </div>
      ))}
    </div>
  );

  const focus = () => {
    if (sel === null) return (
      <div style={{ ...theme.font.body2, fontFamily: BODY, fontStyle: "italic", color: "#4a3520", padding: 14 }}>Tap an item to see only what it comes from and what it leads to. Tap any linked item to jump to it; Back retraces your steps.</div>
    );
    const r = D[sel];
    const { from, to } = rels(sel);
    const src = r.src.filter((t: string) => t[0] === "x" || t[0] === "f" || (t[0] === "g")).map((t: string) => {
      const body = t.slice(1);
      if (t[0] === "f") return `Found in chests: ${body.split("").map((x: string) => LANES[+x]).join(", ")}`;
      if (t[0] === "g") { const at = body.indexOf("@"); const o = at >= 0 ? body.slice(0, at) : body; return `Gathered${o ? ": " + o.split(",").join(", ") : ""}`; }
      return body;
    });
    const vv = r.src.find((t: string) => t[0] === "v");
    return (
      <div style={{ padding: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontFamily: RUNE, fontSize: "20px", lineHeight: "26px", fontWeight: 700, letterSpacing: "0.02em", color: INK.dark }}>{r.n}{r.v === 0 ? " ?" : ""}</div>
            <div style={pm}>{LANES[r.l]} · {GL[r.t]}{r.sub ? ` · ${SUB_EN[r.sub] || r.sub}` : ""}{r.eats.length ? " · tameable" : ""} · {r.v === 2 ? "verified (valheim.tools)" : r.v === 1 ? "valheim.source.gs" : "unverified"}</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <div onClick={back} style={pill(false)}>← Back</div>
            <div onClick={() => { setSel(null); setHist([]); }} style={pill(false)}>Close ✕</div>
          </div>
        </div>
        <div style={{ marginTop: 6 }}>{runeRule("rgba(106,50,17,0.55)", BRUNE[r.l] + " ᛟ " + BRUNE[r.l])}</div>
        {(src.length > 0 || vv || r.note) && (
          <div style={{ ...theme.font.body2, fontFamily: BODY, color: "#3b2a18", marginTop: 6 }}>
            {[...src, ...(vv ? [`Sells to any trader for ${vv.slice(1)} Coins`] : []), ...(r.note ? [r.note] : [])].join(" · ")}
          </div>
        )}
        {r.eats.length > 0 && <div style={{ ...theme.font.body2, fontFamily: BODY, color: "#3b2a18", marginTop: 4 }}>Tame with: {r.eats.filter(ok).map((e: number) => D[e].n).join(", ")}</div>}
        <DetailExtras index={sel as number} onOpen={go} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 10 }}>
          {relBlock("← Comes from", from)}
          {relBlock("Leads to →", to)}
        </div>
      </div>
    );
  };

  const grid = () => {
    const forced = types.length > 0 || ql !== "";
    const secs: [Cat, number[]][] = CATS.map((c: Cat): [Cat, number[]] => [c, items.filter((i: number) => CAT[i] === c[0])]).filter((x: [Cat, number[]]) => x[1].length > 0);
    const chip = (i: number) => {
      const on = sel === i;
      const rel = sel !== null && (UPS[sel].indexOf(i) >= 0 || DOWNS[sel].indexOf(i) >= 0);
      return (
        <div key={i} onClick={() => (on ? setSel(null) : go(i))} style={{ ...theme.font.label, fontFamily: BODY, fontSize: "13px", cursor: "pointer", padding: "4px 9px", borderRadius: 4, border: `${on || rel ? 2 : 1}px solid ${on ? "#ffb25e" : rel ? "#d9a44e" : "#6e5232"}`, background: on ? "linear-gradient(180deg, #7a3a14 0%, #4a210b 100%)" : "linear-gradient(180deg, #45321f 0%, #2b1e13 100%)", color: INK.hi, boxShadow: on ? "0 0 10px rgba(255,140,50,0.55)" : "inset 0 1px 0 rgba(255,225,170,0.10), 0 1px 2px rgba(0,0,0,0.6)", fontWeight: "BMT".indexOf(D[i].t) >= 0 ? 700 : 400 }}>
          {D[i].n}{D[i].v === 0 ? " ?" : ""}{ql && D[i].l !== lane ? <span style={{ color: "#bfa983" }}> · {LANES[D[i].l]}</span> : null}
        </div>
      );
    };
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {items.length === 0 && <div style={muted}>Nothing matches.</div>}
        {secs.length > 1 && !forced && (
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <span onClick={() => { const o: Record<string, boolean> = {}; CATS.forEach((c: Cat) => { o[c[0]] = true; }); setOpen(o); }} style={{ ...muted, color: INK.mid, cursor: "pointer" }}>Expand all</span>
            <span onClick={() => { const o: Record<string, boolean> = {}; CATS.forEach((c: Cat) => { o[c[0]] = false; }); setOpen(o); }} style={{ ...muted, color: INK.mid, cursor: "pointer" }}>Collapse all</span>
          </div>
        )}
        {secs.map(([c, list]: [Cat, number[]], idx: number) => {
          const color = c[0] === "str" ? "#d7c4a3" : cat[CATS.indexOf(c) % cat.length];
          const isOpen = forced || (open[c[0]] !== undefined ? open[c[0]] : (wide || idx < 3));
          return (
            <div key={c[0]}>
              <div onClick={() => setOpen((o: Record<string, boolean>) => ({ ...o, [c[0]]: !isOpen }))} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "6px 2px", borderBottom: "1px solid rgba(160,120,70,0.35)", userSelect: "none" as const }}>
                <span style={{ width: 4, height: 16, borderRadius: 1, background: color, boxShadow: `0 0 6px ${color}88`, flex: "0 0 auto" }} />
                <span>{c[1]}</span>
                <span style={{ fontFamily: RUNE, fontSize: "14px", lineHeight: "20px", fontWeight: 700, letterSpacing: "0.03em", color: INK.hi, textShadow: "0 1px 2px #000", flex: 1 }}>{c[2]}</span>
                <span style={{ ...theme.font.label, fontFamily: BODY, color: INK.amber, padding: "0 7px", borderRadius: 3, background: "#1b130c", border: "1px solid #6e5232" }}>{list.length}</span>
                <span style={{ ...muted, color: INK.amber, width: 12, textAlign: "center" as const }}>{isOpen ? "▾" : "▸"}</span>
              </div>
              {isOpen && <div style={{ display: "flex", flexWrap: "wrap", gap: 5, padding: "7px 0 7px 10px", borderLeft: `2px solid ${color}66`, marginLeft: 1 }}>{list.map(chip)}</div>}
            </div>
          );
        })}
      </div>
    );
  };

  const card = { border: "1px solid #5c4329", borderRadius: 6, background: `${GRAIN}, rgba(12,9,6,0.66)`, boxShadow: "inset 0 1px 0 rgba(255,220,160,0.08), inset 0 0 22px rgba(0,0,0,0.65), 0 2px 8px rgba(0,0,0,0.5)", boxSizing: "border-box" as const, scrollbarColor: "#7a5a36 transparent" };
  const parch = { ...card, border: "1px solid #8a6a3e", background: `${NOISE}, radial-gradient(ellipse at 50% 35%, #f1e3c0 0%, #e4cf9f 65%, #c8aa72 100%)`, boxShadow: "inset 0 0 30px rgba(110,70,30,0.45), 0 3px 10px rgba(0,0,0,0.6)", color: INK.dark };
  const arrow = (on: boolean) => ({ ...pill(false), fontSize: "15px", padding: "8px 12px", opacity: on ? 1 : 0.4, color: INK.amber });
  return (
    <Page title="Valheim Progression — Compact" width="full">
      <style>{SKIN_CSS}</style>
      <div ref={rootRef} style={{ position: "relative", display: "flex", flexDirection: "column", gap: 8, padding: wide ? "16px 18px 14px" : "14px 10px 12px", borderRadius: 8, border: "2px solid #120c07", outline: "1px solid #6b5233", outlineOffset: -6, background: `radial-gradient(ellipse at 50% -10%, ${B[2]}40 0%, transparent 55%), radial-gradient(ellipse at 50% 112%, rgba(255,120,40,0.18) 0%, transparent 50%), ${NOISE}, ${GRAIN}, linear-gradient(180deg, ${B[0]} 0%, ${B[1]} 100%)`, boxShadow: "inset 0 0 70px rgba(0,0,0,0.75), 0 4px 18px rgba(0,0,0,0.45)", color: INK.hi, fontFamily: BODY }}
        onTouchStart={(e: { touches: ArrayLike<{ clientX: number }> }) => { touch.current = e.touches[0].clientX; }}
        onTouchEnd={(e: { changedTouches: ArrayLike<{ clientX: number }> }) => {
          if (touch.current === null || sel !== null) return;
          const dx = e.changedTouches[0].clientX - touch.current; touch.current = null;
          if (Math.abs(dx) > 60) setLane((l: number) => Math.max(0, Math.min(8, l + (dx < 0 ? 1 : -1))));
        }}>
        {rivet({ top: 3, left: 3 })}{rivet({ top: 3, right: 3 })}{rivet({ bottom: 3, left: 3 })}{rivet({ bottom: 3, right: 3 })}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div onClick={() => setLane((l: number) => Math.max(0, l - 1))} style={arrow(lane > 0)}>◀</div>
          <div style={{ flex: 1, textAlign: "center" as const, minWidth: 0 }}>
            <div style={{ fontFamily: RUNE, fontSize: wide ? "24px" : "20px", lineHeight: wide ? "30px" : "26px", fontWeight: 700, letterSpacing: "0.06em", color: INK.hi, textShadow: `0 0 14px ${B[2]}66, 0 2px 3px #000` }}>
              <span style={{ fontFamily: RUNIC, fontWeight: 400, color: B[2], marginRight: 8 }}>{BRUNE[lane]}</span>{lane < 8 ? `${lane + 1}. ` : ""}{LANES[lane]}<span style={{ fontFamily: RUNIC, fontWeight: 400, color: B[2], marginLeft: 8 }}>{BRUNE[lane]}</span>
            </div>
            <div style={{ ...muted, color: INK.mid }}>{LANE_SUB[lane]} · {COUNTS[lane]} entries</div>
          </div>
          <div onClick={() => setLane((l: number) => Math.min(8, l + 1))} style={arrow(lane < 8)}>▶</div>
        </div>
        {runeRule("rgba(232,176,79,0.65)", "ᚠᚢᚦᚨᚱᚲ")}
        {wide && (
          <div style={{ display: "flex", gap: 4, justifyContent: "center", flexWrap: "wrap" }}>
            {LANES.map((l: string, i: number) => <div key={l} onClick={() => setLane(i)} style={pill(i === lane)}>{l}</div>)}
          </div>
        )}
        <div className="vh-scroll" style={{ display: "flex", gap: 5, overflowX: "auto", paddingBottom: 3, alignItems: "center", scrollbarColor: "#7a5a36 transparent" }}>
          <input className="vh-in" value={q} onChange={(e: { target: { value: string } }) => setQ(e.target.value)} placeholder="Search all biomes" style={{ ...theme.font.label, fontFamily: BODY, fontSize: "14px", padding: "5px 9px", borderRadius: 4, border: "1px solid #7a5a36", background: "#120d09", color: INK.hi, boxShadow: "inset 0 2px 4px rgba(0,0,0,0.8)", outline: "none", minWidth: 140, flex: "0 0 auto" }} />
          <div onClick={() => setTypes([])} style={pill(types.length === 0)}>All</div>
          {present.map((c: Cat) => <div key={c[0]} onClick={() => toggleType(c[0])} style={pill(types.indexOf(c[0]) >= 0)}>{c[1]} {c[3]}</div>)}
        </div>
        <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: 8, height: boxH }}>
          {(wide || sel === null) && (
            <div className="vh-scroll" style={{ ...card, flex: wide ? "0 0 44%" : "1 1 auto", overflowY: "auto", padding: 10, minHeight: 0 }}>{grid()}</div>
          )}
          {(wide || sel !== null) && (
            <div className="vh-scroll" style={{ ...parch, flex: "1 1 auto", overflowY: "auto", minHeight: 0 }}>{focus()}</div>
          )}
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          {KINDS.map((k: [string, string]) => (
            <span key={k[0]} style={{ ...muted, display: "inline-flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, border: `2px solid ${KC[k[0]]}`, background: "#2e2015", display: "inline-block" }} />{k[1]}</span>
          ))}
          <span style={muted}>· ← → keys or swipe change biome · “?” = unverified · full graph: Valheim Progression page</span>
        </div>
      </div>
    </Page>
  );
}
