/**
 * BuildTape Pro — Fraction Parsing & Display
 */

import { gcd } from "./length";

// ─── Fraction Utilities ───────────────────────────────────────────────────────

export function reduceFraction(
  numerator: number,
  denominator: number,
): { numerator: number; denominator: number } {
  if (denominator === 0) throw new Error("Denominator cannot be zero");
  if (numerator === 0) return { numerator: 0, denominator: 1 };
  const g = gcd(Math.abs(numerator), Math.abs(denominator));
  return { numerator: numerator / g, denominator: denominator / g };
}

export function formatFraction(numerator: number, denominator: number): string {
  if (numerator === 0) return "";
  const { numerator: n, denominator: d } = reduceFraction(numerator, denominator);
  return `${n}/${d}`;
}

/** All standard fractions at 1/32 precision */
export const STANDARD_FRACTIONS: Array<{
  numerator: number;
  denominator: number;
  label: string;
  thirtySeconds: number;
}> = [
  { numerator: 1, denominator: 32, label: "1/32", thirtySeconds: 1 },
  { numerator: 1, denominator: 16, label: "1/16", thirtySeconds: 2 },
  { numerator: 3, denominator: 32, label: "3/32", thirtySeconds: 3 },
  { numerator: 1, denominator: 8, label: "1/8", thirtySeconds: 4 },
  { numerator: 5, denominator: 32, label: "5/32", thirtySeconds: 5 },
  { numerator: 3, denominator: 16, label: "3/16", thirtySeconds: 6 },
  { numerator: 7, denominator: 32, label: "7/32", thirtySeconds: 7 },
  { numerator: 1, denominator: 4, label: "1/4", thirtySeconds: 8 },
  { numerator: 9, denominator: 32, label: "9/32", thirtySeconds: 9 },
  { numerator: 5, denominator: 16, label: "5/16", thirtySeconds: 10 },
  { numerator: 11, denominator: 32, label: "11/32", thirtySeconds: 11 },
  { numerator: 3, denominator: 8, label: "3/8", thirtySeconds: 12 },
  { numerator: 13, denominator: 32, label: "13/32", thirtySeconds: 13 },
  { numerator: 7, denominator: 16, label: "7/16", thirtySeconds: 14 },
  { numerator: 15, denominator: 32, label: "15/32", thirtySeconds: 15 },
  { numerator: 1, denominator: 2, label: "1/2", thirtySeconds: 16 },
  { numerator: 17, denominator: 32, label: "17/32", thirtySeconds: 17 },
  { numerator: 9, denominator: 16, label: "9/16", thirtySeconds: 18 },
  { numerator: 19, denominator: 32, label: "19/32", thirtySeconds: 19 },
  { numerator: 5, denominator: 8, label: "5/8", thirtySeconds: 20 },
  { numerator: 21, denominator: 32, label: "21/32", thirtySeconds: 21 },
  { numerator: 11, denominator: 16, label: "11/16", thirtySeconds: 22 },
  { numerator: 23, denominator: 32, label: "23/32", thirtySeconds: 23 },
  { numerator: 3, denominator: 4, label: "3/4", thirtySeconds: 24 },
  { numerator: 25, denominator: 32, label: "25/32", thirtySeconds: 25 },
  { numerator: 13, denominator: 16, label: "13/16", thirtySeconds: 26 },
  { numerator: 27, denominator: 32, label: "27/32", thirtySeconds: 27 },
  { numerator: 7, denominator: 8, label: "7/8", thirtySeconds: 28 },
  { numerator: 29, denominator: 32, label: "29/32", thirtySeconds: 29 },
  { numerator: 15, denominator: 16, label: "15/16", thirtySeconds: 30 },
  { numerator: 31, denominator: 32, label: "31/32", thirtySeconds: 31 },
];

