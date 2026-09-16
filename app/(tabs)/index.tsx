/**
 * BuildTape Pro — Calculator Screen
 * Primary construction tape calculator with fraction input.
 */

import React, { useReducer, useCallback, useState } from "react";
import * as Haptics from 'expo-haptics';
import { AppText } from '../../src/components/ui';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  Modal,
  TextInput,
  Platform,
} from "react-native";
import {
  calcReducer,
  createInitialState,
  makeTapeEntry,
} from "../../src/features/calculator/CalculatorEngine";
import { fractionsForPrecision } from "../../src/lib/fractions";
import { formatLength } from "../../src/lib/formatting";
import { useStore, FREE_TAPE_LIMIT } from "../../src/store";
import { Colors, Typography, Spacing, Radius, Shadow } from "../../src/lib/theme";
import { insertTapeEntry } from "../../src/lib/sqlite";

export default function CalculatorScreen() {
  const { isPro, precision, displayMode, tapeEntries, addTapeEntry } = useStore();
  const [calc, dispatch] = useReducer(
    calcReducer,
    createInitialState(precision, displayMode),
  );
  const [spacesModalVisible, setSpacesModalVisible] = useState(false);
  const [spacesInput, setSpacesInput] = useState("2");

  const handleEquals = useCallback(() => {
    const newCalc = calcReducer(calc, { type: "EQUALS" });
    dispatch({ type: "EQUALS" });

    if (!newCalc.result || newCalc.error) return;

    const canAdd = isPro || tapeEntries.length < FREE_TAPE_LIMIT;
    if (!canAdd) {
      Alert.alert(
        "Tape Full",
        `Free mode stores up to ${FREE_TAPE_LIMIT} entries. Clear tape or enable Pro for unlimited history.`,
      );
      return;
    }

    const entry = makeTapeEntry(
      newCalc.displayExpression,
      newCalc.result,
      "basic",
    );
    addTapeEntry(entry);
    insertTapeEntry({
      id: entry.id,
      jobId: null,
      expression: entry.expression,
      result: entry.result,
      resultTs: entry.resultTs,
      createdAt: entry.createdAt,
      type: "basic",
    });
  }, [calc, isPro, tapeEntries.length, addTapeEntry]);

  const handleSpacesConfirm = () => {
    const n = parseInt(spacesInput, 10);
    if (n > 0) dispatch({ type: "SPACES", n });
    setSpacesModalVisible(false);
  };

  const fractions = fractionsForPrecision(precision);
  const fracsFiltered = fractions.filter((f) => f.numerator < f.denominator);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Display */}
      <View style={styles.display}>
        <AppText style={styles.displayExpr} numberOfLines={2} adjustsFontSizeToFit>
          {calc.displayExpression}
        </AppText>
        {calc.error ? (
          <AppText style={styles.displayError}>{calc.error}</AppText>
        ) : null}
        {calc.result && !calc.error ? (
          <View style={styles.convertRow}>
            <ConvertPill label={formatLength(calc.result, "decimal_inches")} sub="DEC IN" />
            <ConvertPill label={formatLength(calc.result, "decimal_feet")} sub="DEC FT" />
            <ConvertPill label={formatLength(calc.result, "metric")} sub="METRIC" />
          </View>
        ) : null}

        {/* Tape mini-preview */}
        {tapeEntries.length > 0 && (
          <View style={styles.tapePreview}>
            {tapeEntries.slice(0, 3).map((e) => (
              <AppText key={e.id} style={styles.tapePreviewItem} numberOfLines={1}>
                {e.result}
              </AppText>
            ))}
          </View>
        )}
      </View>

      {/* Memory row */}
      <View style={styles.memoryRow}>
        {(["MC", "MR", "M-", "M+"] as const).map((m) => (
          <TouchableOpacity
            key={m}
            style={styles.memoryBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (m === "MC") dispatch({ type: "MEMORY_CLEAR" });
              if (m === "MR") dispatch({ type: "MEMORY_RECALL" });
              if (m === "M-") dispatch({ type: "MEMORY_SUB" });
              if (m === "M+") dispatch({ type: "MEMORY_ADD" });
            }}
          >
            <AppText style={styles.memoryBtnText}>{m}</AppText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Mode row */}
      <View style={styles.modeRow}>
        {(["feet", "inches"] as const).map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.modeBtn, calc.inputMode === m && styles.modeBtnActive]}
            onPress={() => dispatch({ type: "SET_MODE", mode: m })}
          >
            <AppText style={[styles.modeBtnText, calc.inputMode === m && styles.modeBtnTextActive]}>
              {m === "feet" ? "FT" : "IN"}
            </AppText>
          </TouchableOpacity>
        ))}
        <View style={styles.modeSeparator} />
        <TouchableOpacity style={styles.clearBtn} onPress={() => dispatch({ type: "BACKSPACE" })}>
          <AppText style={styles.clearBtnText}>⌫</AppText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.acBtn} onPress={() => dispatch({ type: "CLEAR" })}>
          <AppText style={styles.acBtnText}>AC</AppText>
        </TouchableOpacity>
      </View>

      {/* Fraction picker */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.fracScroll}
        contentContainerStyle={styles.fracScrollContent}
      >
        {fracsFiltered.map((f) => (
          <TouchableOpacity
            key={f.label}
            style={styles.fracBtn}
            onPress={() => dispatch({ type: "FRACTION", numerator: f.numerator, denominator: f.denominator })}
          >
            <AppText style={styles.fracBtnText}>{f.label}</AppText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Main keypad */}
      <View style={styles.keypad}>
        <View style={styles.keyRow}>
          <CalcKey label="7" onPress={() => dispatch({ type: "DIGIT", digit: "7" })} />
          <CalcKey label="8" onPress={() => dispatch({ type: "DIGIT", digit: "8" })} />
          <CalcKey label="9" onPress={() => dispatch({ type: "DIGIT", digit: "9" })} />
          <CalcKey label="÷" onPress={() => dispatch({ type: "OPERATOR", op: "÷" })} variant="op" active={calc.operator === "÷"} />
        </View>
        <View style={styles.keyRow}>
          <CalcKey label="4" onPress={() => dispatch({ type: "DIGIT", digit: "4" })} />
          <CalcKey label="5" onPress={() => dispatch({ type: "DIGIT", digit: "5" })} />
          <CalcKey label="6" onPress={() => dispatch({ type: "DIGIT", digit: "6" })} />
          <CalcKey label="×" onPress={() => dispatch({ type: "OPERATOR", op: "×" })} variant="op" active={calc.operator === "×"} />
        </View>
        <View style={styles.keyRow}>
          <CalcKey label="1" onPress={() => dispatch({ type: "DIGIT", digit: "1" })} />
          <CalcKey label="2" onPress={() => dispatch({ type: "DIGIT", digit: "2" })} />
          <CalcKey label="3" onPress={() => dispatch({ type: "DIGIT", digit: "3" })} />
          <CalcKey label="−" onPress={() => dispatch({ type: "OPERATOR", op: "-" })} variant="op" active={calc.operator === "-"} />
        </View>
        <View style={styles.keyRow}>
          <CalcKey label="0" onPress={() => dispatch({ type: "DIGIT", digit: "0" })} flex={2} />
          <CalcKey label="CTR" onPress={() => dispatch({ type: "CENTER" })} variant="special" />
          <CalcKey label="+" onPress={() => dispatch({ type: "OPERATOR", op: "+" })} variant="op" active={calc.operator === "+"} />
        </View>
        <View style={styles.keyRow}>
          <CalcKey
            label="SPACES"
            onPress={() => { setSpacesInput("2"); setSpacesModalVisible(true); }}
            flex={2}
            variant="special"
          />
          <CalcKey label="=" onPress={handleEquals} flex={2} variant="equals" />
        </View>
      </View>

      {/* SPACES modal — cross-platform (no Alert.prompt) */}
      <Modal
        visible={spacesModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSpacesModalVisible(false)}
      >
        <View style={styles.spacesOverlay}>
          <View style={styles.spacesModal}>
            <AppText style={styles.spacesTitle}>Equal Spacing</AppText>
            <AppText style={styles.spacesSubtitle}>How many equal spaces?</AppText>
            <TextInput
              style={styles.spacesInput}
              value={spacesInput}
              onChangeText={setSpacesInput}
              keyboardType="number-pad"
              autoFocus
              selectTextOnFocus
              placeholder="2"
              placeholderTextColor={Colors.textMuted}
            />
            <View style={styles.spacesButtons}>
              <TouchableOpacity
                style={styles.spacesCancelBtn}
                onPress={() => setSpacesModalVisible(false)}
              >
                <AppText style={styles.spacesCancelText}>Cancel</AppText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.spacesConfirmBtn} onPress={handleSpacesConfirm}>
                <AppText style={styles.spacesConfirmText}>Apply</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ConvertPill({ label, sub }: { label: string; sub: string }) {
  return (
    <View style={styles.convertPill}>
      <AppText style={styles.convertPillSub}>{sub}</AppText>
      <AppText style={styles.convertPillLabel}>{label}</AppText>
    </View>
  );
}

function CalcKey({
  label,
  onPress,
  variant = "default",
  active = false,
  flex = 1,
}: {
  label: string;
  onPress: () => void;
  variant?: "default" | "op" | "special" | "equals";
  active?: boolean;
  flex?: number;
}) {
  const bgColor =
    variant === "equals"
      ? Colors.orange
      : variant === "op"
      ? active ? Colors.orange : Colors.keyOperator
      : variant === "special"
      ? Colors.keySpecial
      : Colors.keyDefault;

  const textColor: string =
    variant === "equals" || (variant === "op" && active)
      ? Colors.textOnOrange
      : variant === "op"
      ? Colors.orangeLight
      : variant === "special"
      ? Colors.success
      : Colors.textPrimary;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity
      style={[styles.key, { flex, backgroundColor: bgColor }]}
      onPress={handlePress}
      activeOpacity={0.75}
    >
      <AppText style={[styles.keyText, { color: textColor }]}>{label}</AppText>
    </TouchableOpacity>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  display: {
    backgroundColor: Colors.surface,
    padding: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    minHeight: 120,
  },
  displayExpr: {
    color: Colors.textPrimary,
    fontSize: Typography.xxl,
    fontWeight: Typography.heavy,
    textAlign: "right",
    letterSpacing: -0.5,
  },
  displayError: {
    color: Colors.error,
    fontSize: Typography.sm,
    textAlign: "right",
    marginTop: 4,
  },
  convertRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    justifyContent: "flex-end",
  },
  convertPill: {
    backgroundColor: Colors.card,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    alignItems: "center",
  },
  convertPillSub: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: Typography.bold,
    letterSpacing: 0.5,
  },
  convertPillLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.xs,
  },
  tapePreview: {
    marginTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
    gap: 2,
  },
  tapePreviewItem: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
    textAlign: "right",
  },
  memoryRow: {
    flexDirection: "row",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    gap: Spacing.sm,
    backgroundColor: Colors.bg,
  },
  memoryBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    backgroundColor: Colors.card,
    alignItems: "center",
  },
  memoryBtnText: {
    color: Colors.textSecondary,
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
  },
  modeRow: {
    flexDirection: "row",
    padding: Spacing.sm,
    gap: Spacing.sm,
    alignItems: "center",
    backgroundColor: Colors.bg,
  },
  modeBtn: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 52,
    alignItems: "center",
  },
  modeBtnActive: { backgroundColor: Colors.orangeMuted, borderColor: Colors.orange },
  modeBtnText: { color: Colors.textSecondary, fontSize: Typography.sm, fontWeight: Typography.bold, letterSpacing: 0.5 },
  modeBtnTextActive: { color: Colors.orange },
  modeSeparator: { flex: 1 },
  clearBtn: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    minWidth: 52,
    alignItems: "center",
  },
  clearBtnText: { color: Colors.textSecondary, fontSize: Typography.md },
  acBtn: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.errorBg,
    borderWidth: 1,
    borderColor: Colors.error + "60",
    minWidth: 52,
    alignItems: "center",
  },
  acBtnText: { color: Colors.error, fontSize: Typography.sm, fontWeight: Typography.bold, letterSpacing: 0.5 },
  fracScroll: {
    maxHeight: 44,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  fracScrollContent: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    gap: 6,
    flexDirection: "row",
  },
  fracBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  fracBtnText: { color: Colors.textSecondary, fontSize: Typography.xs, fontWeight: Typography.semibold },
  keypad: { flex: 1, padding: Spacing.sm, gap: 8 },
  keyRow: { flex: 1, flexDirection: "row", gap: 8 },
  key: {
    flex: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    ...Shadow.key,
  },
  keyText: { fontSize: Typography.xl, fontWeight: Typography.bold },
  // SPACES modal
  spacesOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  spacesModal: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    width: 280,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  spacesTitle: { color: Colors.textPrimary, fontSize: Typography.lg, fontWeight: Typography.bold, textAlign: "center" },
  spacesSubtitle: { color: Colors.textSecondary, fontSize: Typography.sm, textAlign: "center" },
  spacesInput: {
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.orange,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    color: Colors.textPrimary,
    fontSize: Typography.xxl,
    fontWeight: Typography.bold,
    textAlign: "center",
  },
  spacesButtons: { flexDirection: "row", gap: Spacing.md },
  spacesCancelBtn: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  spacesCancelText: { color: Colors.textSecondary, fontSize: Typography.base },
  spacesConfirmBtn: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.md,
    backgroundColor: Colors.orange,
    alignItems: "center",
  },
  spacesConfirmText: { color: Colors.textOnOrange, fontSize: Typography.base, fontWeight: Typography.bold },
});
