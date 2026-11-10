import { useEffect, useMemo, useState } from "react";
import { D, LANES, ok } from "./graph";
import { buildCombinedPlan, combinedToDiscord, combinedToText } from "./plan";
import {
  BOSS_INDEXES,
  MAX_STATION_LEVEL,
  STATION_INDEXES,
  evaluateProgress,
  exportProgress,
  normalizeProgress,
  resetProgress,
  setProgress,
  setStationLevel,
  toggleBoss,
  toggleOwned,
  toggleProgress,
  useProgress,
} from "./progress";
import {
  copyText,
  formatPlan,
  parsePlan,
  removePin,
  slugFor,
  upsertPin,
  type PlanPin,
} from "./urlState";

function useToast(): [string, (text: string) => void] {
  const [text, setText] = useState("");
  useEffect(() => {
    if (!text) return;
    const id = window.setTimeout(() => setText(""), 1600);
    return () => window.clearTimeout(id);
  }, [text]);
  return [text, setText];
}

export function PlayerBar({ plan, onPlan }: { plan: string; onPlan: (plan: string) => void }) {
  const progress = useProgress();
  const [stationsOpen, setStationsOpen] = useState(false);
  const [ownedOpen, setOwnedOpen] = useState(false);
  const [pinsOpen, setPinsOpen] = useState(() => parsePlan(plan).length > 0);
  const [json, setJson] = useState("");
  const [importError, setImportError] = useState("");
  const [alt, setAlt] = useState(false);
  const [toast, setToast] = useToast();
  const pins = useMemo(() => parsePlan(plan), [plan]);
  const combined = useMemo(() => buildCombinedPlan(pins, alt), [pins, alt]);

  return (
    <div className="vh-player" data-vh-player="">
      <div className="vh-chips" style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        <button
          type="button"
          className={"vh-btn vh-chip vh-iron" + (progress.on ? " vh-iron-on" : "")}
          aria-pressed={progress.on}
          onClick={() => toggleProgress(!progress.on)}
        >Progress</button>
        <button
          type="button"
          className={"vh-btn vh-chip vh-iron" + (pinsOpen ? " vh-iron-on" : "")}
          aria-expanded={pinsOpen}
          onClick={() => setPinsOpen((open) => !open)}
        >{pins.length ? `Pins ${pins.length}` : "Pins"}</button>
      </div>
      {progress.on ? (
        <div className="vh-editor" data-vh-progress="">
          <p className="vh-editor-note">Tick each boss you have defeated. A later biome stays dim until every boss before it is defeated. A gold edge means the item can be crafted from what those open biomes provide. Set a station to Not built if you have not built it. Mark an item as owned when you already have it.</p>
          <div className="vh-chips" role="group" aria-label="Bosses defeated" style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {BOSS_INDEXES.map((index) => {
              const slug = slugFor(index);
              const on = progress.bosses.includes(slug);
              return (
                <button
                  key={slug}
                  type="button"
                  className={"vh-btn vh-chip vh-iron" + (on ? " vh-iron-on" : "")}
                  aria-pressed={on}
                  onClick={() => toggleBoss(slug)}
                >{D[index].n}</button>
              );
            })}
          </div>
          <div className="vh-chips" style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            <button type="button" className="vh-btn vh-chip vh-iron" aria-expanded={stationsOpen} onClick={() => setStationsOpen((open) => !open)}>Stations</button>
            <button type="button" className="vh-btn vh-chip vh-iron" aria-expanded={ownedOpen} onClick={() => setOwnedOpen((open) => !open)}>Owned items {progress.items.length || ""}</button>
            <button type="button" className="vh-btn vh-chip vh-iron" onClick={() => { setJson(exportProgress(progress)); void copyText(exportProgress(progress)).then((okCopy) => { if (okCopy) setToast("Copied"); }); }}>Export JSON</button>
            <button type="button" className="vh-btn vh-chip vh-iron" onClick={() => { const next = normalizeProgress(safeParse(json)); if (!next) { setImportError("Could not read that progress file."); return; } setImportError(""); setProgress({ ...next, on: true }); setToast("Imported"); }}>Import JSON</button>
            <button type="button" className="vh-btn vh-chip vh-iron" onClick={() => { resetProgress(); setImportError(""); }}>Reset progress</button>
            {toast ? <span className="vh-toast" role="status">{toast}</span> : null}
          </div>
          {importError ? <p className="vh-editor-note" role="alert">{importError}</p> : null}
          <label className="vh-editor-note" style={{ display: "block" }}>
            Progress JSON
            <textarea className="vh-in vh-json" aria-label="Progress JSON" value={json} onChange={(event) => { setJson(event.target.value); setImportError(""); }} />
          </label>
          {stationsOpen ? (
            <ul className="vh-station-list">
              {STATION_INDEXES.map((index) => {
                const slug = slugFor(index);
                const value = Object.prototype.hasOwnProperty.call(progress.stations, slug) ? String(progress.stations[slug]) : "auto";
                return (
                  <li key={slug}>
                    <span>{D[index].n}</span>
                    <span className="vh-farm-meta">{LANES[D[index].l]}</span>
                    <select
                      className="vh-in"
                      aria-label={`${D[index].n} level`}
                      value={value}
                      onChange={(event) => {
                        const picked = event.target.value;
                        setStationLevel(slug, picked === "auto" ? null : Number(picked));
                      }}
                    >
                      <option value="auto">Auto</option>
                      <option value="0">Not built</option>
                      {Array.from({ length: MAX_STATION_LEVEL }, (_, n) => n + 1).map((level) => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </li>
                );
              })}
            </ul>
          ) : null}
          {ownedOpen ? (
            <ul className="vh-chips" style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {progress.items.length === 0 ? <li className="vh-editor-note">No owned items yet. Open an item and mark it.</li> : null}
              {progress.items.map((slug) => {
                const index = D.findIndex((_, i) => slugFor(i) === slug);
                if (!ok(index)) return null;
                return (
                  <li key={slug}>
                    <button type="button" className="vh-btn vh-chip vh-iron" onClick={() => toggleOwned(index)}>{D[index].n} ✕</button>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      ) : null}
      {pinsOpen ? (
        <PinsEditor pins={pins} alt={alt} onAlt={setAlt} combinedText={combinedToText(combined)} discordText={combinedToDiscord(combined)} rawSummary={rawSummary(combined)} onPlan={onPlan} />
      ) : null}
    </div>
  );
}

function rawSummary(plan: ReturnType<typeof buildCombinedPlan>): string {
  const rows = plan.rawGroups.flatMap((group) => group.raws.map((raw) => `${D[raw.index].n} × ${raw.qty}`));
  if (!rows.length) return plan.pins.length ? "No raw materials." : "";
  return rows.join(", ");
}

function PinsEditor({
  pins,
  alt,
  onAlt,
  combinedText,
  discordText,
  rawSummary,
  onPlan,
}: {
  pins: PlanPin[];
  alt: boolean;
  onAlt: (alt: boolean) => void;
  combinedText: string;
  discordText: string;
  rawSummary: string;
  onPlan: (plan: string) => void;
}) {
  const [toast, setToast] = useToast();
  return (
    <div className="vh-editor" data-vh-pins="">
      {pins.length === 0 ? <p className="vh-editor-note">Nothing pinned yet. Open an item and pin it, or share a plan link.</p> : null}
      <ul className="vh-station-list">
        {pins.map((pin) => (
          <li key={pin.index}>
            <span>{D[pin.index].n}</span>
            <label className="vh-editor-note">
              Qty
              <input
                className="vh-in"
                type="number"
                min={1}
                max={9999}
                aria-label={`Quantity of ${D[pin.index].n}`}
                value={pin.qty}
                onChange={(event) => onPlan(formatPlan(upsertPin(pins, pin.index, Number(event.target.value) || 1)))}
              />
            </label>
            <button type="button" className="vh-btn vh-chip vh-iron" aria-label={`Remove ${D[pin.index].n}`} onClick={() => onPlan(formatPlan(removePin(pins, pin.index)))}>Remove</button>
          </li>
        ))}
      </ul>
      {rawSummary ? <p className="vh-editor-note" data-vh-plan-raw="">Raw: {rawSummary}</p> : null}
      <div className="vh-chips" style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        <button type="button" className={"vh-btn vh-chip vh-iron" + (alt ? " vh-iron-on" : "")} aria-pressed={alt} onClick={() => onAlt(!alt)}>Alt recipes</button>
        <button type="button" className="vh-btn vh-chip vh-iron" disabled={!pins.length} onClick={() => { void copyText(combinedText).then((okCopy) => { if (okCopy) setToast("Copied"); }); }}>Copy as text</button>
        <button type="button" className="vh-btn vh-chip vh-iron" disabled={!pins.length} onClick={() => { void copyText(discordText).then((okCopy) => { if (okCopy) setToast("Copied"); }); }}>Copy for Discord</button>
        <button type="button" className="vh-btn vh-chip vh-iron" disabled={!pins.length} onClick={() => onPlan("")}>Clear pins</button>
        {toast ? <span className="vh-toast" role="status">{toast}</span> : null}
      </div>
    </div>
  );
}

export function ItemFlags({ index, plan, onPlan, qty }: { index: number; plan: string; onPlan: (plan: string) => void; qty?: number }) {
  const progress = useProgress();
  const pins = parsePlan(plan);
  const pinned = pins.some((pin) => pin.index === index);
  const slug = slugFor(index);
  const owned = progress.on && progress.items.includes(slug);
  const mark = useMemo(() => (progress.on ? evaluateProgress(progress)[index] : null), [progress, index]);
  const pinQty = Math.max(1, Math.floor(qty || 1));
  return (
    <div className="vh-chips" style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8, alignItems: "center" }}>
      {mark?.gated ? <span className="vh-editor-note" data-vh-progress-note="">Gated until {mark.gate}</span> : null}
      {mark?.craftable ? <span className="vh-editor-note" data-vh-progress-note="">Craftable now</span> : null}
      {mark?.owned ? <span className="vh-editor-note" data-vh-progress-note="">Owned</span> : null}
      {progress.on ? (
        <button type="button" className={"vh-btn vh-chip vh-iron" + (owned ? " vh-iron-on" : "")} aria-pressed={owned} onClick={() => toggleOwned(index)}>
          {owned ? "Owned" : "I have this"}
        </button>
      ) : null}
      <button
        type="button"
        className={"vh-btn vh-chip vh-iron" + (pinned ? " vh-iron-on" : "")}
        aria-pressed={pinned}
        onClick={() => onPlan(formatPlan(pinned ? removePin(parsePlan(plan), index) : upsertPin(parsePlan(plan), index, pinQty)))}
      >{pinned ? "Pinned" : pinQty > 1 ? `Pin × ${pinQty}` : "Pin"}</button>
    </div>
  );
}

function safeParse(text: string): unknown {
  try { return JSON.parse(text); } catch { return null; }
}
