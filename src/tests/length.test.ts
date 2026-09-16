/**
 * BuildTape Pro — Length Engine Unit Tests
 */

import {
  fromFeetInchFraction,
  fromThirtySeconds,
  fromDecimalInches,
  fromDecimalFeet,
  add,
  subtract,
  multiplyByScalar,
  divideByScalar,
  divideByLength,
  centerFind,
  equalSpacing,
  decompose,
  toDecimalInches,
  toDecimalFeet,
  toCentimeters,
  toMeters,
  gcd,
  THIRTY_SECONDS_PER_INCH,
  THIRTY_SECONDS_PER_FOOT,
} from "../../src/lib/length";

describe("gcd", () => {
  test("gcd(12, 8) = 4", () => expect(gcd(12, 8)).toBe(4));
  test("gcd(7, 3) = 1", () => expect(gcd(7, 3)).toBe(1));
  test("gcd(0, 5) = 5", () => expect(gcd(0, 5)).toBe(5));
  test("gcd(16, 16) = 16", () => expect(gcd(16, 16)).toBe(16));
});

describe("fromFeetInchFraction", () => {
  test("12 ft 0 in = 12 * 384 = 4608 thirtySeconds", () => {
    const l = fromFeetInchFraction(12, 0, 0, 1, 16);
    expect(l.totalThirtySeconds).toBe(12 * THIRTY_SECONDS_PER_FOOT);
  });

  test("0 ft 1 in = 32 thirtySeconds", () => {
    const l = fromFeetInchFraction(0, 1, 0, 1, 16);
    expect(l.totalThirtySeconds).toBe(THIRTY_SECONDS_PER_INCH);
  });

  test("0 ft 0 3/8 in = 12 thirtySeconds", () => {
    const l = fromFeetInchFraction(0, 0, 3, 8, 16);
    expect(l.totalThirtySeconds).toBe(12); // 3/8 * 32 = 12
  });

  test("12 ft 7 3/8 in", () => {
    const l = fromFeetInchFraction(12, 7, 3, 8, 16);
    // 12*384 + 7*32 + 12 = 4608 + 224 + 12 = 4844
    expect(l.totalThirtySeconds).toBe(4844);
  });

  test("negative length", () => {
    const l = fromFeetInchFraction(1, 0, 0, 1, 16, true);
    expect(l.totalThirtySeconds).toBe(-THIRTY_SECONDS_PER_FOOT);
  });
});

describe("add", () => {
  test("12 ft 7 3/8 in + 4 ft 5 1/2 in = 17 ft 0 7/8 in", () => {
    const a = fromFeetInchFraction(12, 7, 3, 8, 16);
    const b = fromFeetInchFraction(4, 5, 1, 2, 16);
    const result = add(a, b);
    const d = decompose(result);
    // 12 ft 7 3/8 + 4 ft 5 4/8 = 16 ft 12 7/8 = 17 ft 0 7/8
    expect(d.feet).toBe(17);
    expect(d.inches).toBe(0);
    expect(d.numerator).toBe(7);
    expect(d.denominator).toBe(8);
    expect(d.negative).toBe(false);
  });

  test("adding zero returns same value", () => {
    const a = fromFeetInchFraction(3, 6, 0, 1, 16);
    const b = fromThirtySeconds(0, 16);
    const result = add(a, b);
    expect(result.totalThirtySeconds).toBe(a.totalThirtySeconds);
  });
});

describe("subtract", () => {
  test("5 ft - 2 ft = 3 ft", () => {
    const a = fromFeetInchFraction(5, 0, 0, 1);
    const b = fromFeetInchFraction(2, 0, 0, 1);
    const result = subtract(a, b);
    expect(toDecimalFeet(result)).toBeCloseTo(3);
  });

  test("a - a = 0", () => {
    const a = fromFeetInchFraction(10, 4, 1, 2, 16);
    const result = subtract(a, a);
    expect(result.totalThirtySeconds).toBe(0);
  });

  test("negative result", () => {
    const a = fromFeetInchFraction(1, 0, 0, 1);
    const b = fromFeetInchFraction(2, 0, 0, 1);
    const result = subtract(a, b);
    expect(result.totalThirtySeconds).toBeLessThan(0);
  });
});

describe("multiplyByScalar", () => {
  test("8 ft * 3 = 24 ft", () => {
    const a = fromFeetInchFraction(8, 0, 0, 1, 16);
    const result = multiplyByScalar(a, 3);
    expect(toDecimalFeet(result)).toBeCloseTo(24);
  });

  test("1 in * 0 = 0", () => {
    const a = fromFeetInchFraction(0, 1, 0, 1, 16);
    const result = multiplyByScalar(a, 0);
    expect(result.totalThirtySeconds).toBe(0);
  });

  test("multiply by 0.5 = half", () => {
    const a = fromFeetInchFraction(10, 0, 0, 1, 16);
    const result = multiplyByScalar(a, 0.5);
    expect(toDecimalFeet(result)).toBeCloseTo(5);
  });
});

