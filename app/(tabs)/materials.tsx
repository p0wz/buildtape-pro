/**
 * BuildTape Pro — Material Estimators Screen
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
import { Colors, Typography, Spacing, Radius } from "../../src/lib/theme";
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
  calcBoardFeet,
  calcStudCount,
  calcDrywallSheets,
  calcConcreteVolume,
  calcArea,
} from "../../src/features/materials/MaterialEstimators";

type Tab = "board" | "stud" | "drywall" | "concrete" | "area";

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: "board", icon: "🪵", label: "Board Feet" },
  { id: "stud", icon: "🏗", label: "Studs" },
  { id: "drywall", icon: "🧱", label: "Drywall" },
  { id: "concrete", icon: "🪣", label: "Concrete" },
  { id: "area", icon: "📐", label: "Area" },
];

export default function MaterialsScreen() {
  const router = useRouter();
  const { isPro } = useStore();
  const [activeTab, setActiveTab] = useState<Tab>("board");

  if (!isPro) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.push("/(tabs)/tools")}
            activeOpacity={0.7}
          >
            <Text style={styles.backBtnText}>← Solvers Hub</Text>
          </TouchableOpacity>
          <SectionHeader title="Material Estimators" subtitle="Pro feature" />
        </View>
        <ProGate isPro={false} featureName="Material Estimators" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.push("/(tabs)/tools")}
          activeOpacity={0.7}
        >
          <Text style={styles.backBtnText}>← Solvers Hub</Text>
        </TouchableOpacity>
        <SectionHeader title="Material Estimators" />
      </View>

      {/* Tab strip */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabStrip}
        contentContainerStyle={styles.tabStripContent}
      >
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.id}
            style={[styles.tab, activeTab === t.id && styles.tabActive]}
            onPress={() => setActiveTab(t.id)}
          >
            <Text style={styles.tabIcon}>{t.icon}</Text>
            <Text
              style={[styles.tabLabel, activeTab === t.id && styles.tabLabelActive]}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          {activeTab === "board" && <BoardFeetCalc />}
          {activeTab === "stud" && <StudCalc />}
          {activeTab === "drywall" && <DrywallCalc />}
          {activeTab === "concrete" && <ConcreteCalc />}
          {activeTab === "area" && <AreaCalc />}
          <Disclaimer text="These estimates are for material planning only. Add waste allowance based on job-site conditions. Verify quantities before ordering." />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Board Feet ───────────────────────────────────────────────────────────────

function BoardFeetCalc() {
  const [thickness, setThickness] = useState("1");
  const [width, setWidth] = useState("6");
  const [length, setLength] = useState("8");
  const [qty, setQty] = useState("1");
  const [result, setResult] = useState<{ boardFeetPerPiece: number; totalBoardFeet: number } | null>(null);

  const calc = () => {
    setResult(
      calcBoardFeet({
        thicknessInches: parseFloat(thickness) || 0,
        widthInches: parseFloat(width) || 0,
        lengthFeet: parseFloat(length) || 0,
        quantity: parseInt(qty) || 1,
      }),
    );
  };

  return (
    <View style={styles.calcSection}>
      <Text style={styles.calcTitle}>🪵 Board Feet</Text>
      <Text style={styles.calcFormula}>BF = Thickness × Width × Length ÷ 12</Text>
      <Card style={styles.inputCard}>
        <InputRow label="Thickness (in)" value={thickness} onChange={setThickness} placeholder="1" />
        <InputRow label="Width (in)" value={width} onChange={setWidth} placeholder="6" />
        <InputRow label="Length (ft)" value={length} onChange={setLength} placeholder="8" />
        <InputRow label="Quantity" value={qty} onChange={setQty} placeholder="1" />
      </Card>
      <PrimaryButton title="Calculate" onPress={calc} />
      {result && (
        <Card style={styles.resultCard}>
          <LengthDisplayBox label="Per Piece" value={`${result.boardFeetPerPiece.toFixed(3)} BF`} />
          <LengthDisplayBox label="Total (all pieces)" value={`${result.totalBoardFeet.toFixed(3)} BF`} />
        </Card>
      )}
    </View>
  );
}

// ─── Stud Count ───────────────────────────────────────────────────────────────

