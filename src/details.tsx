import type { CSSProperties, ReactNode } from "react";
import { D, FINDS, STRUCTS, WIKI, find, ok } from "./graph";

const BODY = "'Alegreya', 'Palatino Linotype', Palatino, Georgia, serif";
const RUNE = "'Cinzel', 'Palatino Linotype', Palatino, Georgia, serif";

const h = { fontFamily: RUNE, fontSize: "15px", lineHeight: "20px", fontWeight: 700, letterSpacing: "0.03em", color: "#6a3211", margin: "12px 0 4px" };
const meta: CSSProperties = { fontFamily: BODY, fontSize: "13px", lineHeight: "18px", color: "#5a4128" };
const chip = (click: boolean): CSSProperties => ({
  fontFamily: BODY, fontSize: "13px", lineHeight: "18px",
  display: "inline-flex", gap: 4, alignItems: "baseline",
  padding: "3px 8px", borderRadius: 4, margin: "0 6px 6px 0",
  border: "1px solid #6e5232",
  background: click ? "linear-gradient(180deg, #4a3522 0%, #2e2015 100%)" : "transparent",
  color: click ? "#f3e6c8" : "#3b2a18",
  cursor: click ? "pointer" : "default",
  boxShadow: click ? "0 1px 2px rgba(0,0,0,0.45)" : undefined,
});

function Linked({ name, inDataset, onOpen }: { name: string; inDataset: boolean; onOpen: (i: number) => void }) {
  const i = inDataset ? find(name) : -1;
  if (ok(i)) return <span style={chip(true)} onClick={() => onOpen(i)}>{name}</span>;
  return <span style={chip(false)}>{name}</span>;
}

function Rows({ children }: { children: ReactNode }) {
  return <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline" }}>{children}</div>;
}

const viaLabel = (via: string): string => {
  if (via === "miniboss_drop") return "miniboss drop";
  if (via === "spawn") return "spawn";
  return via || "found";
};

