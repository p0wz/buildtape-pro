/**
 * BuildTape Pro — Core Length Math Engine
 *
 * All lengths are stored as integers in thirty-seconds of an inch.
 * 1 foot = 12 inches = 192 thirty-seconds
 * 1 inch = 32 thirty-seconds
 * This eliminates floating-point drift in fraction arithmetic.
 */

export type PrecisionDenominator = 8 | 16 | 32;

export interface Length {
  /** Total length expressed as integer thirty-seconds of an inch. May be negative. */
  totalThirtySeconds: number;
  /** Display precision denominator */
  precision: PrecisionDenominator;
}

export interface LengthDisplay {
  feet: number;
  inches: number;
  /** Numerator of fraction (already reduced). 0 means no fraction. */
  numerator: number;
  /** Denominator of fraction after rounding to precision. */
  denominator: PrecisionDenominator;
  /** Negative sign flag */
  negative: boolean;
  /** Decimal inches (for display modes) */
  decimalInches: number;
  /** Decimal feet */
  decimalFeet: number;
  /** Centimeters */
  centimeters: number;
  /** Formatted string e.g. "12 ft 7 3/8 in" */
  formatted: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

export const THIRTY_SECONDS_PER_INCH = 32;
export const THIRTY_SECONDS_PER_FOOT = 32 * 12; // 384
export const INCHES_PER_FOOT = 12;
export const CM_PER_INCH = 2.54;

// ─── Construction ────────────────────────────────────────────────────────────

/**
 * Create a Length from feet, inches, and a fraction.
 * All inputs are non-negative; pass negative=true for negative lengths.
 */
export function fromFeetInchFraction(
  feet: number,
  inches: number,
  numerator: number,
  denominator: number,
  precision: PrecisionDenominator = 16,
  negative: boolean = false,
): Length {
  if (denominator === 0) throw new Error("Denominator cannot be zero");

  const feetTs = Math.round(feet) * THIRTY_SECONDS_PER_FOOT;
  const inchTs = Math.round(inches) * THIRTY_SECONDS_PER_INCH;
  // Convert fraction to thirty-seconds: (num/den) * 32
  const fracTs = Math.round((numerator / denominator) * THIRTY_SECONDS_PER_INCH);
  const total = feetTs + inchTs + fracTs;

  return {
    totalThirtySeconds: negative ? -total : total,
    precision,
  };
}

/** Create a Length directly from a thirty-seconds integer value */
export function fromThirtySeconds(
  ts: number,
  precision: PrecisionDenominator = 16,
): Length {
  return { totalThirtySeconds: Math.round(ts), precision };
}

/** Create a Length from decimal inches */
export function fromDecimalInches(
  inches: number,
  precision: PrecisionDenominator = 16,
): Length {
  const ts = Math.round(inches * THIRTY_SECONDS_PER_INCH);
  return { totalThirtySeconds: ts, precision };
}

/** Create a Length from decimal feet */
export function fromDecimalFeet(
  feet: number,
  precision: PrecisionDenominator = 16,
): Length {
  const ts = Math.round(feet * THIRTY_SECONDS_PER_FOOT);
  return { totalThirtySeconds: ts, precision };
}

/** Create a zero-value Length */
export function zero(precision: PrecisionDenominator = 16): Length {
  return { totalThirtySeconds: 0, precision };
}

// ─── Arithmetic ──────────────────────────────────────────────────────────────

export function add(a: Length, b: Length): Length {
  return {
    totalThirtySeconds: a.totalThirtySeconds + b.totalThirtySeconds,
    precision: a.precision,
  };
}

export function subtract(a: Length, b: Length): Length {
  return {
    totalThirtySeconds: a.totalThirtySeconds - b.totalThirtySeconds,
    precision: a.precision,
  };
}

export function multiplyByScalar(a: Length, scalar: number): Length {
  return {
    totalThirtySeconds: Math.round(a.totalThirtySeconds * scalar),
    precision: a.precision,
  };
}

export function divideByScalar(a: Length, scalar: number): Length {
  if (scalar === 0) throw new Error("Division by zero");
  return {
    totalThirtySeconds: Math.round(a.totalThirtySeconds / scalar),
    precision: a.precision,
  };
}

/** Returns the ratio a/b as a plain number */
export function divideByLength(a: Length, b: Length): number {
  if (b.totalThirtySeconds === 0) throw new Error("Division by zero length");
  return a.totalThirtySeconds / b.totalThirtySeconds;
}

/** Center of a length = length / 2 */
export function centerFind(a: Length): Length {
  return divideByScalar(a, 2);
}

/**
 * Equal spacing: divide a length into n spaces.
 * Returns array of n+1 layout positions starting at 0.
 */
export function equalSpacing(a: Length, n: number): Length[] {
  if (n < 1) throw new Error("Must have at least 1 space");
  const spacing = divideByScalar(a, n);
  const positions: Length[] = [];
  for (let i = 0; i <= n; i++) {
    positions.push({
      totalThirtySeconds: Math.round(spacing.totalThirtySeconds * i),
      precision: a.precision,
    });
  }
  return positions;
}

export function negate(a: Length): Length {
  return { totalThirtySeconds: -a.totalThirtySeconds, precision: a.precision };
}

export function abs(a: Length): Length {
  return {
    totalThirtySeconds: Math.abs(a.totalThirtySeconds),
    precision: a.precision,
  };
}

export function isNegative(a: Length): boolean {
  return a.totalThirtySeconds < 0;
}

export function isZero(a: Length): boolean {
  return a.totalThirtySeconds === 0;
}

// ─── Decomposition ───────────────────────────────────────────────────────────

/**
 * Break a Length into its constituent parts for display.
 * Rounds the fractional inch to the nearest step of the precision denominator.
 */
export function decompose(length: Length): LengthDisplay {
  const negative = length.totalThirtySeconds < 0;
  const absTs = Math.abs(length.totalThirtySeconds);

  // Total inches in thirty-seconds, then split
  const totalTsAbs = absTs;
  const precision = length.precision;

  // Round to nearest precision step
  // e.g. precision=16 → each step = 32/16 = 2 thirty-seconds
  const stepSize = THIRTY_SECONDS_PER_INCH / precision; // e.g. 2 for 1/16
  const rounded = Math.round(totalTsAbs / stepSize) * stepSize;

  const totalInches = Math.floor(rounded / THIRTY_SECONDS_PER_INCH);
  const fracThirtySeconds = rounded % THIRTY_SECONDS_PER_INCH;

  const feet = Math.floor(totalInches / INCHES_PER_FOOT);
  const inches = totalInches % INCHES_PER_FOOT;

  // Fraction: fracThirtySeconds / 32 = numerator / precision
  // numerator (at precision denominator)
  let numerator = Math.round((fracThirtySeconds / THIRTY_SECONDS_PER_INCH) * precision);
  let denominator: PrecisionDenominator = precision;

  // Reduce the fraction
  if (numerator > 0) {
    const g = gcd(numerator, denominator);
    numerator = numerator / g;
    denominator = (denominator / g) as PrecisionDenominator;
  }

  // Decimal conversions (use original unrounded for accuracy)
  const totalInchesExact = absTs / THIRTY_SECONDS_PER_INCH;
  const decimalInches = negative ? -totalInchesExact : totalInchesExact;
  const decimalFeet = decimalInches / INCHES_PER_FOOT;
  const centimeters = decimalInches * CM_PER_INCH;

  // Format string
  const parts: string[] = [];
  if (feet > 0 || (feet === 0 && inches === 0 && numerator === 0)) {
    parts.push(`${feet} ft`);
  } else if (feet > 0) {
    parts.push(`${feet} ft`);
  }
  if (inches > 0 || numerator > 0 || feet === 0) {
    if (numerator > 0) {
      parts.push(`${inches} ${numerator}/${denominator} in`);
    } else {
      parts.push(`${inches} in`);
    }
  }
  if (feet > 0 && inches === 0 && numerator === 0) {
    // already have "X ft" only
  }

  const formatted = (negative ? "-" : "") + buildFormatString(feet, inches, numerator, denominator);

  return {
    feet,
    inches,
    numerator,
    denominator: denominator as PrecisionDenominator,
    negative,
    decimalInches,
    decimalFeet,
    centimeters,
    formatted,
  };
}

function buildFormatString(
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
    parts.push(`${numerator}/${denominator} in`);
  }

  return parts.join(" ");
}

// ─── Conversion Helpers ──────────────────────────────────────────────────────

export function toDecimalInches(length: Length): number {
  return length.totalThirtySeconds / THIRTY_SECONDS_PER_INCH;
}

export function toDecimalFeet(length: Length): number {
  return length.totalThirtySeconds / THIRTY_SECONDS_PER_FOOT;
}

export function toCentimeters(length: Length): number {
  return toDecimalInches(length) * CM_PER_INCH;
}

export function toMeters(length: Length): number {
  return toCentimeters(length) / 100;
}

// ─── Utilities ───────────────────────────────────────────────────────────────

export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b > 0) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a === 0 ? 1 : a;
}

export function withPrecision(
  length: Length,
  precision: PrecisionDenominator,
): Length {
  return { ...length, precision };
}
