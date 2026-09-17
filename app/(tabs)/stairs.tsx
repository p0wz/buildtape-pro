/**
 * BuildTape Pro — Stair Solver Screen
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useStore } from "../../src/store";
import { Colors, Typography, Spacing, Radius, Shadow } from "../../src/lib/theme";
import {
  SectionHeader,
  ProGate,
  PrimaryButton,
  Card,
  Divider,
  Disclaimer,
  LengthDisplayBox,
} from "../../src/components/ui";
import {
  solveStairs,
  StairInput,
  StairResult,
  StairRun,
} from "../../src/features/stairs/StairSolver";
import { fromFeetInchFraction, fromDecimalInches, decompose } from "../../src/lib/length";
import { formatLength } from "../../src/lib/formatting";

export default function StairsScreen() {
  const { isPro, precision } = useStore();

  if (!isPro) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <SectionHeader title="Stair Solver" subtitle="Pro feature" />
        </View>
        <ProGate isPro={false} featureName="Stair Solver" />
      </SafeAreaView>
    );
  }

  return <StairSolverContent precision={precision} />;
}

function StairSolverContent({ precision }: { precision: 8 | 16 | 32 }) {
  const router = useRouter();
  const [riseFt, setRiseFt] = useState("8");
  const [riseIn, setRiseIn] = useState("0");
  const [prefRiser, setPrefRiser] = useState("7.75");
  const [prefTread, setPrefTread] = useState("10");
  const [nosing, setNosing] = useState("0");
  const [result, setResult] = useState<StairResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAlts, setShowAlts] = useState(false);

  const handleSolve = () => {
    setError(null);
    setResult(null);
    try {
      const ft = parseFloat(riseFt) || 0;
      const inches = parseFloat(riseIn) || 0;
      const totalRise = fromFeetInchFraction(ft, inches, 0, 1, precision);

      const input: StairInput = {
        totalRise,
        preferredRiserInches: parseFloat(prefRiser) || 7.75,
        preferredTreadInches: parseFloat(prefTread) || 10,
        nosingInches: parseFloat(nosing) || 0,
        floorThicknessInches: 0,
        precision,
      };

      const res = solveStairs(input);
      setResult(res);
    } catch (e: any) {
      setError(e.message || "Solver error");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.push("/(tabs)/tools")}
              activeOpacity={0.7}
            >
              <Text style={styles.backBtnText}>← Solvers Hub</Text>
            </TouchableOpacity>
            <SectionHeader
              title="Stair Solver"
              subtitle="Optimal riser/tread calculation"
            />
          </View>

          {/* Inputs */}
          <Card style={styles.inputCard}>
            <Text style={styles.inputLabel}>TOTAL RISE</Text>
            <View style={styles.riseRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputSub}>Feet</Text>
                <TextInput
                  style={styles.input}
                  value={riseFt}
                  onChangeText={setRiseFt}
                  keyboardType="decimal-pad"
                  placeholder="8"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputSub}>Inches</Text>
                <TextInput
                  style={styles.input}
                  value={riseIn}
                  onChangeText={setRiseIn}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            </View>

            <Divider />

            <View style={styles.prefRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputSub}>Preferred Riser (in)</Text>
                <TextInput
                  style={styles.input}
                  value={prefRiser}
                  onChangeText={setPrefRiser}
                  keyboardType="decimal-pad"
                  placeholder="7.75"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputSub}>Tread Depth (in)</Text>
                <TextInput
                  style={styles.input}
                  value={prefTread}
                  onChangeText={setPrefTread}
                  keyboardType="decimal-pad"
                  placeholder="10"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            </View>

            <View style={{ marginTop: Spacing.sm }}>
              <Text style={styles.inputSub}>Nosing Overhang (in, optional)</Text>
              <TextInput
                style={[styles.input, { marginTop: 0 }]}
                value={nosing}
                onChangeText={setNosing}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          </Card>

          <PrimaryButton
            title="Solve Stairs"
            onPress={handleSolve}
            icon="📐"
            style={{ marginHorizontal: Spacing.base }}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {result ? <StairResultView result={result} showAlts={showAlts} setShowAlts={setShowAlts} /> : null}

          <Disclaimer
            text="Stair calculations are for planning purposes only. Always verify compliance with your local building code before construction. Common comfort range: 6½″–8¼″ risers."
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function StairResultView({
  result,
  showAlts,
  setShowAlts,
}: {
  result: StairResult;
  showAlts: boolean;
  setShowAlts: (v: boolean) => void;
}) {
  return (
    <View style={styles.resultSection}>
      <Text style={styles.resultTitle}>Best Result</Text>
      <StairRunCard run={result.best} isMain />
      {result.best.warnings.length > 0 && (
        <View style={styles.warningsBox}>
          {result.best.warnings.map((w, i) => (
            <Text key={i} style={styles.warningText}>⚠ {w}</Text>
          ))}
        </View>
      )}
      <Text style={styles.explanation}>{result.explanation}</Text>

      <TouchableOpacity
        style={styles.altsToggle}
        onPress={() => setShowAlts(!showAlts)}
      >
        <Text style={styles.altsToggleText}>
          {showAlts ? "Hide" : "Show"} Alternatives ({result.alternatives.length})
        </Text>
      </TouchableOpacity>

      {showAlts &&
        result.alternatives.map((alt, i) => (
          <StairRunCard key={i} run={alt} />
        ))}
    </View>
  );
}

