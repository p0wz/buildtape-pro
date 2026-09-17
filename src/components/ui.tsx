/**
 * BuildTape Pro — Shared UI Components
 */

import React from "react";
import {
  View,
  Text as RNText,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  TextProps,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Colors, Typography, Spacing, Radius, Shadow, CalcKey } from "../lib/theme";
import {
  purchasePro,
  restorePurchases,
  getProPackage,
  ProPackageInfo,
} from "../lib/purchases";
import { useStore } from "../store";
import { setSetting } from "../lib/sqlite";

// ─── AppText ─────────────────────────────────────────────────────────────────

export function AppText(props: TextProps) {
  // Determine font weight from style
  const flattened = StyleSheet.flatten(props.style);
  const weight = flattened?.fontWeight || "400";
  
  let fontFamily = "Inter_400Regular";
  if (weight === "500") fontFamily = "Inter_500Medium";
  if (weight === "600" || weight === "bold" && !flattened.fontWeight) fontFamily = "Inter_600SemiBold";
  if (weight === "700" || weight === "bold") fontFamily = "Inter_700Bold";
  if (weight === "800") fontFamily = "Inter_800ExtraBold";

  return <RNText {...props} style={[{ fontFamily }, props.style]} />;
}

// ─── ProBadge ────────────────────────────────────────────────────────────────

export function ProBadge({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.proBadge, style]}>
      <AppText style={styles.proBadgeText}>PRO</AppText>
    </View>
  );
}

// ─── SectionHeader ───────────────────────────────────────────────────────────

export function SectionHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={{ flex: 1 }}>
        <AppText style={styles.sectionTitle}>{title}</AppText>
        {subtitle ? (
          <AppText style={styles.sectionSubtitle}>{subtitle}</AppText>
        ) : null}
      </View>
      {right}
    </View>
  );
}

// ─── ProGate ─────────────────────────────────────────────────────────────────

export function ProGate({
  children,
  isPro,
  featureName,
}: {
  children?: React.ReactNode;
  isPro: boolean;
  featureName: string;
}) {
  const router = useRouter();
  const { setIsPro } = useStore();
  const [pkgInfo, setPkgInfo] = React.useState<ProPackageInfo | null>(null);
  const [purchasing, setPurchasing] = React.useState(false);
  const [restoring, setRestoring] = React.useState(false);

  React.useEffect(() => {
    getProPackage().then(setPkgInfo).catch(() => {});
  }, []);

  if (isPro) return <>{children}</>;

  const handlePurchase = async () => {
    setPurchasing(true);
    try {
      const res = await purchasePro();
      if (res.success && res.isPro) {
        setIsPro(true);
        try { setSetting("isPro", "true"); } catch (_) {}
        Alert.alert("Welcome to Pro!", `${featureName} and all pro features are now permanently unlocked.`);
      } else if (res.error) {
        Alert.alert("Purchase Failed", res.error);
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const res = await restorePurchases();
      if (res.isPro) {
        setIsPro(true);
        try { setSetting("isPro", "true"); } catch (_) {}
      }
      Alert.alert(res.isPro ? "Restored!" : "Notice", res.message);
    } finally {
      setRestoring(false);
    }
  };

  return (
    <View style={styles.proGate}>
      <AppText style={styles.proGateIcon}>🔒</AppText>
      <AppText style={styles.proGateTitle}>Unlock {featureName}</AppText>
      <AppText style={styles.proGateBody}>
        {featureName} is available in BuildTape Pro.{"\n"}
        Get instant access to all solvers, estimators, and unlimited saved jobs.
      </AppText>

      <View style={{ width: "100%", maxWidth: 320, gap: Spacing.sm, marginTop: Spacing.sm }}>
        <PrimaryButton
          title={purchasing ? "Processing..." : `Unlock Lifetime Pro — ${pkgInfo?.priceString || "$9.99"}`}
          onPress={handlePurchase}
          disabled={purchasing}
        />
        <SecondaryButton
          title={restoring ? "Restoring..." : "Restore Purchases"}
          onPress={handleRestore}
          disabled={restoring}
        />
        <TouchableOpacity
          style={{ alignItems: "center", paddingVertical: 6 }}
          onPress={() => router.push("/(tabs)/settings")}
          activeOpacity={0.7}
        >
          <AppText style={{ fontSize: 13, color: Colors.orange, textDecorationLine: "underline" }}>
            View All Features & Settings →
          </AppText>
        </TouchableOpacity>

        <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 2 }}>
          <TouchableOpacity onPress={() => router.push("/(tabs)/settings")} activeOpacity={0.7}>
            <AppText style={{ fontSize: 11, color: Colors.textSecondary, textDecorationLine: "underline" }}>
              Terms of Use (EULA)
            </AppText>
          </TouchableOpacity>
          <AppText style={{ fontSize: 11, color: Colors.textMuted }}>•</AppText>
          <TouchableOpacity onPress={() => router.push("/(tabs)/settings")} activeOpacity={0.7}>
            <AppText style={{ fontSize: 11, color: Colors.textSecondary, textDecorationLine: "underline" }}>
              Privacy Policy
            </AppText>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.proGatePill}>
        <AppText style={styles.proGatePillText}>One-time purchase · Lifetime access</AppText>
      </View>
    </View>
  );
}

