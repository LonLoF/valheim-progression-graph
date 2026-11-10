import { useEffect, useMemo, useState, type ReactNode } from "react";
import { D, FOOD_ROLE, LANES, ok, type FoodRole } from "./graph";
import { earliestLane, farmSources, sourceDetail } from "./farm";
import { biomeName, laddersFor, nextBetter, qualitySteps } from "./ladders";
import { buildPlan, hasAltRecipe, planToText } from "./plan";
import { ItemFlags } from "./playerTools";
import { copyText, formatPlan, parsePlan, upsertPin } from "./urlState";

const ROLES: FoodRole[] = ["Health", "Stamina", "Eitr", "Balanced"];

export function FoodBadge({ index }: { index: number }) {
  const role = FOOD_ROLE[index];
  if (!role) return null;
  const short = role === "Health" ? "HP" : role === "Stamina" ? "STA" : role === "Eitr" ? "EIT" : "BAL";
  return <span aria-hidden="true" data-vh-food={role} className={`vh-food vh-food-${role.toLowerCase()}`} title={role}>{short}</span>;
}

export function FoodFilters({ value, onChange }: { value: FoodRole | "all"; onChange: (value: FoodRole | "all") => void }) {
  const options: { id: FoodRole | "all"; label: string }[] = [
    { id: "all", label: "Any food" },
    ...ROLES.map((role) => ({ id: role, label: role })),
  ];
  return (
    <div className="vh-chips" role="group" aria-label="Food type" style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          className={"vh-btn vh-chip vh-iron" + (value === option.id ? " vh-iron-on" : "")}
          aria-pressed={value === option.id}
          onClick={() => onChange(option.id)}
        >{option.label}</button>
      ))}
    </div>
  );
}

export function passesFood(index: number, filter: FoodRole | "all"): boolean {
  if (filter === "all") return true;
  const role = FOOD_ROLE[index];
  if (role == null) {
    const type = D[index].t;
    return type !== "f" && type !== "d" && type !== "h";
  }
  return role === filter;
}

export function PanelActions({ onBack, onClose }: { onBack: () => void; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(id);
  }, [copied]);
  return (
    <div className="vh-chips vh-panel-actions">
      <button type="button" className="vh-btn vh-chip vh-iron" onClick={onBack}>← Back</button>
      <button
        type="button"
        className="vh-btn vh-chip vh-iron"
        onClick={() => { void copyText(location.href).then((okCopy) => { if (okCopy) setCopied(true); }); }}
      >Copy link</button>
      {copied ? <span className="vh-toast" role="status">Copied</span> : null}
      <button type="button" className="vh-btn vh-chip vh-iron" onClick={onClose}>Close ✕</button>
    </div>
  );
}

