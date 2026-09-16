/**
 * BuildTape Pro — Material Estimators
 * All pure functions — no React, no RN dependencies.
 */

// ─── Board Feet ────────────────────────────────────────────────────────────

export interface BoardFeetInput {
  thicknessInches: number;
  widthInches: number;
  lengthFeet: number;
  quantity: number;
}

export interface BoardFeetResult {
  boardFeetPerPiece: number;
  totalBoardFeet: number;
}

export function calcBoardFeet(input: BoardFeetInput): BoardFeetResult {
  const bfPerPiece =
    (input.thicknessInches * input.widthInches * input.lengthFeet) / 12;
  return {
    boardFeetPerPiece: bfPerPiece,
    totalBoardFeet: bfPerPiece * input.quantity,
  };
}

// ─── Stud Count ───────────────────────────────────────────────────────────

export interface StudCountInput {
  /** Wall length in inches */
  wallLengthInches: number;
  /** Spacing in inches: 12, 16, or 24 */
  spacingInches: 12 | 16 | 24;
  includeEndStuds: boolean;
}

export interface StudCountResult {
  studCount: number;
}

export function calcStudCount(input: StudCountInput): StudCountResult {
  if (input.wallLengthInches <= 0) return { studCount: 0 };
  const fieldStuds = Math.ceil(input.wallLengthInches / input.spacingInches) + 1;
  const endStuds = input.includeEndStuds ? 2 : 0;
  // subtract the 2 end positions from fieldStuds since they overlap with ends
  const innerStuds = Math.max(0, fieldStuds - 2);
  const total = innerStuds + endStuds;
  return { studCount: total };
}

// ─── Drywall Sheets ───────────────────────────────────────────────────────

export interface DrywallInput {
  /** Wall width in inches */
  wallWidthInches: number;
  /** Wall height in inches */
  wallHeightInches: number;
  /** Sheet width in inches (usually 48) */
  sheetWidthInches: number;
  /** Sheet height in inches (96, 120, or 144) */
  sheetHeightInches: number;
  /** Waste percent (e.g. 10 = 10%) */
  wastePercent: number;
}

export interface DrywallResult {
  sheetsRequired: number;
  netAreaSqFt: number;
  sheetAreaSqFt: number;
}

export function calcDrywallSheets(input: DrywallInput): DrywallResult {
  const wallAreaSqIn = input.wallWidthInches * input.wallHeightInches;
  const wallAreaSqFt = wallAreaSqIn / 144;
  const sheetAreaSqIn = input.sheetWidthInches * input.sheetHeightInches;
  const sheetAreaSqFt = sheetAreaSqIn / 144;
  const wasteFactor = 1 + input.wastePercent / 100;
  const sheetsRequired = Math.ceil((wallAreaSqFt / sheetAreaSqFt) * wasteFactor);
  return {
    sheetsRequired,
    netAreaSqFt: wallAreaSqFt,
    sheetAreaSqFt,
  };
}

// ─── Concrete Volume ──────────────────────────────────────────────────────

export interface ConcreteInput {
  lengthFeet: number;
  widthFeet: number;
  /** Depth in inches */
  depthInches: number;
}

export interface ConcreteResult {
  cubicFeet: number;
  cubicYards: number;
  /** 60-lb bags needed */
  bags60lb: number;
  /** 80-lb bags needed */
  bags80lb: number;
}

// 1 cubic foot of concrete ≈ 0.45 bags of 60lb / 0.6 bags of 80lb
// More precisely: 60lb bag = ~0.45 cu ft, 80lb bag = ~0.60 cu ft
const CU_FT_PER_60LB_BAG = 0.45;
const CU_FT_PER_80LB_BAG = 0.60;

export function calcConcreteVolume(input: ConcreteInput): ConcreteResult {
  const depthFt = input.depthInches / 12;
  const cubicFeet = input.lengthFeet * input.widthFeet * depthFt;
  const cubicYards = cubicFeet / 27;
  const bags60lb = Math.ceil(cubicFeet / CU_FT_PER_60LB_BAG);
  const bags80lb = Math.ceil(cubicFeet / CU_FT_PER_80LB_BAG);
  return { cubicFeet, cubicYards, bags60lb, bags80lb };
}

// ─── Area Calculator ──────────────────────────────────────────────────────

export interface AreaInput {
  lengthFeet: number;
  widthFeet: number;
}

export interface AreaResult {
  squareFeet: number;
  squareYards: number;
  squareMeters: number;
}

const SQ_FT_PER_SQ_YARD = 9;
const SQ_FT_PER_SQ_METER = 10.7639;

export function calcArea(input: AreaInput): AreaResult {
  const squareFeet = input.lengthFeet * input.widthFeet;
  return {
    squareFeet,
    squareYards: squareFeet / SQ_FT_PER_SQ_YARD,
    squareMeters: squareFeet / SQ_FT_PER_SQ_METER,
  };
}
