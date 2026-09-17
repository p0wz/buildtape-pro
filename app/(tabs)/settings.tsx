/**
 * BuildTape Pro — Settings Screen
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Modal,
  Platform,
} from "react-native";
import { useStore } from "../../src/store";
import { Colors, Typography, Spacing, Radius } from "../../src/lib/theme";
import {
  SectionHeader,
  ProBadge,
  Card,
  Divider,
  PrimaryButton,
  SecondaryButton,
} from "../../src/components/ui";
import {
  setSetting,
  clearAllTapeEntries,
} from "../../src/lib/sqlite";
import {
  getProPackage,
  purchasePro,
  restorePurchases,
  ProPackageInfo,
} from "../../src/lib/purchases";
import type { PrecisionDenominator } from "../../src/lib/length";
import type { DisplayMode } from "../../src/lib/formatting";
import { precisionLabel } from "../../src/lib/formatting";

export default function SettingsScreen() {
  const {
    isPro,
    setIsPro,
    precision,
    setPrecision,
    displayMode,
    setDisplayMode,
    clearTape,
    jobs,
  } = useStore();

  const [pkgInfo, setPkgInfo] = useState<ProPackageInfo | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);


  useEffect(() => {
    getProPackage().then(setPkgInfo).catch(() => {});
  }, []);

  const handlePurchase = async () => {
    setPurchasing(true);
    try {
      const res = await purchasePro();
      if (res.success && res.isPro) {
        setIsPro(true);
        try { setSetting("isPro", "true"); } catch (_) {}
        Alert.alert("Welcome to Pro!", "All features are now permanently unlocked.");
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

  const handleClearAll = () => {
    Alert.alert(
      "Clear All Data",
      "This will erase all tape history. Jobs will remain. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Tape",
          style: "destructive",
          onPress: () => {
            clearTape();
            clearAllTapeEntries();
          },
        },
      ],
    );
  };

  const setPrecisionAndSave = (p: PrecisionDenominator) => {
    setPrecision(p);
    try { setSetting("precision", String(p)); } catch (_) {}
  };

  const setDisplayModeAndSave = (m: DisplayMode) => {
    setDisplayMode(m);
    try { setSetting("displayMode", m); } catch (_) {}
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <SectionHeader title="Settings" />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Pro Banner */}
        <View style={[styles.proBanner, isPro && styles.proBannerActive]}>
          <View style={{ flex: 1 }}>
            <View style={styles.proTitleRow}>
              <Text style={styles.proTitle}>BuildTape Pro</Text>
              {isPro && <ProBadge />}
            </View>
            <Text style={styles.proTagline}>
              {isPro
                ? "✅ Pro mode active — all features unlocked."
                : "Buy once. Use forever.\nNo $40/year calculator subscription."}
            </Text>
          </View>
          {!isPro && (
            <View style={styles.priceTag}>
              <Text style={styles.priceTagText}>One-time</Text>
              <Text style={styles.priceTagPrice}>{pkgInfo?.priceString || "Lifetime"}</Text>
            </View>
          )}
        </View>

        {/* RevenueCat Lifetime In-App Purchase Section */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isPro ? "Lifetime Pro Membership" : "Upgrade to BuildTape Pro"}
          </Text>
          <Text style={styles.sectionNote}>
            {isPro
              ? "All features unlocked permanently. Thank you for your support!"
              : "One-time purchase · Lifetime access · No recurring fees."}
          </Text>
          <Divider />

          {isPro ? (
            <View style={{ gap: Spacing.md, paddingTop: Spacing.sm }}>
              <View style={styles.proActiveRow}>
                <Text style={styles.proActiveIcon}>🛡️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.proActiveTitle}>Lifetime License Active</Text>
                  <Text style={styles.proActiveSubtitle}>
                    All construction solvers, material estimators, and unlimited tape storage unlocked.
                  </Text>
                </View>
              </View>
              <SecondaryButton
                title={restoring ? "Restoring..." : "Restore Purchases"}
                onPress={handleRestore}
                disabled={restoring}
              />
            </View>
          ) : (
            <View style={{ gap: Spacing.md, paddingTop: Spacing.sm }}>
              <View style={styles.perkList}>
                <Text style={styles.perkItem}>✓ Stair Solver with code checks & stringers</Text>
                <Text style={styles.perkItem}>✓ Rafter Solver (common, hip/valley, pitch)</Text>
                <Text style={styles.perkItem}>✓ Materials: Studs, Drywall, Concrete, Board Feet</Text>
                <Text style={styles.perkItem}>✓ Unlimited Saved Jobs & Tape History</Text>
                <Text style={styles.perkItem}>✓ PDF Export & Jobsite Sharing</Text>
              </View>

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

              <Text style={styles.legalFootnote}>
                Payment will be charged to your Apple ID account at confirmation of purchase.
                One-time purchase, no subscription.
              </Text>

              <View style={styles.legalLinksRow}>
                <TouchableOpacity onPress={() => setShowTerms(true)} activeOpacity={0.7}>
                  <Text style={styles.legalLink}>Terms of Use (EULA)</Text>
                </TouchableOpacity>
                <Text style={styles.legalDot}>•</Text>
                <TouchableOpacity onPress={() => setShowPrivacy(true)} activeOpacity={0.7}>
                  <Text style={styles.legalLink}>Privacy Policy</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Card>


        {/* Precision */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Measurement Precision</Text>
          <Text style={styles.sectionNote}>
            How fine to round fractional inches in results.
          </Text>
          <Divider />
          <View style={styles.segRow}>
            {([8, 16, 32] as PrecisionDenominator[]).map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.seg, precision === p && styles.segActive]}
                onPress={() => setPrecisionAndSave(p)}
              >
                <Text style={[styles.segText, precision === p && styles.segTextActive]}>
                  {precisionLabel(p)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Display Mode */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Result Display</Text>
          <Divider />
          {(
            [
              { id: "fraction", label: "Fraction", example: '12 ft 7 3/8"' },
              { id: "decimal_inches", label: "Decimal Inches", example: '151.375"' },
              { id: "decimal_feet", label: "Decimal Feet", example: "12.6146 ft" },
              { id: "metric", label: "Metric", example: "3.845 m" },
            ] as { id: DisplayMode; label: string; example: string }[]
          ).map((opt) => (
            <TouchableOpacity
              key={opt.id}
              style={[styles.displayRow, displayMode === opt.id && styles.displayRowActive]}
              onPress={() => setDisplayModeAndSave(opt.id)}
            >
              <View
                style={[
                  styles.radio,
                  displayMode === opt.id && styles.radioActive,
                ]}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>{opt.label}</Text>
                <Text style={styles.rowSub}>{opt.example}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </Card>

        {/* Data Management */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <Divider />
          <View style={styles.dataRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Saved Jobs</Text>
              <Text style={styles.rowSub}>{jobs.length} job{jobs.length !== 1 ? "s" : ""}</Text>
            </View>
          </View>
          <SecondaryButton
            title="Clear All Tape History"
            onPress={handleClearAll}
            destructive
            icon="🗑"
            style={{ marginTop: Spacing.md }}
          />
        </Card>

        {/* About */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Divider />
          <View style={styles.aboutGrid}>
            <AboutRow label="App" value="BuildTape Pro" />
            <AboutRow label="Version" value="1.0.0" />
            <AboutRow label="License" value="Lifetime · One-time purchase" />
            <AboutRow label="Backend" value="None — 100% offline" />
            <AboutRow label="Storage" value="Local SQLite only" />
            <AboutRow label="Analytics" value="None" />
          </View>
          <View style={styles.taglineBox}>
            <Text style={styles.taglineText}>
              📐 Built for contractors, carpenters, framers, roofers, and serious DIY builders.{"\n\n"}
              No subscription. No account. No internet. Your data stays on your device.
            </Text>
          </View>
        </Card>

      </ScrollView>

      {/* Terms of Use (EULA) Modal */}
      <Modal visible={showTerms} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Terms of Use (EULA)</Text>
              <TouchableOpacity onPress={() => setShowTerms(false)} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.legalText}>
                Standard End User License Agreement (EULA){"\n\n"}
                1. License: BuildTape Pro grants you a personal, non-exclusive, non-transferable license to use the application on authorized devices.{"\n\n"}
                2. Calculations & Safety: All calculations (including stair, rafter, and material estimates) are planning aids. You must independently verify all dimensions and comply with applicable local building codes.{"\n\n"}
                3. One-Time Purchase: Lifetime unlock provides permanent access to all Pro features with no recurring charges.{"\n\n"}
                4. Disclaimer: BuildTape Pro is provided "as-is" without warranty of any kind.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal visible={showPrivacy} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Privacy Policy</Text>
              <TouchableOpacity onPress={() => setShowPrivacy(false)} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.legalText}>
                Privacy Policy for BuildTape Pro{"\n\n"}
                1. Zero Tracking: BuildTape Pro does not track you across apps or websites. No advertising IDs or personal identity data are collected.{"\n\n"}
                2. Offline & Local Storage: All jobs, tape records, and preferences are stored exclusively on your device using local SQLite / storage.{"\n\n"}
                3. In-App Purchases: Purchase processing is handled directly by Apple StoreKit / RevenueCat. We never have access to your payment card details.{"\n\n"}
                4. Camera & Photos: Photo access is used solely to attach on-site job photos chosen by you. No photos leave your device.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function AboutRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.aboutRow}>
      <Text style={styles.aboutLabel}>{label}</Text>
      <Text style={styles.aboutValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  header: {
    padding: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  scroll: {
    padding: Spacing.base,
    gap: Spacing.base,
    paddingBottom: 100,
  },
  proBanner: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  proBannerActive: {
    borderColor: Colors.orange,
    backgroundColor: Colors.orangeMuted,
  },
  proTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: 4,
  },
  proTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.lg,
    fontWeight: Typography.heavy,
  },
  proTagline: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    lineHeight: 20,
  },
  priceTag: {
    backgroundColor: Colors.orange,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    alignItems: "center",
  },
  priceTagText: {
    color: Colors.textOnOrange,
    fontSize: 9,
    fontWeight: Typography.semibold,
    textTransform: "uppercase",
  },
  priceTagPrice: {
    color: Colors.textOnOrange,
    fontSize: Typography.base,
    fontWeight: Typography.heavy,
  },
  section: { gap: Spacing.md },
  sectionTitle: {
    color: Colors.orange,
    fontSize: Typography.xs,
    fontWeight: Typography.heavy,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  sectionNote: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
    lineHeight: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  rowLabel: {
    color: Colors.textPrimary,
    fontSize: Typography.base,
    fontWeight: Typography.medium,
  },
  rowSub: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
    marginTop: 2,
  },
  segRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  seg: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  segActive: {
    backgroundColor: Colors.orangeMuted,
    borderColor: Colors.orange,
  },
  segText: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
  },
  segTextActive: { color: Colors.orange },
  displayRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  displayRowActive: {},
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.textMuted,
  },
  radioActive: {
    borderColor: Colors.orange,
    backgroundColor: Colors.orange,
  },
  dataRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.xs,
  },
  aboutGrid: { gap: Spacing.sm },
  aboutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  aboutLabel: {
    color: Colors.textMuted,
    fontSize: Typography.sm,
  },
  aboutValue: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
    textAlign: "right",
    flex: 1,
    marginLeft: Spacing.md,
  },
  taglineBox: {
    backgroundColor: Colors.bg,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.sm,
  },
  taglineText: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    lineHeight: 20,
  },
  proActiveRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.orangeMuted,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.orange,
    gap: Spacing.md,
  },
  proActiveIcon: {
    fontSize: 28,
  },
  proActiveTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
  },
  proActiveSubtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.xs,
    marginTop: 2,
    lineHeight: 16,
  },
  perkList: {
    gap: 6,
    backgroundColor: Colors.bg,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  perkItem: {
    color: Colors.textSecondary,
    fontSize: Typography.xs + 1,
    lineHeight: 18,
  },
  legalFootnote: {
    color: Colors.textMuted,
    fontSize: 10,
    lineHeight: 14,
    textAlign: "center",
    marginTop: 4,
  },
  legalLinksRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: 6,
  },
  legalLink: {
    color: Colors.orange,
    fontSize: Typography.xs,
    fontWeight: Typography.medium,
    textDecorationLine: "underline",
  },
  legalDot: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    maxHeight: "80%",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
  },
  modalCloseBtn: {
    padding: Spacing.xs,
  },
  modalCloseText: {
    color: Colors.textMuted,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
  },
  modalBody: {
    padding: Spacing.base,
  },
  legalText: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    lineHeight: 22,
    paddingBottom: Spacing.xl,
  },
});

