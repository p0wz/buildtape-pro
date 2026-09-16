/**
 * BuildTape Pro — Saved Jobs Screen
 */

import React, { useState } from "react";
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Modal,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform, ScrollView,
} from "react-native";
import { useStore, FREE_JOB_LIMIT, Job } from "../../src/store";
import { Colors, Typography, Spacing, Radius, Shadow } from "../../src/lib/theme";
import {
  SectionHeader,
  EmptyState,
  PrimaryButton,
  SecondaryButton,
  Card,
  Divider,
} from "../../src/components/ui";
import { insertJob, updateJob, deleteJob } from "../../src/lib/sqlite";
import { generateAndSharePDF } from "../../src/lib/pdf";
import { formatDate } from "../../src/lib/formatting";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function JobsScreen() {
  const { isPro, jobs, addJob, updateJob: updateJobStore, removeJob, tapeEntries } =
    useStore();
  const [showNew, setShowNew] = useState(false);
  const [editJob, setEditJob] = useState<Job | null>(null);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [exporting, setExporting] = useState<string | null>(null);

  const canAddJob = isPro || jobs.length < FREE_JOB_LIMIT;

  const openNew = () => {
    if (!canAddJob) {
      Alert.alert(
        "Job Limit Reached",
        `Free mode allows up to ${FREE_JOB_LIMIT} saved jobs. Enable Pro in Settings for unlimited jobs.`,
      );
      return;
    }
    setName("");
    setNotes("");
    setPhotos([]);
    setShowNew(true);
  };

  const openEdit = (job: Job) => {
    setEditJob(job);
    setName(job.name);
    setNotes(job.notes);
    setPhotos(job.photos || []);
  };

  const saveNew = () => {
    if (!name.trim()) {
      Alert.alert("Name Required", "Enter a job name.");
      return;
    }
    const now = new Date().toISOString();
    const job: Job = {
      id: generateId(),
      name: name.trim(),
      notes: notes.trim(),
      photos: photos,
      createdAt: now,
      updatedAt: now,
    };
    addJob(job);
    try {
      insertJob({
        ...job,
        photos: JSON.stringify(job.photos),
      });
    } catch (e) {
      console.warn("DB insert job failed:", e);
    }
    setShowNew(false);
  };

  const saveEdit = () => {
    if (!editJob || !name.trim()) return;
    updateJobStore(editJob.id, name.trim(), notes.trim(), photos);
    try {
      updateJob(editJob.id, name.trim(), notes.trim(), JSON.stringify(photos));
    } catch (e) {
      console.warn("DB update job failed:", e);
    }
    setEditJob(null);
  };

  const confirmDelete = (job: Job) => {
    Alert.alert(`Delete "${job.name}"?`, "This will not delete tape entries assigned to this job.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          removeJob(job.id);
          try {
            deleteJob(job.id);
          } catch (e) {
            console.warn("DB delete job failed:", e);
          }
        },
      },
    ]);
  };

  const handleExport = async (job: Job) => {
    if (!isPro) {
      Alert.alert("Pro Feature", "PDF export is available in Pro mode.");
      return;
    }
    setExporting(job.id);
    const jobEntries = tapeEntries.filter((e) => e.jobId === job.id);
    try {
      await generateAndSharePDF(job, jobEntries);
    } catch (e: any) {
      Alert.alert("Export Failed", e.message || "Could not generate PDF.");
    } finally {
      setExporting(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <SectionHeader
          title="Saved Jobs"
          subtitle={
            isPro
              ? `${jobs.length} jobs`
              : `${jobs.length}/${FREE_JOB_LIMIT} jobs (Free)`
          }
          right={
            <TouchableOpacity style={styles.addBtn} onPress={openNew}>
              <Text style={styles.addBtnText}>+ New Job</Text>
            </TouchableOpacity>
          }
        />
      </View>

      {!isPro && jobs.length >= FREE_JOB_LIMIT && (
        <View style={styles.limitBanner}>
          <Text style={styles.limitText}>
            📦 Free limit: {FREE_JOB_LIMIT} jobs · Pro = unlimited + PDF export
          </Text>
        </View>
      )}

      <FlatList
        data={jobs}
        keyExtractor={(j) => j.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="💼"
            title="No Jobs Yet"
            body={"Create a job to organize your tape entries.\nAssign calculations to jobs from the Tape tab."}
            action={
              <PrimaryButton
                title="Create First Job"
                onPress={openNew}
                icon="+"
                style={{ marginTop: Spacing.md }}
              />
            }
          />
        }
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        renderItem={({ item }) => {
          const entryCount = tapeEntries.filter((e) => e.jobId === item.id).length;
          return (
            <JobCard
              job={item}
              entryCount={entryCount}
              exporting={exporting === item.id}
              isPro={isPro}
              onEdit={() => openEdit(item)}
              onDelete={() => confirmDelete(item)}
              onExport={() => handleExport(item)}
            />
          );
        }}
      />

      {/* New job modal */}
      <JobModal
        visible={showNew}
        title="New Job"
        name={name}
        notes={notes}
        photos={photos}
        onChangeName={setName}
        onChangeNotes={setNotes}
        onChangePhotos={setPhotos}
        onSave={saveNew}
        onCancel={() => setShowNew(false)}
      />

      {/* Edit job modal */}
      <JobModal
        visible={!!editJob}
        title="Edit Job"
        name={name}
        notes={notes}
        photos={photos}
        onChangeName={setName}
        onChangeNotes={setNotes}
        onChangePhotos={setPhotos}
        onSave={saveEdit}
        onCancel={() => setEditJob(null)}
      />
    </SafeAreaView>
  );
}

function JobCard({
  job,
  entryCount,
  exporting,
  isPro,
  onEdit,
  onDelete,
  onExport,
}: {
  job: Job;
  entryCount: number;
  exporting: boolean;
  isPro: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onExport: () => void;
}) {
  return (
    <Card style={styles.jobCard}>
      <View style={styles.jobTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.jobName}>{job.name}</Text>
          {job.notes ? (
            <Text style={styles.jobNotes} numberOfLines={2}>{job.notes}</Text>
          ) : null}
        </View>
        <View style={styles.jobBadge}>
          <Text style={styles.jobBadgeText}>{entryCount}</Text>
          <Text style={styles.jobBadgeSub}>calcs</Text>
        </View>
      </View>
      <View style={styles.jobMeta}>
        <Text style={styles.jobDate}>Created {formatDate(job.createdAt)}</Text>
        <Text style={styles.jobDate}>Updated {formatDate(job.updatedAt)}</Text>
      </View>
      <Divider />
      <View style={styles.jobActions}>
        <TouchableOpacity style={styles.jobActionBtn} onPress={onEdit}>
          <Text style={styles.jobActionText}>✏️ Edit</Text>
        </TouchableOpacity>
        {isPro && (
          <TouchableOpacity
            style={styles.jobActionBtn}
            onPress={onExport}
            disabled={exporting}
          >
            <Text style={styles.jobActionText}>
              {exporting ? "Exporting…" : "📄 PDF"}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.jobActionBtn, styles.jobDeleteBtn]}
          onPress={onDelete}
        >
          <Text style={styles.jobDeleteText}>🗑 Delete</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

function JobModal({
  visible,
  title,
  name,
  notes,
  photos,
  onChangeName,
  onChangeNotes,
  onChangePhotos,
  onSave,
  onCancel,
}: {
  visible: boolean;
  title: string;
  name: string;
  notes: string;
  photos: string[];
  onChangeName: (v: string) => void;
  onChangeNotes: (v: string) => void;
  onChangePhotos: (v: string[]) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0].uri) {
        onChangePhotos([...photos, result.assets[0].uri]);
      }
    } catch (e) {
      Alert.alert("Error", "Could not pick image");
    }
  };

  const removePhoto = (index: number) => {
    onChangePhotos(photos.filter((_, i) => i !== index));
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{title}</Text>
            <Divider />
            <Text style={styles.fieldLabel}>Job Name *</Text>
            <TextInput
              style={styles.fieldInput}
              value={name}
              onChangeText={onChangeName}
              placeholder="e.g. Smith Deck Framing"
              placeholderTextColor={Colors.textMuted}
              autoFocus
              returnKeyType="next"
            />
            <Text style={styles.fieldLabel}>Notes (optional)</Text>
            <TextInput
              style={[styles.fieldInput, styles.fieldTextArea]}
              value={notes}
              onChangeText={onChangeNotes}
              placeholder="Site address, scope notes…"
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={3}
            />

            <View style={styles.photosSection}>
              <Text style={styles.fieldLabel}>Photos ({photos.length})</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photosScroll}>
                {photos.map((uri, i) => (
                  <View key={i} style={styles.photoWrapper}>
                    <Image source={{ uri }} style={styles.photoImg} />
                    <TouchableOpacity style={styles.photoRemove} onPress={() => removePhoto(i)}>
                      <Text style={styles.photoRemoveText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity style={styles.addPhotoBtn} onPress={pickImage}>
                  <Text style={styles.addPhotoText}>+</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

            <View style={styles.modalActions}>
              <SecondaryButton title="Cancel" onPress={onCancel} style={{ flex: 1 }} />
              <PrimaryButton title="Save" onPress={onSave} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  header: {
    padding: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  addBtn: {
    backgroundColor: Colors.orange,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  addBtnText: {
    color: Colors.textOnOrange,
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
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
  jobCard: { gap: Spacing.sm },
  jobTop: { flexDirection: "row", gap: Spacing.md, alignItems: "flex-start" },
  jobName: {
    color: Colors.textPrimary,
    fontSize: Typography.md,
    fontWeight: Typography.bold,
  },
  jobNotes: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    marginTop: 2,
    lineHeight: 18,
  },
  jobBadge: {
    backgroundColor: Colors.orangeMuted,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.orange + "50",
  },
  jobBadgeText: {
    color: Colors.orange,
    fontSize: Typography.lg,
    fontWeight: Typography.heavy,
  },
  jobBadgeSub: {
    color: Colors.orange,
    fontSize: 9,
    fontWeight: Typography.medium,
  },
  jobMeta: { flexDirection: "row", gap: Spacing.base },
  jobDate: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
  },
  jobActions: {
    flexDirection: "row",
    gap: Spacing.sm,
    flexWrap: "wrap",
  },
  jobActionBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  jobActionText: {
    color: Colors.textSecondary,
    fontSize: Typography.xs,
  },
  jobDeleteBtn: {
    borderColor: Colors.error + "50",
    backgroundColor: Colors.errorBg,
  },
  jobDeleteText: {
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
    gap: Spacing.md,
  },
  modalTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
  },
  fieldLabel: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  fieldInput: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    color: Colors.textPrimary,
    fontSize: Typography.base,
  },
  fieldTextArea: {
    minHeight: 80,
    textAlignVertical: "top",
    paddingTop: Spacing.sm + 2,
  },
  modalActions: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  photosSection: {
    marginTop: Spacing.sm,
  },
  photosScroll: {
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  photoWrapper: {
    position: "relative",
  },
  photoImg: {
    width: 80,
    height: 80,
    borderRadius: Radius.md,
  },
  photoRemove: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: Colors.errorBg,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  photoRemoveText: {
    color: Colors.error,
    fontSize: Typography.xs,
    fontWeight: "bold",
  },
  addPhotoBtn: {
    width: 80,
    height: 80,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  addPhotoText: {
    color: Colors.textSecondary,
    fontSize: Typography.xl,
  },
});
