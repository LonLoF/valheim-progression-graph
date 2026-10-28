/**
 * Stand-in for the host "grok/canvas" (and "grok-canvas") module.
 * Dark Grok page tokens, plus the blocks these two views import.
 */
import { createContext, useContext, useState, type CSSProperties, type ReactNode } from "react";

export { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
export type { CSSProperties, ReactNode } from "react";

type TextStyle = {
  fontSize: string;
  lineHeight: string;
  letterSpacing: string;
};

const font = {
  family: '-apple-system, BlinkMacSystemFont, system-ui, "Segoe UI", sans-serif',
  mono: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  heading1: { fontSize: "30px", lineHeight: "36px", letterSpacing: "-0.4px" } satisfies TextStyle,
  heading2: { fontSize: "24px", lineHeight: "30px", letterSpacing: "-0.25px" } satisfies TextStyle,
  heading3: { fontSize: "20px", lineHeight: "26px", letterSpacing: "-0.1px" } satisfies TextStyle,
  body1: { fontSize: "16px", lineHeight: "24px", letterSpacing: "0.1px" } satisfies TextStyle,
  subtext: { fontSize: "14px", lineHeight: "20px", letterSpacing: "0.1px" } satisfies TextStyle,
  table: { fontSize: "15px", lineHeight: "22px", letterSpacing: "0.1px" } satisfies TextStyle,
  metric: { fontSize: "24px", lineHeight: "30px", letterSpacing: "-0.25px" } satisfies TextStyle,
  body2: { fontSize: "13px", lineHeight: "18px", letterSpacing: "-0.08px" } satisfies TextStyle,
  label: { fontSize: "12px", lineHeight: "16px", letterSpacing: "0" } satisfies TextStyle,
  caption: { fontSize: "11px", lineHeight: "16px", letterSpacing: "0.055px" } satisfies TextStyle,
  code: { fontSize: "13px", lineHeight: "20px", letterSpacing: "0" } satisfies TextStyle,
};

const DARK = {
  kind: "dark" as const,
  bg: { base: "#070707", subtle: "#111111", elevated: "#181818" },
  text: {
    primary: "#fcfcfc",
    secondary: "#fcfcfc99",
    tertiary: "#fcfcfc66",
    onColor: "#fcfcfc",
    onPrimary: "#141414",
    accent: "#459ffe",
    success: "#38d591",
    warning: "#ffaf38",
    danger: "#ff5667",
    accentDeep: "#80befe",
    successDeep: "#78e2b4",
    warningDeep: "#ffc878",
    dangerDeep: "#ff8c98",
  },
  fill: {
    primary: "#fafafa",
    primaryHover: "#d5d5d5",
    secondary: "#7777772c",
    secondaryHover: "#77777747",
    hover: "#fcfcfc14",
    pressed: "#fcfcfc1f",
    accent: "#1084fe",
    controlChecked: "#5a5a5a",
    accentSubtle: "#1084fe2c",
    successSubtle: "#00c9722c",
    warningSubtle: "#ff98002c",
    dangerSubtle: "#ff263c2c",
  },
  border: {
    subtle: "#fcfcfc0d",
    weak: "#fcfcfc1a",
    default: "#fcfcfc26",
    strong: "#fcfcfc4d",
    focus: "#fcfcfc66",
  },
  font,
  weight: { regular: 400 as const, medium: 500 as const, semibold: 600 as const },
  radius: { sm: 4 as const, md: 8 as const, lg: 12 as const, xl: 16 as const, full: 9999 as const },
  motion: { hover: "140ms", easing: "ease" },
  dataviz: {
    categorical: ["#1084FE", "#FF9800", "#00BCA6"] as const,
    other: "#777777",
    negative: "#FF263C",
    singleSeriesRest: "#084382",
    areaAlpha: "3D",
    bandAlpha: "40",
    blueTint: "#1084FE3D",
    blue5: "#80BEFE",
    sequential: ["#084382", "#0C64C1", "#1084FE", "#459FFE", "#80BEFE"] as const,
    diverging: ["#FF5667", "#82131F", "#262626", "#084382", "#459FFE"] as const,
  },
  chart: ["#fcfcfc", "#fcfcfc66", "#fcfcfc40", "#7777772c"] as const,
};

export type GrokTheme = typeof DARK;

export function useGrokTheme(): GrokTheme {
  return DARK;
}

const HallSkin = createContext(false);

const RUNE = "'Cinzel', 'Palatino Linotype', Palatino, Georgia, serif";
const BODY = "'Alegreya', 'Palatino Linotype', Palatino, Georgia, serif";
const INK = { hi: "#f3e6c8", mid: "#d8c49c", lo: "#b3a084", amber: "#e8b04f" };
const HALL_KINDS = ["#f0a640", "#7fb2d9", "#9fcf6e", "#c79bf0", "#e8685a", "#cdbf9f"];

function hallPill(on: boolean): CSSProperties {
  return {
    fontFamily: BODY,
    fontSize: "14px",
    lineHeight: "20px",
    minHeight: 36,
    padding: "6px 12px",
    borderRadius: 4,
    cursor: "pointer",
    border: `1px solid ${on ? "#ffb25e" : "#7a5a36"}`,
    background: on ? "linear-gradient(180deg, #b45c1f 0%, #6e3110 100%)" : "linear-gradient(180deg, #3d2e20 0%, #22180f 100%)",
    color: on ? "#fff3dc" : INK.mid,
    boxShadow: on ? "0 0 10px rgba(255,140,50,0.45), inset 0 1px 0 rgba(255,220,170,0.35)" : "inset 0 1px 0 rgba(255,225,170,0.10), 0 1px 2px rgba(0,0,0,0.6)",
    textShadow: "0 1px 1px rgba(0,0,0,0.7)",
  };
}

export function Page({
  title,
  summary,
  width = "column",
  lang,
  skin,
  children,
}: {
  title: string;
  summary?: string;
  sources?: readonly string[];
  width?: "column" | "wide" | "full";
  lang?: string;
  /** Wood-and-iron Valheim skin. The compact view paints its own frame and leaves this off. */
  skin?: "valheim";
  children?: ReactNode;
}) {
  const hall = skin === "valheim";
  const maxWidth = width === "full" ? "none" : width === "wide" ? "1280px" : "700px";
  const pad = width === "full" ? (hall ? "16px 12px 40px" : "20px 16px 56px") : "28px 20px 64px";
  return (
    <HallSkin.Provider value={hall}>
      <main lang={lang} style={{ maxWidth, margin: "0 auto", padding: pad, width: "100%", color: hall ? INK.hi : undefined, fontFamily: hall ? BODY : undefined }}>
        <h1 style={{ ...font.heading1, fontFamily: hall ? RUNE : undefined, fontWeight: 700, letterSpacing: hall ? "0.04em" : font.heading1.letterSpacing, color: hall ? INK.hi : undefined, margin: "0 0 8px", textShadow: hall ? "0 2px 2px #000" : undefined }}>{title}</h1>
        {summary ? (
          <p style={{ ...font.body1, fontFamily: hall ? BODY : undefined, color: hall ? INK.mid : DARK.text.secondary, margin: "0 0 20px", maxWidth: "78ch" }}>{summary}</p>
        ) : (
          <div style={{ height: 16 }} />
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: hall ? 22 : 36 }}>{children}</div>
      </main>
    </HallSkin.Provider>
  );
}

export function Section({
  heading,
  collapsible = false,
  defaultOpen = false,
  children,
}: {
  heading?: string;
  id?: string;
  caption?: string;
  actions?: ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  children?: ReactNode;
}) {
  const hall = useContext(HallSkin);
  const [open, setOpen] = useState(!collapsible || defaultOpen);
  const headingStyle: CSSProperties = {
    ...font.heading2,
    fontFamily: hall ? RUNE : undefined,
    fontWeight: 700,
    letterSpacing: hall ? "0.04em" : font.heading2.letterSpacing,
    margin: 0,
    color: hall ? INK.hi : DARK.text.primary,
    textShadow: hall ? "0 1px 2px #000" : undefined,
  };
  return (
    <section>
      {heading && collapsible ? (
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          style={{
            ...headingStyle,
            display: "flex",
            alignItems: "center",
            gap: 8,
            width: "100%",
            minHeight: 44,
            padding: 0,
            margin: "0 0 12px",
            background: "transparent",
            border: 0,
            color: "inherit",
            textAlign: "left",
            cursor: "pointer",
          }}
        >
          <span aria-hidden="true" style={{ color: hall ? INK.amber : DARK.text.tertiary, width: 16 }}>{open ? "▾" : "▸"}</span>
          {heading}
        </button>
      ) : heading ? (
        <h2 style={{ ...headingStyle, margin: "0 0 12px" }}>{heading}</h2>
      ) : null}
      {open ? <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{children}</div> : null}
    </section>
  );
}

export function Text({ children }: { children?: ReactNode }) {
  const hall = useContext(HallSkin);
  return <p style={{ ...font.body1, fontFamily: hall ? BODY : undefined, color: hall ? INK.mid : DARK.text.secondary, margin: 0 }}>{children}</p>;
}

export function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "number";
}) {
  const hall = useContext(HallSkin);
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
      {label ? <span style={{ ...font.subtext, fontFamily: hall ? BODY : undefined, color: hall ? INK.mid : DARK.text.tertiary }}>{label}</span> : null}
      <input
        className={hall ? "vh-in" : undefined}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{
          ...font.body1,
          fontFamily: hall ? BODY : undefined,
          fontSize: "16px",
          width: "100%",
          padding: hall ? "8px 10px" : "10px 12px",
          borderRadius: hall ? 4 : DARK.radius.md,
          border: hall ? "1px solid #7a5a36" : `1px solid ${DARK.border.default}`,
          background: hall ? "#120d09" : DARK.fill.secondary,
          color: hall ? INK.hi : DARK.text.primary,
          boxShadow: hall ? "inset 0 2px 4px rgba(0,0,0,0.8)" : undefined,
          outline: "none",
        }}
      />
    </label>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly (T | { value: T; label: string; count?: number })[];
  value: T;
  onChange: (value: T) => void;
}) {
  const hall = useContext(HallSkin);
  const items = options.map((option) =>
    typeof option === "string" ? { value: option, label: option } : option,
  );
  return (
    <div role="radiogroup" style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {items.map((option) => {
        const on = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(option.value)}
            style={hall ? hallPill(on) : {
              ...font.subtext,
              minHeight: 36,
              padding: "6px 12px",
              borderRadius: 999,
              cursor: "pointer",
              border: `1px solid ${on ? DARK.border.strong : DARK.border.default}`,
              background: on ? DARK.fill.primary : "transparent",
              color: on ? DARK.text.onPrimary : DARK.text.secondary,
              fontWeight: on ? DARK.weight.medium : DARK.weight.regular,
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function Legend({ names }: { names: readonly string[]; comparison?: readonly number[]; dots?: boolean }) {
  const hall = useContext(HallSkin);
  const colors = hall ? HALL_KINDS : DARK.dataviz.categorical;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 14px" }}>
      {names.map((name, i) => (
        <span key={name} style={{ ...font.label, fontFamily: hall ? BODY : undefined, color: hall ? INK.mid : DARK.text.secondary, display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span
            aria-hidden="true"
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: hall ? "#2e2015" : colors[i % colors.length],
              border: hall ? `2px solid ${colors[i % colors.length]}` : undefined,
              boxSizing: "border-box",
              display: "inline-block",
              flex: "0 0 auto",
            }}
          />
          {name}
        </span>
      ))}
    </div>
  );
}

type TableCell = string | { text: string; tone?: string } | ReactNode;

export function Table({
  columns,
  rows,
}: {
  columns: readonly string[];
  rows: readonly (readonly TableCell[])[];
  emphasis?: number;
  align?: readonly ("auto" | "start" | "end")[];
}) {
  const hall = useContext(HallSkin);
  const cell = (value: TableCell) => {
    if (value != null && typeof value === "object" && "text" in value) return value.text;
    return value;
  };
  return (
    <div className={hall ? "vh-scroll" : undefined} style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", border: hall ? "1px solid #5c4329" : `1px solid ${DARK.border.default}`, borderRadius: hall ? 6 : DARK.radius.md, background: hall ? "rgba(12,9,6,0.55)" : undefined, scrollbarColor: hall ? "#7a5a36 transparent" : undefined }}>
      <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 320 }}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                style={{
                  ...font.subtext,
                  fontFamily: hall ? RUNE : undefined,
                  fontWeight: 700,
                  textAlign: "left",
                  color: hall ? INK.amber : DARK.text.tertiary,
                  padding: "8px 10px",
                  borderBottom: hall ? "1px solid #6e5232" : `1px solid ${DARK.border.default}`,
                  background: hall ? "#1b130c" : DARK.bg.subtle,
                  whiteSpace: "nowrap",
                }}
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {columns.map((_, c) => (
                <td
                  key={c}
                  style={{
                    ...font.table,
                    fontFamily: hall ? BODY : undefined,
                    textAlign: "left",
                    verticalAlign: "top",
                    color: hall ? INK.hi : DARK.text.primary,
                    padding: "8px 10px",
                    borderBottom: hall ? "1px solid #3a2a1c" : `1px solid ${DARK.border.subtle}`,
                    overflowWrap: "anywhere",
                  }}
                >
                  {cell(row[c])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Callout({
  lead,
  tone = "info",
  children,
}: {
  lead?: string;
  tone?: "info" | "success" | "warning" | "danger";
  children?: ReactNode;
}) {
  const hall = useContext(HallSkin);
  if (!lead && !children) return null;
  const ink = tone === "info" ? DARK.text.accent : tone === "success" ? DARK.text.success : tone === "warning" ? DARK.text.warning : tone === "danger" ? DARK.text.danger : DARK.text.primary;
  const wash = tone === "info" ? DARK.fill.accentSubtle : tone === "success" ? DARK.fill.successSubtle : tone === "warning" ? DARK.fill.warningSubtle : tone === "danger" ? DARK.fill.dangerSubtle : DARK.fill.secondary;
  return (
    <aside style={hall ? { padding: "12px 14px", borderRadius: 6, background: "linear-gradient(180deg, #3d2e20 0%, #22180f 100%)", border: "1px solid #7a5a36", boxShadow: "inset 0 1px 0 rgba(255,225,170,0.12)" } : { padding: "12px 14px", borderRadius: DARK.radius.md, background: wash, border: `1px solid ${DARK.border.default}` }}>
      {lead ? <div style={{ ...font.body1, fontFamily: hall ? RUNE : undefined, fontWeight: 700, color: hall ? INK.amber : ink, marginBottom: children ? 4 : 0 }}>{lead}</div> : null}
      {children ? <div style={{ ...font.body2, fontFamily: hall ? BODY : undefined, color: hall ? INK.mid : DARK.text.secondary }}>{children}</div> : null}
    </aside>
  );
}
