/**
 * BuildTape Pro — Premium Tier-1 Construction Design Tokens
 * Upgraded aesthetic: deep OLED blacks, high-vis safety orange, crisp borders.
 */

export const Colors = {
  // Base OLED Canvas
  bg: "#0A0A0C",
  surface: "#141417",
  card: "#1C1C21",
  cardRaised: "#24242A",
  cardHighlight: "#2D2D35",
  border: "#2A2A30",
  borderLight: "#3B3B44",

  // Brand — Hi-Vis Safety Orange & Accents
  orange: "#FF6600",
  orangeLight: "#FF8533",
  orangeDark: "#D95700",
  orangeMuted: "rgba(255, 102, 0, 0.12)",
  orangeBorder: "rgba(255, 102, 0, 0.35)",

  // Text Hierarchy
  textPrimary: "#F4F4F6",   // Pure crisp text
  textSecondary: "#9E9EA8", // Secondary details
  textMuted: "#6B6B76",     // Inactive hints
  textOnOrange: "#FFFFFF",

  // Semantic
  success: "#22C55E",
  successBg: "rgba(34, 197, 94, 0.12)",
  warning: "#FBBF24",
  warningBg: "rgba(251, 191, 36, 0.12)",
  error: "#EF4444",
  errorBg: "rgba(239, 68, 68, 0.12)",
  info: "#38BDF8",

  // Calculator Keypad
  keyDefault: "#1C1C21",
  keyDefaultActive: "#2C2C34",
  keyOperator: "#28170B",
  keyOperatorActive: "#FF6600",
  keyOperatorText: "#FF8533",
  keySpecial: "#142618",
  keySpecialActive: "#22C55E",
  keySpecialText: "#4ADE80",
  keyAction: "#FF6600",
  keyActionActive: "#FF8533",
  keyScalar: "#18181D",

  // Tab Bar
  tabActive: "#FF6600",
  tabInactive: "#767682",
  tabBg: "#101014",
  tabBorder: "#1E1E24",
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
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 999,
} as const;

export const Shadow = {
  card: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
  },
  key: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 3,
    elevation: 3,
  },
  glow: {
    shadowColor: "#FF6600",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  }
} as const;

export const CalcKey = {
  height: 60,
  opHeight: 60,
  wideHeight: 54,
  borderRadius: 14,
  gap: 8,
} as const;