/** Fractions visible at each precision level */
export function fractionsForPrecision(
  denominator: 8 | 16 | 32,
): typeof STANDARD_FRACTIONS {
  return STANDARD_FRACTIONS.filter(
    (f) => f.thirtySeconds % (32 / denominator) === 0,
  );
}

// ─── Expression Parsing ───────────────────────────────────────────────────────

export interface ParsedLength {
  feet: number;
  inches: number;
  numerator: number;
  denominator: number;
  valid: boolean;
  error?: string;
}

/**
 * Parse a string expression into a ParsedLength.
 * Supports patterns like:
 *   "12 ft 7 3/8 in"
 *   "12' 7 3/8\""
 *   "12 7 3/8"  (feet inches fraction)
 *   "7 3/8"     (inches fraction)
 *   "85.5"      (decimal inches)
 *   "7.25 ft"   (decimal feet)
 */
export function parseLength(input: string): ParsedLength {
  const s = input.trim().toLowerCase();

  // Try decimal feet
  const ftDecimalMatch = s.match(/^([\d.]+)\s*(ft|foot|feet|')$/);
  if (ftDecimalMatch) {
    const totalFt = parseFloat(ftDecimalMatch[1]);
    if (!isNaN(totalFt)) {
      const totalInches = totalFt * 12;
      const feet = Math.floor(totalFt);
      const remInches = totalInches - feet * 12;
      const inches = Math.floor(remInches);
      const fracInch = remInches - inches;
      const num = Math.round(fracInch * 32);
      return { feet, inches, numerator: num, denominator: 32, valid: true };
    }
  }

  // Try decimal inches (bare number or with "in")
  const inDecimalMatch = s.match(/^([\d.]+)\s*(in|inch|inches|")?$/);
  if (inDecimalMatch) {
    const totalIn = parseFloat(inDecimalMatch[1]);
    if (!isNaN(totalIn)) {
      const feet = Math.floor(totalIn / 12);
      const remInches = totalIn - feet * 12;
      const inches = Math.floor(remInches);
      const fracInch = remInches - inches;
      const num = Math.round(fracInch * 32);
      return { feet, inches, numerator: num, denominator: 32, valid: true };
    }
  }

  // Try "ft in frac" format
  // e.g. "12 ft 7 3/8 in", "12' 7 3/8\"", "12 7 3/8"
  const fullMatch = s.match(
    /^(\d+)\s*(?:ft|foot|feet|')?\s+(\d+)\s+(\d+)\/(\d+)\s*(?:in|inch|")?$/,
  );
  if (fullMatch) {
    return {
      feet: parseInt(fullMatch[1]),
      inches: parseInt(fullMatch[2]),
      numerator: parseInt(fullMatch[3]),
      denominator: parseInt(fullMatch[4]),
      valid: true,
    };
  }

  // "ft in" no fraction
  const ftInMatch = s.match(
    /^(\d+)\s*(?:ft|foot|feet|')?\s+(\d+)\s*(?:in|inch|")?$/,
  );
  if (ftInMatch) {
    return {
      feet: parseInt(ftInMatch[1]),
      inches: parseInt(ftInMatch[2]),
      numerator: 0,
      denominator: 16,
      valid: true,
    };
  }

  // "in frac" only
  const inFracMatch = s.match(/^(\d+)\s+(\d+)\/(\d+)\s*(?:in|inch|")?$/);
  if (inFracMatch) {
    return {
      feet: 0,
      inches: parseInt(inFracMatch[1]),
      numerator: parseInt(inFracMatch[2]),
      denominator: parseInt(inFracMatch[3]),
      valid: true,
    };
  }

  // Just feet
  const justFtMatch = s.match(/^(\d+)\s*(?:ft|foot|feet|')$/);
  if (justFtMatch) {
    return {
      feet: parseInt(justFtMatch[1]),
      inches: 0,
      numerator: 0,
      denominator: 16,
      valid: true,
    };
  }

  return { feet: 0, inches: 0, numerator: 0, denominator: 16, valid: false, error: "Unrecognized format" };
}
