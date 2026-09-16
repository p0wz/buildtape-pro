/**
 * BuildTape Pro — Rafter / Geometry Solver
 * Computes Common, Hip, and Valley rafters based on Pitch and Run.
 */

import { Length, fromDecimalInches, decompose } from "../../lib/length";

export interface RafterResult {
  run: Length;
  rise: Length;
  pitch: number; // e.g. 4 for 4/12
  commonLength: Length;
  hipValleyLength: Length;
  plumbCutAngle: number; // degrees
  levelCutAngle: number; // degrees
}

export function solveRafter(run: Length, pitch: number): RafterResult {
  const runInches = decompose(run).decimalInches;
  
  // Rise = Run * (Pitch / 12)
  const riseInches = runInches * (pitch / 12);
  
  // Common = sqrt(Run^2 + Rise^2)
  const commonInches = Math.sqrt(Math.pow(runInches, 2) + Math.pow(riseInches, 2));
  
  // Hip/Valley (assuming 90 degree corner, run multiplier is sqrt(2) ≈ 1.41421356)
  // Run of hip = Run * Math.SQRT2
  const hipRunInches = runInches * Math.SQRT2;
  const hipInches = Math.sqrt(Math.pow(hipRunInches, 2) + Math.pow(riseInches, 2));

  // Angles
  const plumbCutAngle = (Math.atan(pitch / 12) * 180) / Math.PI;
  const levelCutAngle = 90 - plumbCutAngle;

  return {
    run,
    pitch,
    rise: fromDecimalInches(riseInches),
    commonLength: fromDecimalInches(commonInches),
    hipValleyLength: fromDecimalInches(hipInches),
    plumbCutAngle,
    levelCutAngle,
  };
}
