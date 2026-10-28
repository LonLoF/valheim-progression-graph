/**
 * Stand-in for the host "grok/canvas" (and "grok-canvas") module.
 * Dark Grok page tokens, plus the blocks these two views import.
 */
import { useState, type CSSProperties, type ReactNode } from "react";

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

export function Page({
  title,
  summary,
  width = "column",
  lang,
  children,
}: {
  title: string;
  summary?: string;
  sources?: readonly string[];
  width?: "column" | "wide" | "full";
  lang?: string;
  children?: ReactNode;
}) {
  const maxWidth = width === "full" ? "none" : width === "wide" ? "1280px" : "700px";
  const pad = width === "full" ? "20px 16px 56px" : "28px 20px 64px";
  return (
    <main lang={lang} style={{ maxWidth, margin: "0 auto", padding: pad, width: "100%" }}>
      <h1 style={{ ...font.heading1, fontWeight: DARK.weight.semibold, margin: "0 0 8px" }}>{title}</h1>
      {summary ? (
        <p style={{ ...font.body1, color: DARK.text.secondary, margin: "0 0 28px", maxWidth: "78ch" }}>{summary}</p>
      ) : (
        <div style={{ height: 16 }} />
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>{children}</div>
    </main>
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
  const [open, setOpen] = useState(!collapsible || defaultOpen);
  const headingStyle: CSSProperties = {
    ...font.heading2,
    fontWeight: DARK.weight.semibold,
    margin: 0,
    color: DARK.text.primary,
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
          <span aria-hidden="true" style={{ color: DARK.text.tertiary, width: 16 }}>{open ? "▾" : "▸"}</span>
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
  return <p style={{ ...font.body1, color: DARK.text.secondary, margin: 0 }}>{children}</p>;
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
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
      {label ? <span style={{ ...font.subtext, color: DARK.text.tertiary }}>{label}</span> : null}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{
          ...font.body1,
          width: "100%",
          padding: "10px 12px",
          borderRadius: DARK.radius.md,
          border: `1px solid ${DARK.border.default}`,
          background: DARK.fill.secondary,
          color: DARK.text.primary,
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
            style={{
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
  const colors = DARK.dataviz.categorical;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 14px" }}>
      {names.map((name, i) => (
        <span key={name} style={{ ...font.label, color: DARK.text.secondary, display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span
            aria-hidden="true"
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: colors[i % colors.length],
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
  const cell = (value: TableCell) => {
    if (value != null && typeof value === "object" && "text" in value) return value.text;
    return value;
  };
  return (
    <div style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", border: `1px solid ${DARK.border.default}`, borderRadius: DARK.radius.md }}>
      <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 320 }}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                style={{
                  ...font.subtext,
                  fontWeight: DARK.weight.medium,
                  textAlign: "left",
                  color: DARK.text.tertiary,
                  padding: "8px 10px",
                  borderBottom: `1px solid ${DARK.border.default}`,
                  background: DARK.bg.subtle,
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
                    textAlign: "left",
                    verticalAlign: "top",
                    color: DARK.text.primary,
                    padding: "8px 10px",
                    borderBottom: `1px solid ${DARK.border.subtle}`,
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
  if (!lead && !children) return null;
  const ink = tone === "info" ? DARK.text.accent : tone === "success" ? DARK.text.success : tone === "warning" ? DARK.text.warning : tone === "danger" ? DARK.text.danger : DARK.text.primary;
  const wash = tone === "info" ? DARK.fill.accentSubtle : tone === "success" ? DARK.fill.successSubtle : tone === "warning" ? DARK.fill.warningSubtle : tone === "danger" ? DARK.fill.dangerSubtle : DARK.fill.secondary;
  return (
    <aside style={{ padding: "12px 14px", borderRadius: DARK.radius.md, background: wash, border: `1px solid ${DARK.border.default}` }}>
      {lead ? <div style={{ ...font.body1, fontWeight: DARK.weight.semibold, color: ink, marginBottom: children ? 4 : 0 }}>{lead}</div> : null}
      {children ? <div style={{ ...font.body2, color: DARK.text.secondary }}>{children}</div> : null}
    </aside>
  );
}
