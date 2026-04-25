import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { NuraLogo } from '../../src/components/NuraLogo';
import { SwipeSlider } from '../../src/components/SwipeSlider';
import { PatientStopCard } from '../../src/components/PatientStopCard';
import { buildRunsheetForToday, RunsheetState } from '../../src/lib/runsheetModel';
import { insertRunsheetEvent, RUNSHEET_EVENT_TYPES, DROP_OFF_LOCATION, DROP_OFF_ADDRESS } from '../../src/lib/supabase';
import { PatientStop } from '../../src/types';

const PRINTABLES_PICKUP_ADDRESS = 'Sullivan Nicolaides, 24 Bowen Bridge Rd, Bowen Hills QLD 4006';

const CHECKLIST_ITEMS = [
  { id: 'badge', label: 'ID badge worn' },
  { id: 'coolbag', label: 'Cool bag & ice packs ready' },
  { id: 'ppe', label: 'PPE stocked (gloves, masks)' },
  { id: 'sharps', label: 'Sharps container in kit' },
  { id: 'phone', label: 'Mobile phone charged' },
  { id: 'bags', label: 'Specimen bags packed' },
];

export default function RunsheetScreen() {
  const insets = useSafeAreaInsets();
  const [runsheet, setRunsheet] = useState<RunsheetState | null>(null);
  const [patientStops, setPatientStops] = useState<PatientStop[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Local-only UI state
  const [printablesRequired, setPrintablesRequired] = useState(false);
  const [printablesSkipped, setPrintablesSkipped] = useState(false);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [checklistSkipped, setChecklistSkipped] = useState(false);

  const loadRunsheet = useCallback(async () => {
    const data = await buildRunsheetForToday();
    setRunsheet(data);
    setPatientStops(data.patientStops);
  }, []);

  // Load on first focus
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadRunsheet().finally(() => setLoading(false));
    }, [loadRunsheet])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRunsheet();
    setRefreshing(false);
  }, [loadRunsheet]);

  const fireEvent = async (eventType: string, stopId?: string | null) => {
    await insertRunsheetEvent(eventType, stopId ?? null);
    await loadRunsheet();
  };

  const handleShiftStart = () => fireEvent(RUNSHEET_EVENT_TYPES.SHIFT_START);
  const handlePrintablesCollected = () => fireEvent(RUNSHEET_EVENT_TYPES.PRINTABLES_COLLECTED);
  const handleChecklistComplete = () => fireEvent(RUNSHEET_EVENT_TYPES.CHECKLIST_COMPLETE);
  const handleDropOff = () => fireEvent(RUNSHEET_EVENT_TYPES.SPECIMENS_DROPPED_OFF);

  const handlePatientArrive = (stopId: string) =>
    fireEvent(RUNSHEET_EVENT_TYPES.ARRIVED_AT_STOP, stopId);

  const handlePatientComplete = (stopId: string) =>
    fireEvent(RUNSHEET_EVENT_TYPES.COLLECTION_COMPLETE, stopId);

  const handleNotesChange = (stopId: string, notes: string) => {
    setPatientStops((stops) =>
      stops.map((stop) => (stop.id === stopId ? { ...stop, notes } : stop))
    );
  };

  const openMaps = (address: string) => {
    const url = `https://maps.google.com/?q=${encodeURIComponent(address)}`;
    Linking.openURL(url);
  };

  const allChecklistCompleted = CHECKLIST_ITEMS.every((item) => checklist[item.id]);

  // Step gating
  const printablesDone =
    !!runsheet?.printablesCollected || printablesSkipped || !printablesRequired;
  const checklistDone = !!runsheet?.checklistCompleted || checklistSkipped;

  const completedStops = patientStops.filter((stop) => stop.completedAt).length;
  const totalEarnings = 48 + completedStops * 12;

  // Run is complete when shift started, all stops done, and specimens dropped off
  const isRunComplete =
    !!runsheet?.shiftStarted &&
    !!runsheet?.specimensDroppedOff &&
    patientStops.length > 0 &&
    patientStops.every((s) => !!s.completedAt);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  // ── Run Complete view ─────────────────────────────────────────────────
  if (isRunComplete && runsheet) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <NuraLogo size={36} />
          <View style={styles.headerRight}>
            <Text style={styles.dateText}>{runsheet.date}</Text>
          </View>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.accent}
            />
          }
        >
          {/* Complete card */}
          <View style={completeStyles.card}>
            <View style={completeStyles.iconRow}>
              <View style={completeStyles.iconCircle}>
                <Ionicons name="checkmark" size={36} color={COLORS.background} />
              </View>
            </View>
            <Text style={completeStyles.heading}>Today's Run Complete</Text>
            <Text style={completeStyles.subheading}>{runsheet.date}</Text>

            <View style={completeStyles.statsRow}>
              <View style={completeStyles.statBox}>
                <Text style={completeStyles.statValue}>{runsheet.shiftStarted}</Text>
                <Text style={completeStyles.statLabel}>Shift started</Text>
              </View>
              <View style={completeStyles.statDivider} />
              <View style={completeStyles.statBox}>
                <Text style={completeStyles.statValue}>{patientStops.length}</Text>
                <Text style={completeStyles.statLabel}>
                  {patientStops.length === 1 ? 'Patient seen' : 'Patients seen'}
                </Text>
              </View>
              <View style={completeStyles.statDivider} />
              <View style={completeStyles.statBox}>
                <Text style={completeStyles.statValue}>{runsheet.specimensDroppedOff}</Text>
                <Text style={completeStyles.statLabel}>Dropped off</Text>
              </View>
            </View>

            {/* View Details toggle */}
            <TouchableOpacity
              style={completeStyles.detailsToggle}
              onPress={() => setShowDetails((v) => !v)}
              activeOpacity={0.7}
            >
              <Text style={completeStyles.detailsToggleText}>
                {showDetails ? 'Hide Details' : 'View Details'}
              </Text>
              <Ionicons
                name={showDetails ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={COLORS.accent}
              />
            </TouchableOpacity>

            {showDetails && (
              <View style={completeStyles.detailsList}>
                {patientStops.map((stop, index) => (
                  <View key={stop.id} style={completeStyles.detailRow}>
                    <View style={completeStyles.detailStopNum}>
                      <Text style={completeStyles.detailStopNumText}>{index + 1}</Text>
                    </View>
                    <View style={completeStyles.detailInfo}>
                      <Text style={completeStyles.detailName}>{stop.patientName}</Text>
                      <Text style={completeStyles.detailAddress} numberOfLines={1}>
                        {stop.address}
                      </Text>
                      <View style={completeStyles.detailTimes}>
                        {stop.arrivedAt && (
                          <Text style={completeStyles.detailTime}>
                            Arrived {stop.arrivedAt}
                          </Text>
                        )}
                        {stop.completedAt && (
                          <Text style={completeStyles.detailTime}>
                            · Done {stop.completedAt}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }

  // ── Normal swipe flow ──────────────────────────────────────────────────
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <NuraLogo size={36} />
        <View style={styles.headerRight}>
          <Text style={styles.dateText}>{runsheet?.date ?? ''}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.accent}
          />
        }
      >
        {/* Step 1: Start Time */}
        <View style={styles.stepContainer}>
          <View style={styles.stepHeader}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepTitle}>Start Time</Text>
          </View>
          <View style={styles.stepContent}>
            <View style={styles.timeContainer}>
              <Ionicons name="time" size={20} color={COLORS.accent} />
              <Text style={styles.timeText}>Shift starts at 7:00 AM</Text>
            </View>
            <SwipeSlider
              label="Swipe to begin shift"
              onComplete={handleShiftStart}
              completed={!!runsheet?.shiftStarted}
              completedLabel={`Shift started at ${runsheet?.shiftStarted ?? ''}`}
            />
          </View>
        </View>

        {/* Step 2: Printables Pickup */}
        <View style={styles.stepContainer}>
          <View style={styles.stepHeader}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepTitle}>Printables Pickup</Text>
          </View>
          <View style={styles.stepContent}>
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleLabel}>Printables required today?</Text>
              <View style={styles.toggleOptions}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    printablesRequired && styles.toggleButtonActive,
                  ]}
                  onPress={() => { setPrintablesRequired(true); setPrintablesSkipped(false); }}
                >
                  <Text
                    style={[
                      styles.toggleButtonText,
                      printablesRequired && styles.toggleButtonTextActive,
                    ]}
                  >
                    YES
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    !printablesRequired && styles.toggleButtonActive,
                  ]}
                  onPress={() => { setPrintablesRequired(false); setPrintablesSkipped(true); }}
                >
                  <Text
                    style={[
                      styles.toggleButtonText,
                      !printablesRequired && styles.toggleButtonTextActive,
                    ]}
                  >
                    NO
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {printablesRequired && !runsheet?.printablesCollected && !printablesSkipped && (
              <TouchableOpacity
                style={styles.skipLink}
                onPress={() => setPrintablesSkipped(true)}
              >
                <Text style={styles.skipLinkText}>Skip printables pickup</Text>
              </TouchableOpacity>
            )}

            {printablesRequired && (
              <>
                <View style={styles.addressContainer}>
                  <Ionicons name="location" size={18} color={COLORS.accent} />
                  <Text style={styles.addressText}>{PRINTABLES_PICKUP_ADDRESS}</Text>
                </View>
                <TouchableOpacity
                  style={styles.mapsButton}
                  onPress={() => openMaps(PRINTABLES_PICKUP_ADDRESS)}
                >
                  <Ionicons name="navigate" size={18} color={COLORS.primary} />
                  <Text style={styles.mapsButtonText}>Open in Maps</Text>
                </TouchableOpacity>
                {!printablesSkipped && (
                  <SwipeSlider
                    label="Confirm printables collected"
                    onComplete={handlePrintablesCollected}
                    completed={!!runsheet?.printablesCollected}
                    completedLabel={`Collected at ${runsheet?.printablesCollected ?? ''}`}
                    disabled={!runsheet?.shiftStarted}
                  />
                )}
                {printablesSkipped && (
                  <View style={styles.skippedBadge}>
                    <Text style={styles.skippedText}>Printables pickup skipped</Text>
                  </View>
                )}
              </>
            )}
          </View>
        </View>

        {/* Step 3: Daily Checklist */}
        <View style={styles.stepContainer}>
          <View style={styles.stepHeader}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepTitle}>Daily Checklist</Text>
          </View>
          <View style={styles.stepContent}>
            {CHECKLIST_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.checklistItem}
                onPress={() =>
                  !checklistSkipped &&
                  !runsheet?.checklistCompleted &&
                  setChecklist({ ...checklist, [item.id]: !checklist[item.id] })
                }
                disabled={!!runsheet?.checklistCompleted || checklistSkipped}
              >
                <View
                  style={[
                    styles.checkbox,
                    (checklist[item.id] || checklistSkipped) && styles.checkboxChecked,
                  ]}
                >
                  {(checklist[item.id] || checklistSkipped) && (
                    <Ionicons name="checkmark" size={16} color={COLORS.primary} />
                  )}
                </View>
                <Text
                  style={[
                    styles.checklistLabel,
                    (checklist[item.id] || checklistSkipped) && styles.checklistLabelChecked,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}

            {!runsheet?.checklistCompleted && !checklistSkipped && (
              <TouchableOpacity
                style={styles.skipLink}
                onPress={() => setChecklistSkipped(true)}
              >
                <Text style={styles.skipLinkText}>Skip checklist</Text>
              </TouchableOpacity>
            )}

            <View style={{ marginTop: SPACING.sm }}>
              {checklistSkipped ? (
                <View style={styles.skippedBadge}>
                  <Text style={styles.skippedText}>Checklist skipped</Text>
                </View>
              ) : (
                <SwipeSlider
                  label="Swipe to confirm all done"
                  onComplete={handleChecklistComplete}
                  completed={!!runsheet?.checklistCompleted}
                  completedLabel={`Completed at ${runsheet?.checklistCompleted ?? ''}`}
                  disabled={!allChecklistCompleted}
                />
              )}
            </View>
          </View>
        </View>

        {/* Step 4: Patient Stops */}
        <View style={styles.stepContainer}>
          <View style={styles.stepHeader}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <Text style={styles.stepTitle}>Patient Stops</Text>
            {patientStops.length > 0 && (
              <Text style={styles.stopCount}>
                {completedStops}/{patientStops.length}
              </Text>
            )}
          </View>
          <View style={styles.stepContent}>
            {patientStops.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="sunny-outline" size={40} color={COLORS.muted} />
                <Text style={styles.emptyStateTitle}>No collections today</Text>
                <Text style={styles.emptyStateSubtext}>Enjoy your day off.</Text>
              </View>
            ) : (
              patientStops.map((stop, index) => (
                <PatientStopCard
                  key={stop.id}
                  stop={stop}
                  stopNumber={index + 1}
                  onArrive={() => handlePatientArrive(stop.id)}
                  onComplete={() => handlePatientComplete(stop.id)}
                  onNotesChange={(notes) => handleNotesChange(stop.id, notes)}
                />
              ))
            )}
          </View>
        </View>

        {/* Step 5: Drop Off */}
        <View style={styles.stepContainer}>
          <View style={styles.stepHeader}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>5</Text>
            </View>
            <Text style={styles.stepTitle}>Drop Off</Text>
          </View>
          <View style={styles.stepContent}>
            <View style={styles.dropOffCard}>
              <Text style={styles.dropOffLocation}>{DROP_OFF_LOCATION}</Text>
              <View style={styles.addressContainer}>
                <Ionicons name="location" size={18} color={COLORS.accent} />
                <Text style={styles.addressText}>{DROP_OFF_ADDRESS}</Text>
              </View>
              <TouchableOpacity
                style={styles.mapsButton}
                onPress={() => openMaps(DROP_OFF_ADDRESS)}
              >
                <Ionicons name="navigate" size={18} color={COLORS.primary} />
                <Text style={styles.mapsButtonText}>Navigate</Text>
              </TouchableOpacity>
              <SwipeSlider
                label="Swipe to confirm drop-off"
                onComplete={handleDropOff}
                completed={!!runsheet?.specimensDroppedOff}
                completedLabel={`Dropped off at ${runsheet?.specimensDroppedOff ?? ''}`}
              />
            </View>
          </View>
        </View>

        {/* End of Run Summary */}
        {runsheet?.specimensDroppedOff && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Run Complete!</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Stops</Text>
              <Text style={styles.summaryValue}>{completedStops}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Estimated Earnings</Text>
              <Text style={styles.summaryValueAccent}>${totalEarnings.toFixed(2)}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  dateText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl * 2,
  },
  stepContainer: {
    marginBottom: SPACING.lg,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  stepNumberText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  stepTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  stopCount: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  stepContent: {
    marginLeft: 36,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  timeText: {
    color: COLORS.text,
    fontSize: 16,
  },
  toggleContainer: {
    marginBottom: SPACING.md,
  },
  toggleLabel: {
    color: COLORS.text,
    fontSize: 14,
    marginBottom: SPACING.sm,
  },
  toggleOptions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  toggleButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  toggleButtonActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  toggleButtonText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  toggleButtonTextActive: {
    color: COLORS.primary,
  },
  skipLink: {
    marginBottom: SPACING.sm,
  },
  skipLinkText: {
    color: COLORS.muted,
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  skippedBadge: {
    paddingVertical: SPACING.sm,
  },
  skippedText: {
    color: COLORS.muted,
    fontSize: 13,
    fontStyle: 'italic',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  addressText: {
    color: COLORS.text,
    fontSize: 14,
    flex: 1,
  },
  mapsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  mapsButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.textSecondary,
    marginRight: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  checklistLabel: {
    color: COLORS.text,
    fontSize: 14,
  },
  checklistLabelChecked: {
    color: COLORS.accent,
  },
  dropOffCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(128, 229, 203, 0.2)',
  },
  dropOffLocation: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyStateTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '600',
    marginTop: SPACING.md,
  },
  emptyStateSubtext: {
    color: COLORS.muted,
    fontSize: 14,
    marginTop: SPACING.xs,
  },
  summaryCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  summaryTitle: {
    color: COLORS.accent,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  summaryValue: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  summaryValueAccent: {
    color: COLORS.accent,
    fontSize: 18,
    fontWeight: '700',
  },
});

const completeStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(128, 229, 203, 0.25)',
    marginTop: SPACING.sm,
  },
  iconRow: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  heading: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subheading: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.md,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(128, 229, 203, 0.2)',
  },
  statValue: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    textAlign: 'center',
  },
  detailsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
  },
  detailsToggleText: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  detailsList: {
    marginTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 229, 203, 0.15)',
    paddingTop: SPACING.sm,
    gap: SPACING.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  detailStopNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(128, 229, 203, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  detailStopNumText: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '700',
  },
  detailInfo: {
    flex: 1,
  },
  detailName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  detailAddress: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 1,
  },
  detailTimes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  detailTime: {
    color: COLORS.muted,
    fontSize: 11,
  },
});
