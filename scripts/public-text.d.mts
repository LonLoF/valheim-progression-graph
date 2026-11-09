export function includeBiomeFoundIn(type: string): boolean;
export function joinClauses(parts?: readonly string[] | null): string;
export function upgradeUseLabel(
  upgrades: { quality?: number; station?: string; ingredients?: [string, number][] }[] | undefined,
  materialName: string,
): string;
export function upgradeStationLabel(
  upgrades: { quality?: number; station?: string; ingredients?: [string, number][] }[] | undefined,
  stationName: string,
): string;
export function splitUpgradeLabel(label: string): { prefix: string; level: string } | null;