// ─── EmptyState ──────────────────────────────────────────────────────────────

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: string;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <View style={styles.emptyState}>
      <AppText style={styles.emptyIcon}>{icon}</AppText>
      <AppText style={styles.emptyTitle}>{title}</AppText>
      <AppText style={styles.emptyBody}>{body}</AppText>
      {action}
    </View>
  );
}

// ─── PrimaryButton ───────────────────────────────────────────────────────────

export function PrimaryButton({
  title,
  onPress,
  disabled,
  loading,
  style,
  icon,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  icon?: string;
}) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };
  return (
    <TouchableOpacity
      style={[styles.primaryBtn, disabled && styles.primaryBtnDisabled, style]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={Colors.textOnOrange} size="small" />
      ) : (
        <>
          {icon ? <AppText style={styles.primaryBtnIcon}>{icon}</AppText> : null}
          <AppText style={styles.primaryBtnText}>{title}</AppText>
        </>
      )}
    </TouchableOpacity>
  );
}

// ─── SecondaryButton ──────────────────────────────────────────────────────────

export function SecondaryButton({
  title,
  onPress,
  disabled,
  style,
  icon,
  destructive,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: string;
  destructive?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.secondaryBtn, destructive && styles.secondaryBtnDestructive, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {icon ? (
        <AppText style={[styles.secondaryBtnText, destructive && styles.destructiveText]}>
          {icon}{"  "}
        </AppText>
      ) : null}
      <AppText style={[styles.secondaryBtnText, destructive && styles.destructiveText]}>
        {title}
      </AppText>
    </TouchableOpacity>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────────

export function Card({
  children,
  style,
  onPress,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}) {
  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.card, style]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

// ─── Divider ────────────────────────────────────────────────────────────────

export function Divider({ style }: { style?: ViewStyle }) {
  return <View style={[styles.divider, style]} />;
}

// ─── LengthDisplayBox ────────────────────────────────────────────────────────

export function LengthDisplayBox({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <View style={styles.displayBox}>
      <AppText style={styles.displayBoxLabel}>{label}</AppText>
      <AppText style={[styles.displayBoxValue, muted && styles.displayBoxMuted]}>
        {value}
      </AppText>
    </View>
  );
}

// ─── Disclaimer ──────────────────────────────────────────────────────────────

export function Disclaimer({ text }: { text: string }) {
  return (
    <View style={styles.disclaimer}>
      <AppText style={styles.disclaimerText}>⚠ {text}</AppText>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  proBadge: {
    backgroundColor: Colors.orange,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.pill,
  },
  proBadgeText: {
    color: Colors.textOnOrange,
    fontSize: Typography.xs,
    fontWeight: Typography.heavy,
    letterSpacing: 0.8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.md,
    fontWeight: Typography.bold,
  },
  sectionSubtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    marginTop: 2,
  },
  proGate: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xxl,
    gap: Spacing.md,
  },
  proGateIcon: { fontSize: 48 },
  proGateTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    textAlign: "center",
  },
  proGateBody: {
    color: Colors.textSecondary,
    fontSize: Typography.base,
    textAlign: "center",
    lineHeight: 22,
  },
  proGatePill: {
    backgroundColor: Colors.orangeMuted,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.orange,
    marginTop: Spacing.sm,
  },
  proGatePillText: {
    color: Colors.orange,
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xxl,
    gap: Spacing.md,
    paddingBottom: 80,
  },
  emptyIcon: { fontSize: 52, marginBottom: Spacing.sm },
  emptyTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    textAlign: "center",
  },
  emptyBody: {
    color: Colors.textSecondary,
    fontSize: Typography.base,
    textAlign: "center",
    lineHeight: 22,
  },
  primaryBtn: {
    backgroundColor: Colors.orange,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.lg,
    gap: Spacing.sm,
    ...Shadow.card,
  },
  primaryBtnDisabled: {
    backgroundColor: Colors.textMuted,
  },
  primaryBtnIcon: { fontSize: Typography.md },
  primaryBtnText: {
    color: Colors.textOnOrange,
    fontSize: Typography.md,
    fontWeight: Typography.bold,
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.base,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 2,
  },
  secondaryBtnDestructive: {
    borderColor: Colors.error,
    backgroundColor: Colors.errorBg,
  },
  secondaryBtnText: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
  },
  destructiveText: { color: Colors.error },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  displayBox: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  displayBoxLabel: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  displayBoxValue: {
    color: Colors.textPrimary,
    fontSize: Typography.md,
    fontWeight: Typography.semibold,
  },
  displayBoxMuted: {
    color: Colors.textSecondary,
  },
  disclaimer: {
    backgroundColor: Colors.warningBg,
    borderWidth: 1,
    borderColor: Colors.warning + "60",
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.base,
  },
  disclaimerText: {
    color: Colors.warning,
    fontSize: Typography.sm,
    lineHeight: 18,
  },
});
