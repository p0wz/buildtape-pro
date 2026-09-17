/**
 * BuildTape Pro — Construction Solvers Hub
 * Master dashboard for Stairs, Roof/Rafters, and Materials Estimator.
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Colors, Typography, Spacing, Radius, Shadow } from "../../src/lib/theme";
import {
  StairsIcon,
  RoofIcon,
  MaterialsIcon,
  ChevronRightIcon,
  ToolsIcon,
} from "../../src/components/icons/TabIcons";

interface ToolCardProps {
  title: string;
  badge: string;
  badgeType?: "success" | "orange" | "info";
  description: string;
  icon: React.ReactNode;
  route: "/(tabs)/stairs" | "/(tabs)/rafters" | "/(tabs)/materials";
  highlights: string[];
}

function ToolCard({
  title,
  badge,
  badgeType = "orange",
  description,
  icon,
  route,
  highlights,
}: ToolCardProps) {
  const router = useRouter();

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(route as any);
  };

  const getBadgeStyle = () => {
    switch (badgeType) {
      case "success":
        return {
          bg: Colors.successBg,
          text: Colors.success,
          border: "rgba(34, 197, 94, 0.3)",
        };
      case "info":
        return {
          bg: "rgba(56, 189, 248, 0.12)",
          text: Colors.info,
          border: "rgba(56, 189, 248, 0.3)",
        };
      default:
        return {
          bg: Colors.orangeMuted,
          text: Colors.orange,
          border: Colors.orangeBorder,
        };
    }
  };

  const badgeStyle = getBadgeStyle();

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={handlePress}
      style={styles.card}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconBox}>{icon}</View>
        <View style={styles.cardTitleCol}>
          <View style={styles.titleRow}>
            <Text style={styles.cardTitle}>{title}</Text>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: badgeStyle.bg,
                  borderColor: badgeStyle.border,
                },
              ]}
            >
              <Text style={[styles.badgeText, { color: badgeStyle.text }]}>
                {badge}
              </Text>
            </View>
          </View>
          <Text style={styles.cardDesc}>{description}</Text>
        </View>
        <View style={styles.chevronBox}>
          <ChevronRightIcon color={Colors.textMuted} size={20} />
        </View>
      </View>

      <View style={styles.highlightRow}>
        {highlights.map((h, i) => (
          <View key={i} style={styles.highlightChip}>
            <Text style={styles.highlightDot}>•</Text>
            <Text style={styles.highlightText}>{h}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

export default function ToolsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIconCircle}>
            <ToolsIcon color={Colors.orange} size={24} />
          </View>
          <View style={styles.headerTextCol}>
            <Text style={styles.headerTitle}>Construction Solvers</Text>
            <Text style={styles.headerSub}>
              IBC-compliant layouts, roof pitches & material estimates
            </Text>
          </View>
        </View>

        {/* Solver Cards */}
        <View style={styles.cardsContainer}>
          <ToolCard
            title="Stairs Layout"
            badge="IBC Code Checked"
            badgeType="success"
            description="Calculates exact risers, treads, stringer throat and total run."
            icon={<StairsIcon color={Colors.orange} size={26} />}
            route="/(tabs)/stairs"
            highlights={[
              "7 3/4\" Max Riser",
              "10\" Min Tread",
              "Stringer Cut List",
            ]}
          />

          <ToolCard
            title="Roof & Rafters"
            badge="Pitch & Angles"
            badgeType="info"
            description="Common & hip rafter lengths, birdsmouth cuts, and pitch angles."
            icon={<RoofIcon color={Colors.info} size={26} />}
            route="/(tabs)/rafters"
            highlights={[
              "Plumb & Level Cuts",
              "Ridge Deduction",
              "Rise / Run Slopes",
            ]}
          />

          <ToolCard
            title="Materials Takeoff"
            badge="Takeoff Estimator"
            badgeType="orange"
            description="Concrete slab yardage, wall framing studs, and drywall sheets."
            icon={<MaterialsIcon color={Colors.orange} size={26} />}
            route="/(tabs)/materials"
            highlights={[
              "Cubic Yards & Bags",
              "Studs + 15% Waste",
              "4x8 & 4x12 Sheets",
            ]}
          />
        </View>

        {/* Quick Reference Inset */}
        <View style={styles.refBox}>
          <Text style={styles.refTitle}>JOB SITE CODE STANDARDS</Text>
          <View style={styles.refRow}>
            <Text style={styles.refLabel}>Stair 7-11 Rule:</Text>
            <Text style={styles.refVal}>Max Riser 7-3/4″ • Min Tread 10″</Text>
          </View>
          <View style={styles.refRow}>
            <Text style={styles.refLabel}>Standard Stud Spacing:</Text>
            <Text style={styles.refVal}>16″ OC (On Center) or 24″ OC</Text>
          </View>
          <View style={styles.refRow}>
            <Text style={styles.refLabel}>Concrete 1 Yard =</Text>
            <Text style={styles.refVal}>27 cu ft (81 sq ft @ 4″ thick)</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  headerIconCircle: {
    width: 46,
    height: 46,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: Typography.xl,
    fontWeight: "700",
    color: Colors.textPrimary,
    letterSpacing: -0.4,
  },
  headerSub: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  cardsContainer: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitleCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: Spacing.xs,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: Typography.base,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  cardDesc: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  chevronBox: {
    paddingTop: 4,
  },
  highlightRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  highlightChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  highlightDot: {
    fontSize: 12,
    color: Colors.orange,
  },
  highlightText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: "500",
  },
  refBox: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  refTitle: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  refRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  refLabel: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
  },
  refVal: {
    fontSize: Typography.xs,
    color: Colors.textPrimary,
    fontWeight: "600",
  },
});
