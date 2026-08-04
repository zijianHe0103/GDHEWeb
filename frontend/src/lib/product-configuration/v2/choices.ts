import type { ProductConfigurationV2Dto } from "../../../types/product-configuration-v2";

export type TrackLengthChoice = Readonly<{ kind: "standard"; lengthMeters: number; label: string }> | Readonly<{ kind: "custom"; label: "Custom Length" }>;
export type TrackLengthSelection = Readonly<{ kind: "standard"; lengthMeters: number }> | Readonly<{ kind: "custom" }>;

export function projectTrackLengthChoices(dto: ProductConfigurationV2Dto): readonly TrackLengthChoice[] {
  const lengths = [...new Set(dto.options.map(({lengthMeters}) => lengthMeters))].sort((a,b) => a-b);
  return Object.freeze([...lengths.map((lengthMeters) => Object.freeze({kind:"standard" as const,lengthMeters,label:`${lengthMeters} m`})), Object.freeze({kind:"custom" as const,label:"Custom Length" as const})]);
}

export function projectColorChoices(dto: ProductConfigurationV2Dto, selection: TrackLengthSelection): readonly Readonly<{code:string;label:string}>[] {
  const options = selection.kind === "custom" ? dto.options : dto.options.filter(({lengthMeters}) => lengthMeters === selection.lengthMeters);
  const colors = new Map(options.map(({color}) => [color.code, color]));
  return Object.freeze([...colors.values()].sort((a,b) => a.label.localeCompare(b.label) || a.code.localeCompare(b.code)).map((color) => Object.freeze({...color})));
}

export function resolveStandardOption(dto: ProductConfigurationV2Dto, lengthMeters: number, colorCode: string) {
  const matches = dto.options.filter((option) => option.lengthMeters === lengthMeters && option.color.code === colorCode);
  return matches.length === 1 ? matches[0] : undefined;
}