export function FarmRank({ index, onOpen }: { index: number; onOpen: (i: number) => void }) {
  const sources = farmSources(index).slice(0, 6);
  if (!sources.length) return null;
  const earliest = earliestLane(sources);
  return (
    <div data-vh-farm="" className="vh-farm">
      <div className="vh-farm-title">Where to farm</div>
      {earliest != null ? <div className="vh-farm-meta">Earliest lane: {LANES[earliest]}</div> : null}
      <ul className="vh-chips vh-farm-list">
        {sources.map((source) => (
          <li key={source.kind + source.label + source.lane}>
            {ok(source.index) ? (
              <button type="button" className="vh-btn vh-chip" data-vh-jump="" data-vh-name={D[source.index].n} onClick={() => onOpen(source.index)}>
                {source.label}
              </button>
            ) : <span className="vh-farm-label">{source.label}</span>}
            <span className="vh-farm-meta">{sourceDetail(source)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function NextBetter({ index, onOpen }: { index: number; onOpen: (i: number) => void }) {
  const next = nextBetter(index);
  const steps = qualitySteps(index);
  if (next == null && !steps.length) return null;
  const station = steps.find((step) => step.station >= 0);
  return (
    <div className="vh-next">
      {steps.length > 0 ? (
        <div className="vh-farm-meta">
          Levels {steps.map((step) => step.quality).join(" → ")}
          {station ? ` · ${D[station.station].n}${station.level > 1 ? ` lvl ${station.level}` : ""}` : ""}
        </div>
      ) : null}
      {next != null ? (
        <button type="button" className="vh-btn vh-chip" data-vh-jump="" data-vh-name={D[next].n} onClick={() => onOpen(next)}>
          Next better: {D[next].n} · {biomeName(next)}
        </button>
      ) : null}
    </div>
  );
}

function PlanPanel({ index, onOpen, shared, onPlan }: { index: number; onOpen: (i: number) => void; shared: string; onPlan: (plan: string) => void }) {
  const [qty, setQty] = useState(1);
  const [alt, setAlt] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => { setQty(1); setAlt(false); }, [index]);
  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(id);
  }, [copied]);
  const plan = useMemo(() => buildPlan(index, qty, alt), [index, qty, alt]);
  const text = planToText(plan);
  const altOk = hasAltRecipe(index);
  return (
    <div className="vh-plan" data-vh-plan="">
      <div className="vh-chips vh-plan-bar">
        <label className="vh-plan-qty">
          Quantity
          <input
            className="vh-in"
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            aria-label="Quantity"
            value={qty}
            onChange={(e) => setQty(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
          />
        </label>
        <button type="button" className={"vh-btn vh-chip vh-iron" + (alt ? " vh-iron-on" : "")} aria-pressed={alt} disabled={!altOk} onClick={() => setAlt((on) => !on)}>Alt recipes</button>
        <button type="button" className="vh-btn vh-chip vh-iron" onClick={() => onPlan(formatPlan(upsertPin(parsePlan(shared), index, qty)))}>Pin × {qty}</button>
        <button type="button" className="vh-btn vh-chip vh-iron" onClick={() => { void copyText(text).then((okCopy) => { if (okCopy) setCopied(true); }); }}>Copy as text</button>
        {copied ? <span className="vh-toast" role="status">Copied</span> : null}
      </div>
      {plan.groups.map((group) => (
        <div key={group.title} className="vh-plan-group">
          <div className="vh-farm-title">{group.title}</div>
          <ul className="vh-chips">
            {group.steps.map((step) => (
              <li key={step.index}>
                <button type="button" className="vh-btn vh-chip" data-vh-jump="" data-vh-name={D[step.index].n} onClick={() => onOpen(step.index)}>
                  {D[step.index].n} × {step.output}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
      {!plan.groups.length ? <div className="vh-farm-meta">Nothing to craft. The item is gathered or dropped.</div> : null}
      {plan.rawGroups.map((group) => (
        <div key={group.lane} className="vh-plan-group">
          <div className="vh-farm-title">Raw · {LANES[group.lane]}</div>
          <ul className="vh-farm-list">
            {group.raws.map((raw) => (
              <li key={raw.index}>
                <button type="button" className="vh-btn vh-chip" data-vh-jump="" data-vh-name={D[raw.index].n} onClick={() => onOpen(raw.index)}>
                  {D[raw.index].n} × {raw.qty}
                </button>
                <span className="vh-farm-meta">{raw.best}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function PathPanel({ index, onOpen }: { index: number; onOpen: (i: number) => void }) {
  const ladders = laddersFor(index);
  const own = ladders.find((ladder) => ladder.items.includes(index))?.id || ladders[0]?.id || "";
  const [active, setActive] = useState(own);
  useEffect(() => setActive(own), [own, index]);
  const ladder = ladders.find((item) => item.id === active) || ladders[0];
  if (!ladders.length) return <div className="vh-farm-meta">No material ladder for this item. Quality levels, when the game has them, are listed on the Item tab.</div>;
  return (
    <div data-vh-path="">
      <label className="vh-plan-qty">
        Ladder
        <select className="vh-in" aria-label="Progression ladder" value={ladder?.id || ""} onChange={(e) => setActive(e.target.value)}>
          {ladders.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select>
      </label>
      {ladder ? (
        <ol className="vh-ladder">
          {ladder.items.map((item) => (
            <li key={item} className={item === index ? "vh-ladder-on" : undefined}>
              <button type="button" className="vh-btn vh-chip" aria-current={item === index ? "true" : undefined} data-vh-jump="" data-vh-name={D[item].n} onClick={() => onOpen(item)}>
                {D[item].n}
              </button>
              <span className="vh-farm-meta">{biomeName(item)}</span>
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}

export function DetailTabs({ index, onOpen, plan, onPlan, children }: { index: number; onOpen: (i: number) => void; plan: string; onPlan: (plan: string) => void; children: ReactNode }) {
  const [tab, setTab] = useState<"item" | "plan" | "path">("item");
  useEffect(() => setTab("item"), [index]);
  const tabs = [
    ["item", "Item"],
    ["plan", "Plan"],
    ["path", "Progression"],
  ] as const;
  return (
    <div>
      <div className="vh-chips vh-tabs" role="tablist" aria-label="Item details">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={"vh-btn vh-chip vh-iron" + (tab === id ? " vh-iron-on" : "")}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
          >{label}</button>
        ))}
      </div>
      <ItemFlags index={index} plan={plan} onPlan={onPlan} />
      {tab === "item" ? children : null}
      {tab === "plan" ? <PlanPanel index={index} onOpen={onOpen} shared={plan} onPlan={onPlan} /> : null}
      {tab === "path" ? <PathPanel index={index} onOpen={onOpen} /> : null}
    </div>
  );
}