function StudCalc() {
  const [wallFt, setWallFt] = useState("16");
  const [spacing, setSpacing] = useState<12 | 16 | 24>(16);
  const [includeEnds, setIncludeEnds] = useState(true);
  const [result, setResult] = useState<number | null>(null);

  const calc = () => {
    const r = calcStudCount({
      wallLengthInches: (parseFloat(wallFt) || 0) * 12,
      spacingInches: spacing,
      includeEndStuds: includeEnds,
    });
    setResult(r.studCount);
  };

  return (
    <View style={styles.calcSection}>
      <Text style={styles.calcTitle}>🏗 Stud Count</Text>
      <Card style={styles.inputCard}>
        <InputRow label="Wall Length (ft)" value={wallFt} onChange={setWallFt} placeholder="16" />
        <Text style={styles.inputSub}>Spacing (OC)</Text>
        <View style={styles.segRow}>
          {([12, 16, 24] as const).map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.seg, spacing === s && styles.segActive]}
              onPress={() => setSpacing(s)}
            >
              <Text style={[styles.segText, spacing === s && styles.segTextActive]}>
                {s}"
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={styles.toggleRow}
          onPress={() => setIncludeEnds((v) => !v)}
        >
          <View style={[styles.toggle, includeEnds && styles.toggleOn]} />
          <Text style={styles.toggleLabel}>Include end studs</Text>
        </TouchableOpacity>
      </Card>
      <PrimaryButton title="Calculate" onPress={calc} />
      {result !== null && (
        <Card style={styles.resultCard}>
          <LengthDisplayBox label="Estimated Studs" value={`${result} studs`} />
        </Card>
      )}
    </View>
  );
}

// ─── Drywall ──────────────────────────────────────────────────────────────────

