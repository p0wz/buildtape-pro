/**
 * BuildTape Pro — Stair Solver Unit Tests
 */

import { solveStairs, StairInput } from "../../src/features/stairs/StairSolver";
import { fromFeetInchFraction, fromDecimalInches, toDecimalInches } from "../../src/lib/length";

function makeInput(overrides: Partial<StairInput> = {}): StairInput {
  return {
    totalRise: fromFeetInchFraction(8, 0, 0, 1, 16),
    preferredRiserInches: 7.75,
    preferredTreadInches: 10,
    nosingInches: 0,
    floorThicknessInches: 0,
    precision: 16,
    ...overrides,
  };
}

describe("solveStairs", () => {
  test("8 ft rise → 12 or 13 risers at ~7.5–8 in each", () => {
    const result = solveStairs(makeInput());
    expect(result.best.riserCount).toBeGreaterThanOrEqual(11);
    expect(result.best.riserCount).toBeLessThanOrEqual(13);
  });

  test("riser height is close to preferred 7.75 in", () => {
    const result = solveStairs(makeInput());
    const riserInches = toDecimalInches(result.best.riserHeight);
    expect(Math.abs(riserInches - 7.75)).toBeLessThan(0.5);
  });

  test("treadCount = riserCount - 1", () => {
    const result = solveStairs(makeInput());
    expect(result.best.treadCount).toBe(result.best.riserCount - 1);
  });

  test("alternatives list has 3 entries", () => {
    const result = solveStairs(makeInput());
    expect(result.alternatives.length).toBe(3);
  });

  test("warns when riser is outside comfort range", () => {
    const input = makeInput({
      totalRise: fromDecimalInches(10 * 9.5, 16), // 9.5 in risers
    });
    const result = solveStairs(input);
    // best result should have 10 risers but warning
    const has9Riser = result.alternatives
      .concat([result.best])
      .some((r) => r.warnings.length > 0);
    expect(has9Riser).toBe(true);
  });

  test("throws on zero rise", () => {
    const input = makeInput({ totalRise: fromDecimalInches(0) });
    expect(() => solveStairs(input)).toThrow("Total rise must be greater than zero");
  });

  test("fractional rise input", () => {
    // 7 ft 3 3/4 in rise
    const rise = fromFeetInchFraction(7, 3, 3, 4, 16);
    const input = makeInput({ totalRise: rise });
    const result = solveStairs(input);
    expect(result.best).toBeDefined();
    expect(result.best.riserCount).toBeGreaterThan(0);
  });

  test("explanation text includes rise and riser info", () => {
    const result = solveStairs(makeInput());
    expect(result.explanation).toContain("risers");
    expect(result.explanation).toContain("local building code");
  });

  test("stringer length is longer than rise or run individually", () => {
    const result = solveStairs(makeInput());
    const riseIn = toDecimalInches(result.best.riserHeight) * result.best.riserCount;
    const runIn = toDecimalInches(result.best.totalRun);
    const stringerIn = toDecimalInches(result.best.stringerLength);
    expect(stringerIn).toBeGreaterThan(riseIn);
    expect(stringerIn).toBeGreaterThan(runIn);
  });
});
