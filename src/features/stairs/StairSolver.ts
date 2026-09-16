/**
 * BuildTape Pro — Stair Solver
 *
 * Inputs rise (total floor-to-floor height) and preferences,
 * outputs optimal riser/tread configuration with alternatives.
 *
 * DISCLAIMER: This calculator provides estimates for planning purposes only.
 * Always verify against your local building code before construction.
 */

import {
  Length,
  fromFeetInchFraction,
  fromThirtySeconds,
  toDecimalInches,
  THIRTY_SECONDS_PER_INCH,
  PrecisionDenominator,
  decompose,
} from "../../lib/length";

export interface StairInput {
  /** Total rise (floor to floor) */
  totalRise: Length;
  /** Preferred max riser height in decimal inches (default 7.75) */
  preferredRiserInches: number;
  /** Preferred tread depth in decimal inches (default 10) */
  preferredTreadInches: number;
  /** Nosing overhang in decimal inches (0 if none) */
  nosingInches: number;
  /** Floor/landing thickness in decimal inches (0 if none) */
  floorThicknessInches: number;
  /** Display precision */
  precision: PrecisionDenominator;
}

export interface StairRun {
  riserCount: number;
  /** Exact riser height as Length */
  riserHeight: Length;
  /** Tread count = riserCount - 1 */
  treadCount: number;
  /** Total run length as Length */
  totalRun: Length;
  /** Stringer length estimate as Length */
  stringerLength: Length;
  /** Stair angle in degrees */
  angleDegrees: number;
  /** Score: lower is better */
  score: number;
  warnings: string[];
}

export interface StairResult {
  best: StairRun;
  alternatives: StairRun[];
  explanation: string;
}

const COMFORT_RISER_MIN_IN = 6.5;
const COMFORT_RISER_MAX_IN = 8.25;
const COMMON_RISER_MIN_IN = 4.0;
const COMMON_RISER_MAX_IN = 9.0;

export function solveStairs(input: StairInput): StairResult {
  const totalRiseInches = toDecimalInches(input.totalRise);

  if (totalRiseInches <= 0) {
    throw new Error("Total rise must be greater than zero");
  }

  const runs: StairRun[] = [];

  for (let riserCount = 2; riserCount <= 30; riserCount++) {
    const riserInches = totalRiseInches / riserCount;

    const riserTs = Math.round(riserInches * THIRTY_SECONDS_PER_INCH);
    const riserHeight = fromThirtySeconds(riserTs, input.precision);
    const riserInchesRounded = riserTs / THIRTY_SECONDS_PER_INCH;

    const treadCount = riserCount - 1;
    const treadDepthInches = input.preferredTreadInches;
    const effectiveTread = treadDepthInches + input.nosingInches;

    const totalRunInches = treadCount * effectiveTread;
    const totalRunTs = Math.round(totalRunInches * THIRTY_SECONDS_PER_INCH);
    const totalRun = fromThirtySeconds(totalRunTs, input.precision);

    // Stringer: hypotenuse of rise + run triangle
    const stringerInches = Math.sqrt(
      totalRiseInches * totalRiseInches + totalRunInches * totalRunInches,
    );
    const stringerTs = Math.round(stringerInches * THIRTY_SECONDS_PER_INCH);
    const stringerLength = fromThirtySeconds(stringerTs, input.precision);

    // Angle
    const angleDegrees =
      (Math.atan2(totalRiseInches, totalRunInches) * 180) / Math.PI;

    // Score
    const riserDelta = Math.abs(riserInchesRounded - input.preferredRiserInches);
    const score = riserDelta;

    // Warnings
    const warnings: string[] = [];
    if (riserInchesRounded < COMFORT_RISER_MIN_IN || riserInchesRounded > COMFORT_RISER_MAX_IN) {
      warnings.push(
        `Riser ${riserInchesRounded.toFixed(3)}" is outside the common comfort range of ${COMFORT_RISER_MIN_IN}"–${COMFORT_RISER_MAX_IN}".`,
      );
    }
    if (riserInchesRounded < COMMON_RISER_MIN_IN || riserInchesRounded > COMMON_RISER_MAX_IN) {
      warnings.push(
        `Riser ${riserInchesRounded.toFixed(3)}" is outside the typical allowable range of ${COMMON_RISER_MIN_IN}"–${COMMON_RISER_MAX_IN}". Verify local building code.`,
      );
    }
    if (angleDegrees > 45) {
      warnings.push("Stair angle exceeds 45° — may feel steep.");
    }
    if (angleDegrees < 20) {
      warnings.push("Stair angle below 20° — may feel very shallow / ramp-like.");
    }

    runs.push({
      riserCount,
      riserHeight,
      treadCount,
      totalRun,
      stringerLength,
      angleDegrees,
      score,
      warnings,
    });
  }

  // Sort by score (best fit to preferred riser height)
  runs.sort((a, b) => a.score - b.score);

  const best = runs[0];
  const alternatives = runs.slice(1, 4); // top 3 alternatives

  const bestRiserIn = toDecimalInches(best.riserHeight);
  const bestDisplay = decompose(best.riserHeight);
  const riserStr =
    bestDisplay.numerator > 0
      ? `${bestDisplay.inches} ${bestDisplay.numerator}/${bestDisplay.denominator}"`
      : `${bestDisplay.inches}"`;

  const explanation =
    `With a total rise of ${toDecimalInches(input.totalRise).toFixed(2)}", ` +
    `${best.riserCount} risers at ${riserStr} each gives the closest match to your ` +
    `preferred ${input.preferredRiserInches}" riser height. ` +
    `This results in ${best.treadCount} treads at ${input.preferredTreadInches}" each, ` +
    `a total run of ${toDecimalInches(best.totalRun).toFixed(2)}", ` +
    `and a stair angle of ${best.angleDegrees.toFixed(1)}°.\n\n` +
    `⚠ Always verify against your local building code before construction.`;

  return { best, alternatives, explanation };
}