describe("divideByScalar", () => {
  test("8 ft / 3 ≈ 2 ft 8 in", () => {
    const a = fromFeetInchFraction(8, 0, 0, 1, 16);
    const result = divideByScalar(a, 3);
    const d = decompose(result);
    expect(d.feet).toBe(2);
    expect(d.inches).toBe(8);
  });

  test("throws on division by zero", () => {
    const a = fromFeetInchFraction(1, 0, 0, 1);
    expect(() => divideByScalar(a, 0)).toThrow("Division by zero");
  });

  test("15 ft / 5 = 3 ft", () => {
    const a = fromFeetInchFraction(15, 0, 0, 1, 16);
    const result = divideByScalar(a, 5);
    expect(toDecimalFeet(result)).toBeCloseTo(3);
  });
});

describe("divideByLength", () => {
  test("6 ft / 3 ft = 2 (ratio)", () => {
    const a = fromFeetInchFraction(6, 0, 0, 1);
    const b = fromFeetInchFraction(3, 0, 0, 1);
    expect(divideByLength(a, b)).toBeCloseTo(2);
  });

  test("throws on zero denominator", () => {
    const a = fromFeetInchFraction(1, 0, 0, 1);
    const b = fromThirtySeconds(0);
    expect(() => divideByLength(a, b)).toThrow("Division by zero length");
  });
});

describe("centerFind", () => {
  test("15 ft 4 in center = 7 ft 8 in", () => {
    const a = fromFeetInchFraction(15, 4, 0, 1, 16);
    const result = centerFind(a);
    const d = decompose(result);
    expect(d.feet).toBe(7);
    expect(d.inches).toBe(8);
    expect(d.numerator).toBe(0);
  });

  test("1 in center = 1/2 in", () => {
    const a = fromFeetInchFraction(0, 1, 0, 1, 16);
    const result = centerFind(a);
    const d = decompose(result);
    expect(d.inches).toBe(0);
    expect(d.numerator).toBe(1);
    expect(d.denominator).toBe(2);
  });
});

describe("equalSpacing", () => {
  test("12 ft / 4 spaces = positions at 0, 3, 6, 9, 12 ft", () => {
    const a = fromFeetInchFraction(12, 0, 0, 1, 16);
    const positions = equalSpacing(a, 4);
    expect(positions.length).toBe(5);
    expect(toDecimalFeet(positions[0])).toBeCloseTo(0);
    expect(toDecimalFeet(positions[1])).toBeCloseTo(3);
    expect(toDecimalFeet(positions[2])).toBeCloseTo(6);
    expect(toDecimalFeet(positions[3])).toBeCloseTo(9);
    expect(toDecimalFeet(positions[4])).toBeCloseTo(12);
  });

  test("throws for 0 spaces", () => {
    const a = fromFeetInchFraction(10, 0, 0, 1);
    expect(() => equalSpacing(a, 0)).toThrow();
  });
});

describe("decompose fraction normalization", () => {
  test("16/32 normalizes to 1/2", () => {
    const l = fromThirtySeconds(16, 16); // 16 ts = 1/2 inch at 1/16 precision
    const d = decompose(l);
    expect(d.inches).toBe(0);
    expect(d.numerator).toBe(1);
    expect(d.denominator).toBe(2);
  });

  test("0 ts = 0 in", () => {
    const l = fromThirtySeconds(0, 16);
    const d = decompose(l);
    expect(d.feet).toBe(0);
    expect(d.inches).toBe(0);
    expect(d.numerator).toBe(0);
    expect(d.formatted).toBe("0 in");
  });

  test("12 ft 0 in formats correctly", () => {
    const l = fromFeetInchFraction(12, 0, 0, 1, 16);
    const d = decompose(l);
    expect(d.feet).toBe(12);
    expect(d.inches).toBe(0);
    expect(d.formatted).toBe("12 ft");
  });
});

describe("decimal conversion", () => {
  test("1 ft = 12 decimal inches", () => {
    const l = fromFeetInchFraction(1, 0, 0, 1);
    expect(toDecimalInches(l)).toBeCloseTo(12);
  });

  test("1 ft = 1 decimal foot", () => {
    const l = fromFeetInchFraction(1, 0, 0, 1);
    expect(toDecimalFeet(l)).toBeCloseTo(1);
  });

  test("1 in = 2.54 cm", () => {
    const l = fromFeetInchFraction(0, 1, 0, 1);
    expect(toCentimeters(l)).toBeCloseTo(2.54);
  });

  test("1 ft = 0.3048 m", () => {
    const l = fromFeetInchFraction(1, 0, 0, 1);
    expect(toMeters(l)).toBeCloseTo(0.3048);
  });
});

describe("fromDecimalInches", () => {
  test("12 decimal inches → 1 ft", () => {
    const l = fromDecimalInches(12, 16);
    const d = decompose(l);
    expect(d.feet).toBe(1);
    expect(d.inches).toBe(0);
  });

  test("7.5 inches → 7 in 1/2", () => {
    const l = fromDecimalInches(7.5, 16);
    const d = decompose(l);
    expect(d.inches).toBe(7);
    expect(d.numerator).toBe(1);
    expect(d.denominator).toBe(2);
  });
});
