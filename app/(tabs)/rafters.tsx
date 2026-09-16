/**
 * BuildTape Pro — Rafter Solver Screen
 */

import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Svg, { Path, Text as SvgText } from "react-native-svg";
import { useStore } from "../../src/store";
import { Colors, Typography, Spacing, Radius } from "../../src/lib/theme";
import {
  SectionHeader,
  ProGate,
  PrimaryButton,
  Card,
  Disclaimer,
  LengthDisplayBox,
  AppText,
} from "../../src/components/ui";
import { solveRafter, RafterResult } from "../../src/features/rafters/RafterSolver";
import { fromFeetInchFraction } from "../../src/lib/length";
import { formatLength } from "../../src/lib/formatting";

export default function RaftersScreen() {
  const { isPro, precision } = useStore();

  if (!isPro) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <SectionHeader title="Rafter Solver" subtitle="Pro feature" />
        </View>
        <ProGate isPro={false} featureName="Rafter Solver" />
      </SafeAreaView>
    );
  }

  return <RafterSolverContent precision={precision} />;
}

function RafterSolverContent({ precision }: { precision: 8 | 16 | 32 }) {
  const [runFt, setRunFt] = useState("10");
  const [runIn, setRunIn] = useState("0");
  const [pitch, setPitch] = useState("4");
  const [result, setResult] = useState<RafterResult | null>(null);

  const calculate = () => {
    const rFt = parseInt(runFt || "0", 10);
    const rIn = parseInt(runIn || "0", 10);
    const p = parseFloat(pitch || "0");

    const runLength = fromFeetInchFraction(rFt, rIn, 0, 1, precision);
    const res = solveRafter(runLength, p);
    setResult(res);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <SectionHeader title="Rafter Solver" subtitle="Common & Hip/Valley" />
          </View>

          <Card style={styles.card}>
            <AppText style={styles.cardTitle}>Run (Horizontal Distance)</AppText>
            <View style={styles.inputRow}>
              <View style={styles.inputCol}>
                <AppText style={styles.label}>Feet</AppText>
                <TextInput style={styles.input} value={runFt} onChangeText={setRunFt} keyboardType="number-pad" />
              </View>
              <View style={styles.inputCol}>
                <AppText style={styles.label}>Inches</AppText>
                <TextInput style={styles.input} value={runIn} onChangeText={setRunIn} keyboardType="number-pad" />
              </View>
            </View>

            <AppText style={[styles.cardTitle, { marginTop: Spacing.base }]}>Roof Pitch (x/12)</AppText>
            <View style={styles.inputRow}>
              <View style={styles.inputCol}>
                <AppText style={styles.label}>Pitch (e.g. 4 for 4/12)</AppText>
                <TextInput style={styles.input} value={pitch} onChangeText={setPitch} keyboardType="numeric" />
              </View>
            </View>

            <PrimaryButton title="Calculate Rafters" onPress={calculate} style={{ marginTop: Spacing.lg }} />
          </Card>

          {result && (
            <View style={styles.results}>
              <AppText style={styles.resultsHeader}>Results</AppText>

              {/* Rafter SVG Diagram */}
              <View style={styles.diagramContainer}>
                <Svg height="120" width="100%" viewBox="0 0 200 100">
                  <Path d="M10 90 L190 90 L190 10 Z" fill="none" stroke={Colors.orange} strokeWidth="3" />
                  <Path d="M10 90 L190 10" fill="none" stroke={Colors.success} strokeWidth="4" />
                  <SvgText x="100" y="98" fill={Colors.textSecondary} fontSize="10" textAnchor="middle">RUN</SvgText>
                  <SvgText x="195" y="50" fill={Colors.textSecondary} fontSize="10" textAnchor="start">RISE</SvgText>
                  <SvgText x="85" y="45" fill={Colors.success} fontSize="10" textAnchor="end" transform="rotate(-23.96 100 50)">COMMON</SvgText>
                </Svg>
              </View>
              
              <LengthDisplayBox label="Common Rafter Length" value={formatLength(result.commonLength, "fraction")} />
              <LengthDisplayBox label="Hip / Valley Rafter Length" value={formatLength(result.hipValleyLength, "fraction")} />
              <LengthDisplayBox label="Total Rise" value={formatLength(result.rise, "fraction")} />
              
              <View style={styles.angleRow}>
                <View style={styles.angleBox}>
                  <AppText style={styles.angleVal}>{result.plumbCutAngle.toFixed(1)}°</AppText>
                  <AppText style={styles.angleLabel}>Plumb Cut</AppText>
                </View>
                <View style={styles.angleBox}>
                  <AppText style={styles.angleVal}>{result.levelCutAngle.toFixed(1)}°</AppText>
                  <AppText style={styles.angleLabel}>Level Cut</AppText>
                </View>
              </View>

              <Disclaimer text="Rafter lengths do not include overhang or ridge board deduction. Verify all cuts with a framing square." />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.base, paddingBottom: 100 },
  header: { marginBottom: Spacing.base },
  card: { gap: Spacing.xs },
  cardTitle: { color: Colors.textPrimary, fontSize: Typography.base, fontWeight: Typography.semibold, marginBottom: Spacing.xs },
  inputRow: { flexDirection: "row", gap: Spacing.md },
  inputCol: { flex: 1, gap: 4 },
  label: { color: Colors.textSecondary, fontSize: Typography.sm },
  input: { backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: Spacing.sm, color: Colors.textPrimary, fontSize: Typography.md },
  results: { marginTop: Spacing.xl, gap: Spacing.md },
  resultsHeader: { color: Colors.textPrimary, fontSize: Typography.lg, fontWeight: Typography.bold, marginBottom: Spacing.sm },
  diagramContainer: { backgroundColor: Colors.surface, padding: Spacing.md, borderRadius: Radius.md, alignItems: "center", justifyContent: "center", marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  angleRow: { flexDirection: "row", gap: Spacing.md },
  angleBox: { flex: 1, backgroundColor: Colors.card, padding: Spacing.md, borderRadius: Radius.md, alignItems: "center", borderWidth: 1, borderColor: Colors.border },
  angleVal: { color: Colors.orange, fontSize: Typography.lg, fontWeight: Typography.bold },
  angleLabel: { color: Colors.textSecondary, fontSize: Typography.sm, marginTop: 4 },
});
