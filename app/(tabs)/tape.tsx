/**
 * BuildTape Pro — Tape History Screen
 */

import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  SafeAreaView,
} from "react-native";
import { useStore, FREE_TAPE_LIMIT, Job } from "../../src/store";
import { Colors, Typography, Spacing, Radius, Shadow } from "../../src/lib/theme";
import {
  SectionHeader,
  EmptyState,
  SecondaryButton,
  ProGate,
  Card,
  Divider,
} from "../../src/components/ui";
import {
  clearAllTapeEntries,
  deleteTapeEntry,
  assignTapeEntryToJob,
} from "../../src/lib/sqlite";
import { generateAndSharePDF } from "../../src/lib/pdf";
import { TapeEntry } from "../../src/features/calculator/CalculatorEngine";
import { formatDateTime } from "../../src/lib/formatting";

export default function TapeScreen() {
  const { isPro, tapeEntries, clearTape, removeTapeEntry, jobs, assignEntryToJob } =
    useStore();
  const [assignModalEntry, setAssignModalEntry] = useState<TapeEntry | null>(null);
  const [exporting, setExporting] = useState(false);

  const displayEntries = isPro
    ? tapeEntries
    : tapeEntries.slice(0, FREE_TAPE_LIMIT);

  const handleClear = () => {
    Alert.alert("Clear Tape", "Remove all calculation history?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear All",
        style: "destructive",
        onPress: () => {
          clearTape();
          clearAllTapeEntries();
        },
      },
    ]);
  };

  const handleDelete = (id: string) => {
    removeTapeEntry(id);
    deleteTapeEntry(id);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await generateAndSharePDF(null, tapeEntries, "Tape Export");
    } catch (e: any) {
      Alert.alert("Export Failed", e.message || "Could not generate PDF.");
    } finally {
      setExporting(false);
    }
  };

  const handleAssign = (entry: TapeEntry) => {
    if (jobs.length === 0) {
      Alert.alert("No Jobs", "Create a job first in the Jobs tab.");
      return;
    }
    setAssignModalEntry(entry);
  };

  const confirmAssign = (job: Job) => {
    if (!assignModalEntry) return;
    assignEntryToJob(assignModalEntry.id, job.id);
    assignTapeEntryToJob(assignModalEntry.id, job.id);
    setAssignModalEntry(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <SectionHeader
          title="Tape History"
          subtitle={
            isPro
              ? `${tapeEntries.length} entries`
              : `${displayEntries.length}/${FREE_TAPE_LIMIT} entries (Free)`
          }
          right={
            tapeEntries.length > 0 ? (
              <View style={{ flexDirection: "row", gap: Spacing.sm }}>
                {isPro && (
                  <SecondaryButton
                    title={exporting ? "Exporting…" : "Export PDF"}
                    onPress={handleExport}
                    disabled={exporting}
                    icon="📄"
                  />
                )}
                <SecondaryButton
                  title="Clear"
                  onPress={handleClear}
                  destructive
                  icon="🗑"
                />
              </View>
            ) : undefined
          }
        />
      </View>

      {!isPro && tapeEntries.length >= FREE_TAPE_LIMIT && (
        <View style={styles.limitBanner}>
          <Text style={styles.limitText}>
            📦 Free limit reached · Pro = unlimited history + PDF export
          </Text>
        </View>
      )}

      <FlatList
        data={displayEntries}
        keyExtractor={(e) => e.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="📋"
            title="Tape is Empty"
            body="Use the calculator to add measurements. Every result is automatically saved here."
          />
        }
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        renderItem={({ item }) => (
          <TapeEntryCard
            entry={item}
            job={jobs.find((j) => j.id === item.jobId)}
            onDelete={() => handleDelete(item.id)}
            onAssign={() => handleAssign(item)}
          />
        )}
      />

      {/* Assign to job modal */}
      <Modal
        visible={!!assignModalEntry}
        transparent
        animationType="slide"
        onRequestClose={() => setAssignModalEntry(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Assign to Job</Text>
            <Divider />
            {jobs.map((j) => (
              <TouchableOpacity
                key={j.id}
                style={styles.modalJobRow}
                onPress={() => confirmAssign(j)}
              >
                <Text style={styles.modalJobName}>{j.name}</Text>
                <Text style={styles.modalJobChevron}>›</Text>
              </TouchableOpacity>
            ))}
            <SecondaryButton
              title="Cancel"
              onPress={() => setAssignModalEntry(null)}
              style={{ marginTop: Spacing.base }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function TapeEntryCard({
  entry,
  job,
  onDelete,
  onAssign,
}: {
  entry: TapeEntry;
  job?: Job;
  onDelete: () => void;
  onAssign: () => void;
}) {
  return (
    <Card style={styles.entryCard}>
      <View style={styles.entryHeader}>
        <View style={styles.entryTypePill}>
          <Text style={styles.entryTypeText}>{entry.type.toUpperCase()}</Text>
        </View>
        {job && (
          <View style={styles.entryJobPill}>
            <Text style={styles.entryJobText}>💼 {job.name}</Text>
          </View>
        )}
        <Text style={styles.entryTime}>{formatDateTime(entry.createdAt)}</Text>
      </View>
      <Text style={styles.entryExpr} numberOfLines={2}>
        {entry.expression}
      </Text>
      <Text style={styles.entryResult}>{entry.result}</Text>
      <View style={styles.entryActions}>
        <TouchableOpacity style={styles.entryActionBtn} onPress={onAssign}>
          <Text style={styles.entryActionText}>Assign Job</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.entryActionBtn, styles.entryDeleteBtn]} onPress={onDelete}>
          <Text style={styles.entryDeleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  header: {
    padding: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  limitBanner: {
    backgroundColor: Colors.orangeMuted,
    padding: Spacing.sm + 2,
    paddingHorizontal: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.orange + "40",
  },
  limitText: {
    color: Colors.orangeLight,
    fontSize: Typography.xs,
    fontWeight: Typography.medium,
  },
  list: {
    padding: Spacing.base,
    paddingBottom: 100,
    flexGrow: 1,
  },
  entryCard: { gap: Spacing.sm },
  entryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flexWrap: "wrap",
  },
  entryTypePill: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  entryTypeText: {
    color: Colors.orange,
    fontSize: Typography.xs,
    fontWeight: Typography.heavy,
    letterSpacing: 0.5,
  },
  entryJobPill: {
    backgroundColor: Colors.card,
    borderRadius: Radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  entryJobText: {
    color: Colors.success,
    fontSize: Typography.xs,
    fontWeight: Typography.medium,
  },
  entryTime: {
    flex: 1,
    color: Colors.textMuted,
    fontSize: Typography.xs,
    textAlign: "right",
  },
  entryExpr: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    fontVariant: ["tabular-nums"],
  },
  entryResult: {
    color: Colors.textPrimary,
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    fontVariant: ["tabular-nums"],
  },
  entryActions: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  entryActionBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  entryActionText: {
    color: Colors.textSecondary,
    fontSize: Typography.xs,
  },
  entryDeleteBtn: {
    borderColor: Colors.error + "60",
    backgroundColor: Colors.errorBg,
  },
  entryDeleteText: {
    color: Colors.error,
    fontSize: Typography.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.xl,
    paddingBottom: 48,
    gap: Spacing.sm,
  },
  modalTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    marginBottom: Spacing.sm,
  },
  modalJobRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalJobName: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: Typography.base,
  },
  modalJobChevron: {
    color: Colors.textMuted,
    fontSize: Typography.xl,
  },
});
