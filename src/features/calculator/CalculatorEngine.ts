/**
 * BuildTape Pro — Calculator Engine
 * State machine for the construction tape calculator.
 */

import {
  Length,
  fromFeetInchFraction,
  fromDecimalFeet,
  fromDecimalInches,
  fromThirtySeconds,
  add,
  subtract,
  multiplyByScalar,
  divideByScalar,
  centerFind,
  equalSpacing,
  zero,
  decompose,
  isZero,
  PrecisionDenominator,
} from "../../lib/length";
import { formatLength } from "../../lib/formatting";
import type { DisplayMode } from "../../lib/formatting";

export type Operator = "+" | "-" | "×" | "÷" | null;
export type InputMode = "feet" | "inches" | "fraction" | "scalar";

export interface CalculatorState {
  /** The display value (what's being typed) */
  displayExpression: string;
  /** The first operand */
  operandA: Length | null;
  /** The pending operator */
  operator: Operator;
  /** Whether we're building operand B */
  awaitingOperandB: boolean;
  /** The current entry being built (as component parts) */
  currentFeet: number;
  currentInches: number;
  currentNumerator: number;
  currentDenominator: number;
  currentScalar: number;
  inputMode: InputMode;
  precision: PrecisionDenominator;
  displayMode: DisplayMode;
  /** The last computed result */
  result: Length | null;
  /** Error message if any */
  error: string | null;
  /** Stored Memory */
  memory: Length | null;
}

export interface TapeEntry {
  id: string;
  expression: string;
  result: string;
  resultLength: Length | null;
  resultTs: number;
  createdAt: string;
  type: "basic" | "stair" | "material" | "roof" | "memory";
  jobId?: string | null;
}

export function createInitialState(
  precision: PrecisionDenominator = 16,
  displayMode: DisplayMode = "fraction",
  memory: Length | null = null,
): CalculatorState {
  return {
    displayExpression: "0",
    operandA: null,
    operator: null,
    awaitingOperandB: false,
    currentFeet: 0,
    currentInches: 0,
    currentNumerator: 0,
    currentDenominator: 0,
    currentScalar: 0,
    inputMode: "feet",
    precision,
    displayMode,
    result: null,
    error: null,
    memory,
  };
}

/** Build a Length from current entry fields */
function buildCurrentLength(state: CalculatorState): Length {
  if (state.inputMode === "scalar") {
    return fromDecimalFeet(state.currentScalar, state.precision);
  }
  const den = state.currentDenominator || 1;
  return fromFeetInchFraction(
    state.currentFeet,
    state.currentInches,
    state.currentNumerator,
    den,
    state.precision,
  );
}

/** Format expression string for display */
function buildExpression(state: CalculatorState): string {
  const parts: string[] = [];
  if (state.operandA && state.operator) {
    const aStr = formatLength(state.operandA, "fraction");
    parts.push(aStr, state.operator);
  }

  // Current operand
  if (state.inputMode === "scalar") {
    parts.push(state.currentScalar.toString());
  } else {
    const cur = buildCurrentLength(state);
    if (!isZero(cur) || (state.currentFeet === 0 && state.currentInches === 0)) {
      parts.push(formatLength(cur, "fraction"));
    }
  }

  return parts.join(" ") || "0";
}

export type CalcAction =
  | { type: "DIGIT"; digit: string }
  | { type: "FRACTION"; numerator: number; denominator: number }
  | { type: "OPERATOR"; op: Operator }
  | { type: "EQUALS" }
  | { type: "CLEAR" }
  | { type: "BACKSPACE" }
  | { type: "SET_MODE"; mode: InputMode }
  | { type: "CENTER" }
  | { type: "SPACES"; n: number }
  | { type: "CONVERT"; to: DisplayMode }
  | { type: "SET_PRECISION"; precision: PrecisionDenominator }
  | { type: "LOAD_RESULT"; length: Length }
  | { type: "MEMORY_ADD" }
  | { type: "MEMORY_SUB" }
  | { type: "MEMORY_RECALL" }
  | { type: "MEMORY_CLEAR" };