function DrywallCalc() {
  const [wallW, setWallW] = useState("10");
  const [wallH, setWallH] = useState("9");
  const [sheetH, setSheetH] = useState<96 | 120 | 144>(96);
  const [waste, setWaste] = useState("10");
  const [result, setResult] = useState<{ sheetsRequired: number; netAreaSqFt: number } | null>(null);

  const calc = () => {
    setResult(
      calcDrywallSheets({
        wallWidthInches: (parseFloat(wallW) || 0) * 12,
        wallHeightInches: (parseFloat(wallH) || 0) * 12,
        sheetWidthInches: 48,
        sheetHeightInches: sheetH,
        wastePercent: parseFloat(waste) || 0,
      }),
    );
  };

  const sheetLabel = (h: number) => `4×${h / 12}'`;

  return (
    <View style={styles.calcSection}>
      <Text style={styles.calcTitle}>🧱 Drywall Sheets</Text>
      <Card style={styles.inputCard}>
        <InputRow label="Wall Width (ft)" value={wallW} onChange={setWallW} placeholder="10" />
        <InputRow label="Wall Height (ft)" value={wallH} onChange={setWallH} placeholder="9" />
        <Text style={styles.inputSub}>Sheet Size</Text>
        <View style={styles.segRow}>
          {([96, 120, 144] as const).map((h) => (
            <TouchableOpacity
              key={h}
              style={[styles.seg, sheetH === h && styles.segActive]}
              onPress={() => setSheetH(h)}
            >
              <Text style={[styles.segText, sheetH === h && styles.segTextActive]}>
                {sheetLabel(h)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <InputRow label="Waste %" value={waste} onChange={setWaste} placeholder="10" />
      </Card>
      <PrimaryButton title="Calculate" onPress={calc} />
      {result && (
        <Card style={styles.resultCard}>
          <LengthDisplayBox label="Sheets Required" value={`${result.sheetsRequired} sheets`} />
          <LengthDisplayBox label="Net Area" value={`${result.netAreaSqFt.toFixed(1)} sq ft`} muted />
        </Card>
      )}
    </View>
  );
}

// ─── Concrete ─────────────────────────────────────────────────────────────────

function ConcreteCalc() {
  const [lenFt, setLenFt] = useState("10");
  const [widFt, setWidFt] = useState("10");
  const [depIn, setDepIn] = useState("4");
  const [result, setResult] = useState<{
    cubicFeet: number;
    cubicYards: number;
    bags60lb: number;
    bags80lb: number;
  } | null>(null);

  const calc = () => {
    setResult(
      calcConcreteVolume({
        lengthFeet: parseFloat(lenFt) || 0,
        widthFeet: parseFloat(widFt) || 0,
        depthInches: parseFloat(depIn) || 0,
      }),
    );
  };

  return (
    <View style={styles.calcSection}>
      <Text style={styles.calcTitle}>🪣 Concrete Volume</Text>
      <Card style={styles.inputCard}>
        <InputRow label="Length (ft)" value={lenFt} onChange={setLenFt} placeholder="10" />
        <InputRow label="Width (ft)" value={widFt} onChange={setWidFt} placeholder="10" />
        <InputRow label="Depth (in)" value={depIn} onChange={setDepIn} placeholder="4" />
      </Card>
      <PrimaryButton title="Calculate" onPress={calc} />
      {result && (
        <Card style={styles.resultCard}>
          <LengthDisplayBox label="Cubic Feet" value={`${result.cubicFeet.toFixed(2)} cu ft`} />
          <LengthDisplayBox label="Cubic Yards" value={`${result.cubicYards.toFixed(2)} cu yd`} />
          <LengthDisplayBox label="60 lb Bags" value={`${result.bags60lb} bags`} />
          <LengthDisplayBox label="80 lb Bags" value={`${result.bags80lb} bags`} muted />
        </Card>
      )}
    </View>
  );
}

// ─── Area ─────────────────────────────────────────────────────────────────────

function AreaCalc() {
  const [lenFt, setLenFt] = useState("10");
  const [widFt, setWidFt] = useState("10");
  const [result, setResult] = useState<{
    squareFeet: number;
    squareYards: number;
    squareMeters: number;
  } | null>(null);

  const calc = () => {
    setResult(
      calcArea({
        lengthFeet: parseFloat(lenFt) || 0,
        widthFeet: parseFloat(widFt) || 0,
      }),
    );
  };

  return (
    <View style={styles.calcSection}>
      <Text style={styles.calcTitle}>📐 Area Calculator</Text>
      <Card style={styles.inputCard}>
        <InputRow label="Length (ft)" value={lenFt} onChange={setLenFt} placeholder="10" />
        <InputRow label="Width (ft)" value={widFt} onChange={setWidFt} placeholder="10" />
      </Card>
      <PrimaryButton title="Calculate" onPress={calc} />
      {result && (
        <Card style={styles.resultCard}>
          <LengthDisplayBox label="Square Feet" value={`${result.squareFeet.toFixed(2)} sq ft`} />
          <LengthDisplayBox label="Square Yards" value={`${result.squareYards.toFixed(2)} sq yd`} muted />
          <LengthDisplayBox label="Square Meters" value={`${result.squareMeters.toFixed(2)} m²`} muted />
        </Card>
      )}
    </View>
  );
}

// ─── Shared input row ─────────────────────────────────────────────────────────

function InputRow({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <View style={styles.inputRow}>
      <Text style={styles.inputSub}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        keyboardType="decimal-pad"
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  header: {
    padding: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabStrip: {
    maxHeight: 56,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  tabStripContent: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabActive: {
    backgroundColor: Colors.orangeMuted,
    borderColor: Colors.orange,
  },
  tabIcon: { fontSize: 15 },
  tabLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
  },
  tabLabelActive: {
    color: Colors.orange,
    fontWeight: Typography.bold,
  },
  scroll: { padding: Spacing.base, gap: Spacing.base, paddingBottom: 100 },
  calcSection: { gap: Spacing.md },
  calcTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
  },
  calcFormula: {
    color: Colors.textMuted,
    fontSize: Typography.sm,
    fontFamily: "monospace",
  },
  inputCard: { gap: Spacing.md },
  inputRow: { gap: 4 },
  inputSub: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
    fontWeight: Typography.medium,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
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
  segRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  seg: {
    flex: 1,
    paddingVertical: Spacing.sm,
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
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: 4,
  },
  toggle: {
    width: 36,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.border,
  },
  toggleOn: { backgroundColor: Colors.orange },
  toggleLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
  },
  resultCard: { gap: Spacing.sm },
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
