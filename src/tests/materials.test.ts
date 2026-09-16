/**
 * BuildTape Pro — Material Estimators Unit Tests
 */

import {
  calcBoardFeet,
  calcStudCount,
  calcDrywallSheets,
  calcConcreteVolume,
  calcArea,
} from "../../src/features/materials/MaterialEstimators";

describe("calcBoardFeet", () => {
  test("1x6x8 = 4 board feet", () => {
    const result = calcBoardFeet({
      thicknessInches: 1,
      widthInches: 6,
      lengthFeet: 8,
      quantity: 1,
    });
    expect(result.boardFeetPerPiece).toBeCloseTo(4);
  });

  test("2x4x10 qty 10", () => {
    const result = calcBoardFeet({
      thicknessInches: 2,
      widthInches: 4,
      lengthFeet: 10,
      quantity: 10,
    });
    // per piece = 2*4*10/12 = 6.667 bf
    // total = 66.667
    expect(result.boardFeetPerPiece).toBeCloseTo(6.667, 2);
    expect(result.totalBoardFeet).toBeCloseTo(66.667, 2);
  });

  test("quantity multiplier", () => {
    const single = calcBoardFeet({
      thicknessInches: 2,
      widthInches: 6,
      lengthFeet: 12,
      quantity: 1,
    });
    const ten = calcBoardFeet({
      thicknessInches: 2,
      widthInches: 6,
      lengthFeet: 12,
      quantity: 10,
    });
    expect(ten.totalBoardFeet).toBeCloseTo(single.totalBoardFeet * 10);
  });
});

describe("calcStudCount", () => {
  test("16 ft wall at 16 OC with ends", () => {
    const result = calcStudCount({
      wallLengthInches: 16 * 12, // 192 inches
      spacingInches: 16,
      includeEndStuds: true,
    });
    // 192/16 = 12 spaces, 13 field positions, -2 ends + 2 ends = 13 total
    expect(result.studCount).toBe(13);
  });

  test("include vs exclude end studs changes count", () => {
    const withEnds = calcStudCount({
      wallLengthInches: 96,
      spacingInches: 16,
      includeEndStuds: true,
    });
    const withoutEnds = calcStudCount({
      wallLengthInches: 96,
      spacingInches: 16,
      includeEndStuds: false,
    });
    expect(withEnds.studCount).toBeGreaterThan(withoutEnds.studCount);
  });

  test("zero length returns 0", () => {
    const result = calcStudCount({
      wallLengthInches: 0,
      spacingInches: 16,
      includeEndStuds: true,
    });
    expect(result.studCount).toBe(0);
  });

  test("24 OC spacing gives fewer studs than 16 OC", () => {
    const at16 = calcStudCount({
      wallLengthInches: 200,
      spacingInches: 16,
      includeEndStuds: true,
    });
    const at24 = calcStudCount({
      wallLengthInches: 200,
      spacingInches: 24,
      includeEndStuds: true,
    });
    expect(at24.studCount).toBeLessThan(at16.studCount);
  });
});

describe("calcDrywallSheets", () => {
  test("10x9 wall with 4x8 sheets, 10% waste", () => {
    const result = calcDrywallSheets({
      wallWidthInches: 120, // 10 ft
      wallHeightInches: 108, // 9 ft
      sheetWidthInches: 48, // 4 ft
      sheetHeightInches: 96, // 8 ft
      wastePercent: 10,
    });
    // net area = 120*108/144 = 90 sqft
    // sheet area = 48*96/144 = 32 sqft
    // sheets without waste = 90/32 = 2.8125 → 3
    // with 10% waste = 2.8125 * 1.1 = 3.09 → 4
    expect(result.netAreaSqFt).toBeCloseTo(90);
    expect(result.sheetsRequired).toBe(4);
  });

  test("0% waste rounds up correctly", () => {
    const result = calcDrywallSheets({
      wallWidthInches: 96, // 8 ft
      wallHeightInches: 96, // 8 ft
      sheetWidthInches: 48,
      sheetHeightInches: 96,
      wastePercent: 0,
    });
    // 8*8 / (4*8) = 64/32 = exactly 2 sheets
    expect(result.sheetsRequired).toBe(2);
  });
});

describe("calcConcreteVolume", () => {
  test("10x10x4 slab", () => {
    const result = calcConcreteVolume({
      lengthFeet: 10,
      widthFeet: 10,
      depthInches: 4,
    });
    // depth = 4/12 ft
    // cuFt = 10 * 10 * (4/12) = 33.333
    expect(result.cubicFeet).toBeCloseTo(33.333, 2);
    expect(result.cubicYards).toBeCloseTo(33.333 / 27, 2);
  });

  test("cubic yards conversion", () => {
    const result = calcConcreteVolume({
      lengthFeet: 27,
      widthFeet: 1,
      depthInches: 12,
    });
    // 27 * 1 * 1 = 27 cuFt = 1 cuYd
    expect(result.cubicFeet).toBeCloseTo(27);
    expect(result.cubicYards).toBeCloseTo(1);
  });

  test("bags are positive integers", () => {
    const result = calcConcreteVolume({
      lengthFeet: 5,
      widthFeet: 5,
      depthInches: 4,
    });
    expect(result.bags60lb).toBeGreaterThan(0);
    expect(result.bags80lb).toBeGreaterThan(0);
    expect(Number.isInteger(result.bags60lb)).toBe(true);
    expect(Number.isInteger(result.bags80lb)).toBe(true);
  });

  test("60lb bags > 80lb bags for same volume", () => {
    const result = calcConcreteVolume({
      lengthFeet: 10,
      widthFeet: 10,
      depthInches: 4,
    });
    // 60lb bags are smaller, so you need more of them
    expect(result.bags60lb).toBeGreaterThanOrEqual(result.bags80lb);
  });
});

describe("calcArea", () => {
  test("10x10 = 100 sqft", () => {
    const result = calcArea({ lengthFeet: 10, widthFeet: 10 });
    expect(result.squareFeet).toBeCloseTo(100);
  });

  test("9 sqft = 1 sqyd", () => {
    const result = calcArea({ lengthFeet: 3, widthFeet: 3 });
    expect(result.squareYards).toBeCloseTo(1);
  });

  test("square meters conversion", () => {
    const result = calcArea({ lengthFeet: 10, widthFeet: 10 });
    // 100 sqft ≈ 9.2903 sqm
    expect(result.squareMeters).toBeCloseTo(9.2903, 2);
  });
});
