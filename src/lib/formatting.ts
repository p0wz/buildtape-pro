/**
 * BuildTape Pro — Display Formatting Helpers
 */

import { Length, decompose, PrecisionDenominator } from "./length";

export type DisplayMode = "fraction" | "decimal_inches" | "decimal_feet" | "metric";

export function formatLength(
  length: Length,
  mode: DisplayMode = "fraction",
): string {
  const d = decompose(length);
  const sign = d.negative ? "-" : "";

  switch (mode) {
    case "fraction":
      return sign + buildFractionString(d.feet, d.inches, d.numerator, d.denominator);

    case "decimal_inches":
      return `${Math.abs(d.decimalInches).toFixed(4)}"`;

    case "decimal_feet":
      return `${Math.abs(d.decimalFeet).toFixed(4)} ft`;

    case "metric": {
      const cm = Math.abs(d.centimeters);
      if (cm >= 100) {
        return `${(cm / 100).toFixed(4)} m`;
      }
      return `${cm.toFixed(2)} cm`;
    }
  }
}

function buildFractionString(
  feet: number,
  inches: number,
  numerator: number,
  denominator: number,
): string {
  if (feet === 0 && inches === 0 && numerator === 0) return "0 in";

  const parts: string[] = [];
  if (feet > 0) parts.push(`${feet} ft`);

  if (inches > 0 && numerator > 0) {
    parts.push(`${inches} ${numerator}/${denominator} in`);
  } else if (inches > 0) {
    parts.push(`${inches} in`);
  } else if (numerator > 0) {
    parts.push(`0 ${numerator}/${denominator} in`);
  } else if (feet === 0) {
    parts.push("0 in");
  }

  return parts.join(" ");
}

/** Short display for tape entries: "12 ft 7 3/8 in" */
export function formatLengthShort(length: Length): string {
  return formatLength(length, "fraction");
}

/** Format a ratio as a percentage e.g. "33.3%" */
export function formatRatio(ratio: number, decimals = 1): string {
  return `${(ratio * 100).toFixed(decimals)}%`;
}

/** Format decimal number to fixed places */
export function formatDecimal(n: number, places = 4): string {
  return n.toFixed(places);
}

/** Format an angle in degrees */
export function formatAngle(degrees: number): string {
  return `${degrees.toFixed(2)}°`;
}

/** Date formatting */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Label for precision mode */
export function precisionLabel(denom: PrecisionDenominator): string {
  return `1/${denom}"`;
}
