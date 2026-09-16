/**
 * BuildTape Pro — Premium Design Tokens
 * Upgraded aesthetic: deeper blacks, vivid orange, subtle glass/gradients.
 */

export const Colors = {
  // Base
  bg: "#121212",
  surface: "#1C1C1E",
  card: "#252528",
  cardRaised: "#2C2C30",
  border: "#333336",
  borderLight: "#444448",

  // Brand — Vivid Safety Orange
  orange: "#FF6B00",
  orangeLight: "#FF8C33",
  orangeDark: "#CC5500",
  orangeMuted: "#331600",

  // Text
  textPrimary: "#F2F2F7",   // Apple-style off-white
  textSecondary: "#8E8E93",
  textMuted: "#636366",
  textOnOrange: "#FFFFFF",

  // Semantic
  success: "#30D158",
  successBg: "#0C3A16",
  warning: "#FFD60A",
  warningBg: "#3A3000",
  error: "#FF453A",
  errorBg: "#3A0B0B",
  info: "#0A84FF",

  // Calculator-specific
  keyDefault: "#2C2C2E",
  keyOperator: "#3A1800",
  keyOperatorActive: "#FF6B00",
  keySpecial: "#1A2E1E",
  keySpecialActive: "#30D158",
  keyScalar: "#1C1C1E",

  // Tab bar
  tabActive: "#FF6B00",
  tabInactive: "#636366",
  tabBg: "#121212",
  tabBorder: "#1C1C1E",
} as const;

export const Typography = {
  // Font sizes
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 44,

  // Weights
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
  heavy: "800" as const,

  // FontFamily will be handled in _layout.tsx via expo-font
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const Radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const Shadow = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  key: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  glow: {
    shadowColor: "#FF6B00",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 10,
  }
} as const;

export const CalcKey = {
  /** Standard key (digit, mode) */
  height: 64,
  /** Operator key height */
  opHeight: 64,
  /** Special wide keys */
  wideHeight: 56,
  borderRadius: 16,
  gap: 10,
} as const;