function StairRunCard({ run, isMain }: { run: StairRun; isMain?: boolean }) {
  const riserD = decompose(run.riserHeight);
  const riserStr =
    riserD.numerator > 0
      ? `${riserD.inches} ${riserD.numerator}/${riserD.denominator}"`
      : `${riserD.inches}"`;

  return (
    <Card style={isMain ? StyleSheet.flatten([styles.runCard, styles.runCardMain]) : styles.runCard}>
      <View style={styles.runRow}>
        <Stat label="Risers" value={run.riserCount.toString()} />
        <Stat label="Riser Height" value={riserStr} accent={isMain} />
        <Stat label="Treads" value={run.treadCount.toString()} />
      </View>
      <Divider />
      <View style={styles.runRow}>
        <Stat label="Total Run" value={formatLength(run.totalRun, "fraction")} />
        <Stat label="Stringer" value={formatLength(run.stringerLength, "fraction")} />
        <Stat label="Angle" value={`${run.angleDegrees.toFixed(1)}°`} />
      </View>
    </Card>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, accent && styles.statValueAccent]}>{value}</Text>
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
  scroll: { padding: Spacing.base, gap: Spacing.base, paddingBottom: 100 },
  inputCard: { gap: Spacing.md },
  inputLabel: {
    color: Colors.orange,
    fontSize: Typography.xs,
    fontWeight: Typography.heavy,
    letterSpacing: 1,
  },
  inputSub: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
    marginBottom: 4,
    fontWeight: Typography.medium,
  },
  riseRow: { flexDirection: "row", gap: Spacing.md },
  prefRow: { flexDirection: "row", gap: Spacing.md },
  input: {
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    color: Colors.textPrimary,
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    fontVariant: ["tabular-nums"],
  },
  error: {
    color: Colors.error,
    fontSize: Typography.sm,
    textAlign: "center",
    paddingHorizontal: Spacing.base,
  },
  resultSection: { gap: Spacing.md },
  resultTitle: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  runCard: { gap: Spacing.sm },
  runCardMain: {
    borderColor: Colors.orange + "60",
    borderWidth: 2,
  },
  runRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  stat: { alignItems: "center", flex: 1 },
  statLabel: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
    textAlign: "center",
    marginBottom: 2,
  },
  statValue: {
    color: Colors.textPrimary,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    textAlign: "center",
    fontVariant: ["tabular-nums"],
  },
  statValueAccent: { color: Colors.orange },
  warningsBox: {
    backgroundColor: Colors.warningBg,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.warning + "60",
  },
  warningText: {
    color: Colors.warning,
    fontSize: Typography.sm,
    lineHeight: 18,
  },
  explanation: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    lineHeight: 20,
  },
  altsToggle: {
    paddingVertical: Spacing.sm,
    alignItems: "center",
  },
  altsToggleText: {
    color: Colors.orange,
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
  },
  backBtn: {
    alignSelf: "flex-start",
    marginBottom: Spacing.sm,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  backBtnText: {
    fontSize: Typography.xs,
    fontWeight: "600",
    color: Colors.orange,
  },
});