export function calcReducer(
  state: CalculatorState,
  action: CalcAction,
): CalculatorState {
  switch (action.type) {
    case "CLEAR":
      return createInitialState(state.precision, state.displayMode, state.memory);

    case "SET_PRECISION":
      return { ...state, precision: action.precision };

    case "CONVERT":
      return { ...state, displayMode: action.to };

    case "LOAD_RESULT":
      return {
        ...state,
        operandA: action.length,
        currentFeet: decompose(action.length).feet,
        currentInches: decompose(action.length).inches,
        currentNumerator: decompose(action.length).numerator,
        currentDenominator: decompose(action.length).denominator,
        displayExpression: formatLength(action.length, "fraction"),
        result: action.length,
        operator: null,
        awaitingOperandB: false,
      };

    case "SET_MODE":
      return { ...state, inputMode: action.mode };

    case "DIGIT": {
      const d = parseInt(action.digit, 10);
      let newState: CalculatorState = { ...state, error: null };

      if (state.awaitingOperandB && !state.operator) {
        // After equals, start fresh
        newState = createInitialState(state.precision, state.displayMode);
      }

      switch (state.inputMode) {
        case "feet":
          newState.currentFeet = state.currentFeet * 10 + d;
          break;
        case "inches":
          newState.currentInches = state.currentInches * 10 + d;
          break;
        case "scalar":
          newState.currentScalar = state.currentScalar * 10 + d;
          break;
        case "fraction":
          // Typing a digit in fraction mode — pick common fraction
          break;
      }

      newState.displayExpression = buildExpression(newState);
      return newState;
    }

    case "FRACTION": {
      const newState = {
        ...state,
        currentNumerator: action.numerator,
        currentDenominator: action.denominator,
        inputMode: "fraction" as InputMode,
        error: null,
      };
      newState.displayExpression = buildExpression(newState);
      return newState;
    }

    case "OPERATOR": {
      const currentLength = buildCurrentLength(state);
      const a = state.operandA || currentLength;

      return {
        ...state,
        operandA: a,
        operator: action.op,
        awaitingOperandB: true,
        currentFeet: 0,
        currentInches: 0,
        currentNumerator: 0,
        currentDenominator: 0,
        currentScalar: 0,
        inputMode: "feet",
        displayExpression: formatLength(a, "fraction") + " " + action.op,
        error: null,
      };
    }

    case "EQUALS": {
      if (!state.operator || !state.operandA) {
        // Just finalize current entry
        const cur = buildCurrentLength(state);
        return {
          ...state,
          result: cur,
          displayExpression: formatLength(cur, state.displayMode),
        };
      }

      const b = buildCurrentLength(state);
      let result: Length;
      let error: string | null = null;

      try {
        switch (state.operator) {
          case "+":
            result = add(state.operandA, b);
            break;
          case "-":
            result = subtract(state.operandA, b);
            break;
          case "×":
            result = multiplyByScalar(state.operandA, state.currentScalar || state.currentFeet || 1);
            break;
          case "÷":
            const divisor = state.currentScalar || state.currentFeet;
            if (!divisor) throw new Error("Enter a divisor");
            result = divideByScalar(state.operandA, divisor);
            break;
          default:
            result = b;
        }
      } catch (e: any) {
        return { ...state, error: e.message || "Error" };
      }

      const exprA = formatLength(state.operandA, "fraction");
      const exprB =
        state.operator === "×" || state.operator === "÷"
          ? (state.currentScalar || state.currentFeet).toString()
          : formatLength(b, "fraction");

      return {
        ...state,
        result,
        operandA: null,
        operator: null,
        awaitingOperandB: false,
        displayExpression: `${exprA} ${state.operator} ${exprB} = ${formatLength(result, state.displayMode)}`,
        currentFeet: 0,
        currentInches: 0,
        currentNumerator: 0,
        currentDenominator: 0,
        currentScalar: 0,
        inputMode: "feet",
        error,
      };
    }

    case "CENTER": {
      const len = state.result || buildCurrentLength(state);
      const center = centerFind(len);
      return {
        ...state,
        result: center,
        operandA: null,
        operator: null,
        displayExpression: `${formatLength(len, "fraction")} ÷ 2 = ${formatLength(center, state.displayMode)}`,
        error: null,
      };
    }

    case "SPACES": {
      const len = state.result || buildCurrentLength(state);
      const spaces = equalSpacing(len, action.n);
      const spacing = spaces[1]; // First spacing interval
      return {
        ...state,
        result: spacing,
        operandA: null,
        operator: null,
        displayExpression: `${formatLength(len, "fraction")} / ${action.n} spaces = ${formatLength(spacing, state.displayMode)}`,
        error: null,
      };
    }

    case "BACKSPACE": {
      const newState = { ...state, error: null };
      switch (state.inputMode) {
        case "feet":
          newState.currentFeet = Math.floor(state.currentFeet / 10);
          break;
        case "inches":
          newState.currentInches = Math.floor(state.currentInches / 10);
          break;
        case "scalar":
          newState.currentScalar = Math.floor(state.currentScalar / 10);
          break;
        case "fraction":
          newState.currentNumerator = 0;
          newState.currentDenominator = 0;
          newState.inputMode = "inches";
          break;
      }
      newState.displayExpression = buildExpression(newState);
      return newState;
    }

    case "MEMORY_ADD": {
      const cur = state.result || buildCurrentLength(state);
      const newMemory = state.memory ? add(state.memory, cur) : cur;
      return { ...state, memory: newMemory, displayExpression: `M+ ${formatLength(cur, state.displayMode)}` };
    }

    case "MEMORY_SUB": {
      const cur = state.result || buildCurrentLength(state);
      const newMemory = state.memory ? subtract(state.memory, cur) : subtract(zero(), cur);
      return { ...state, memory: newMemory, displayExpression: `M- ${formatLength(cur, state.displayMode)}` };
    }

    case "MEMORY_RECALL": {
      if (!state.memory) return state;
      return {
        ...state,
        operandA: state.memory,
        currentFeet: decompose(state.memory).feet,
        currentInches: decompose(state.memory).inches,
        currentNumerator: decompose(state.memory).numerator,
        currentDenominator: decompose(state.memory).denominator,
        displayExpression: `MR: ${formatLength(state.memory, state.displayMode)}`,
        result: state.memory,
        operator: null,
        awaitingOperandB: false,
      };
    }

    case "MEMORY_CLEAR":
      return { ...state, memory: null, displayExpression: "MC" };

    default:
      return state;
  }
}

/** Build a TapeEntry from a completed calculation */
export function makeTapeEntry(
  expression: string,
  result: Length,
  type: TapeEntry["type"] = "basic",
): TapeEntry {
  return {
    id: generateId(),
    expression,
    result: formatLength(result, "fraction"),
    resultLength: result,
    resultTs: result.totalThirtySeconds,
    createdAt: new Date().toISOString(),
    type,
    jobId: null,
  };
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