export function DetailExtras({ index, onOpen }: { index: number; onOpen: (i: number) => void }) {
  const wiki = WIKI[index];
  const finds = FINDS[index];
  const structure = STRUCTS[index];
  const spawnsAt = finds.filter((f) => f.via === "spawn");
  const found = finds.filter((f) => f.via !== "spawn");
  return (
    <div>
      {wiki?.summary ? <div style={{ ...meta, color: "#3b2a18", marginTop: 8 }}>{wiki.summary}</div> : null}
      {wiki && wiki.stats.length > 0 ? (
        <div style={{ marginTop: 8, overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 220 }}>
            <tbody>
              {wiki.stats.map(([k, v]) => (
                <tr key={k}>
                  <th style={{ ...meta, textAlign: "left", fontWeight: 700, color: "#6a3211", padding: "3px 8px 3px 0", whiteSpace: "nowrap", verticalAlign: "top" }}>{k}</th>
                  <td style={{ ...meta, color: "#3b2a18", padding: "3px 0" }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {wiki?.wiki ? (
        <div style={{ marginTop: 6 }}>
          <a href={wiki.wiki} target="_blank" rel="noopener noreferrer" style={{ fontFamily: RUNE, fontSize: "14px", color: "#8a3e12", fontWeight: 700 }}>
            {wiki.mentioned ? "Related wiki page" : "Valheim Wiki"}
          </a>
        </div>
      ) : null}
      {found.length > 0 ? (
        <div>
          <div style={h}>Found in</div>
          <Rows>
            {found.map((f, n) => (
              <span key={f.structure + n}>
                <Linked name={f.structure} inDataset={ok(f.index)} onOpen={onOpen} />
                <span style={meta}>
                  ({viaLabel(f.via)}{f.chance ? `, ${f.chance}` : ""}{f.amount ? `, ${f.amount}` : ""})
                </span>
              </span>
            ))}
          </Rows>
        </div>
      ) : null}
      {spawnsAt.length > 0 ? (
        <div>
          <div style={h}>Spawns at</div>
          <Rows>
            {spawnsAt.map((f, n) => (
              <span key={f.structure + n}>
                <Linked name={f.structure} inDataset={ok(f.index)} onOpen={onOpen} />
                {f.chance ? <span style={meta}>({f.chance})</span> : null}
              </span>
            ))}
          </Rows>
        </div>
      ) : null}
      {structure ? (
        <div>
          {structure.spawns.length > 0 ? (
            <div>
              <div style={h}>Spawns here</div>
              {structure.spawns.map((s) => (
                <div key={s.item} style={{ marginBottom: 4 }}>
                  <Linked name={s.item} inDataset={s.inDataset} onOpen={onOpen} />
                  {s.where ? <span style={meta}>{s.where}</span> : null}
                </div>
              ))}
            </div>
          ) : null}
          {structure.chests.map((c, n) => (
            <div key={c.container + n}>
              <div style={h}>Chest loot · {c.container}</div>
              {c.rolls ? <div style={{ ...meta, marginBottom: 4 }}>{c.rolls}</div> : null}
              <LootTable rows={c.loot} onOpen={onOpen} />
            </div>
          ))}
          {structure.pickables.length > 0 ? (
            <div>
              <div style={h}>Pickables</div>
              {structure.pickables.map((p) => (
                <div key={p.item + p.where} style={{ marginBottom: 4 }}>
                  <Linked name={p.item} inDataset={p.inDataset} onOpen={onOpen} />
                  {p.where ? <span style={meta}>{p.where}</span> : null}
                </div>
              ))}
            </div>
          ) : null}
          {structure.breakables.map((c, n) => (
            <div key={c.container + n}>
              <div style={h}>Breakable · {c.container}</div>
              {c.rolls ? <div style={{ ...meta, marginBottom: 4 }}>{c.rolls}</div> : null}
              <LootTable rows={c.loot} onOpen={onOpen} />
            </div>
          ))}
          {structure.requirements.length > 0 ? (
            <div>
              <div style={h}>Requirements</div>
              {structure.requirements.map((r) => <div key={r} style={{ ...meta, color: "#3b2a18", marginBottom: 2 }}>{r}</div>)}
            </div>
          ) : null}
          {structure.vegvisir.length > 0 ? (
            <div>
              <div style={h}>Vegvisir</div>
              <div style={{ ...meta, color: "#3b2a18" }}>{structure.vegvisir.join("; ")}</div>
            </div>
          ) : null}
          {structure.miniboss.length > 0 ? (
            <div>
              <div style={h}>Miniboss drops</div>
              {structure.miniboss.map((m) => (
                <div key={m.miniboss + m.drops} style={{ marginBottom: 4 }}>
                  <Linked name={m.miniboss} inDataset={find(m.miniboss) >= 0} onOpen={onOpen} />
                  <span style={meta}>drops </span>
                  <Linked name={m.drops} inDataset={find(m.drops) >= 0} onOpen={onOpen} />
                </div>
              ))}
            </div>
          ) : null}
          {D[index].note ? null : null}
        </div>
      ) : null}
    </div>
  );
}

function LootTable({ rows, onOpen }: { rows: { item: string; amount: string; chance: string; inDataset: boolean }[]; onOpen: (i: number) => void }) {
  if (!rows.length) return null;
  const cell: CSSProperties = { ...meta, color: "#3b2a18", textAlign: "left", padding: "4px 8px 4px 0", verticalAlign: "top", borderBottom: "1px solid rgba(106,50,17,0.25)" };
  return (
    <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
      <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 280 }}>
        <thead>
          <tr>
            {["Item", "Amount", "Chance"].map((c) => <th key={c} style={{ ...cell, fontFamily: RUNE, color: "#6a3211", fontWeight: 700 }}>{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, n) => (
            <tr key={r.item + n}>
              <td style={cell}><Linked name={r.item} inDataset={r.inDataset} onOpen={onOpen} /></td>
              <td style={cell}>{r.amount}</td>
              <td style={cell}>{r.chance}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
