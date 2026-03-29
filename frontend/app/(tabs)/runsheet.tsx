import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { NuraLogo } from '../../src/components/NuraLogo';
import { SwipeSlider } from '../../src/components/SwipeSlider';
import { PatientStopCard } from '../../src/components/PatientStopCard';
import { todaysRunsheet } from '../../src/data/sampleData';
import { PatientStop } from '../../src/types';
import { insertRunsheetEvent, RUNSHEET_EVENT_TYPES } from '../../src/lib/supabase';

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
  const [runsheet, setRunsheet] = useState(todaysRunsheet);
  const [printablesRequired, setPrintablesRequired] = useState(runsheet.printablesRequired);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [patientStops, setPatientStops] = useState<PatientStop[]>(runsheet.patientStops);

  const allChecklistCompleted = CHECKLIST_ITEMS.every((item) => checklist[item.id]);

  const handleShiftStart = () => {
    const timestamp = format(new Date(), 'h:mm a');
    setRunsheet({ ...runsheet, shiftStarted: timestamp });
    // Fire and forget - Supabase call
    insertRunsheetEvent(RUNSHEET_EVENT_TYPES.SHIFT_START, null);
  };

  const handlePrintablesCollected = () => {
    const timestamp = format(new Date(), 'h:mm a');
    setRunsheet({ ...runsheet, printablesCollected: timestamp });
    // Fire and forget - Supabase call
    insertRunsheetEvent(RUNSHEET_EVENT_TYPES.PRINTABLES_COLLECTED, null);
  };

  const handleChecklistComplete = () => {
    const timestamp = format(new Date(), 'h:mm a');
    setRunsheet({ ...runsheet, checklistCompleted: timestamp });
    // Fire and forget - Supabase call
    insertRunsheetEvent(RUNSHEET_EVENT_TYPES.CHECKLIST_COMPLETE, null);
  };

  const handlePatientArrive = (stopId: string) => {
    const timestamp = format(new Date(), 'h:mm a');
    setPatientStops((stops) =>
      stops.map((stop) =>
        stop.id === stopId ? { ...stop, arrivedAt: timestamp } : stop
      )
    );
    // Fire and forget - Supabase call
    insertRunsheetEvent(RUNSHEET_EVENT_TYPES.ARRIVED_AT_STOP, stopId);
  };

  const handlePatientComplete = (stopId: string) => {
    const timestamp = format(new Date(), 'h:mm a');
    setPatientStops((stops) =>
      stops.map((stop) =>
        stop.id === stopId ? { ...stop, completedAt: timestamp } : stop
      )
    );
    // Fire and forget - Supabase call
    insertRunsheetEvent(RUNSHEET_EVENT_TYPES.COLLECTION_COMPLETE, stopId);
  };

  const handleNotesChange = (stopId: string, notes: string) => {
    setPatientStops((stops) =>
      stops.map((stop) =>
        stop.id === stopId ? { ...stop, notes } : stop
      )
    );
  };

  const handleDropOff = () => {
    const timestamp = format(new Date(), 'h:mm a');
    setRunsheet({ ...runsheet, specimensDroppedOff: timestamp });
    // Fire and forget - Supabase call
    insertRunsheetEvent(RUNSHEET_EVENT_TYPES.SPECIMENS_DROPPED_OFF, null);
  };

  const openMaps = (address: string) => {
    const url = `https://maps.google.com/?q=${encodeURIComponent(address)}`;
    Linking.openURL(url);
  };

  const completedStops = patientStops.filter((stop) => stop.completedAt).length;
  const totalEarnings = 48 + completedStops * 12;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
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
              <Text style={styles.timeText}>Shift starts at {runsheet.startTime}</Text>
            </View>
            <SwipeSlider
              label="Swipe to begin shift"
              onComplete={handleShiftStart}
              completed={!!runsheet.shiftStarted}
              completedLabel={`Shift started at ${runsheet.shiftStarted || ''}`}
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
                  onPress={() => setPrintablesRequired(true)}
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
                  onPress={() => setPrintablesRequired(false)}
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

            {printablesRequired && (
              <>
                <View style={styles.addressContainer}>
                  <Ionicons name="location" size={18} color={COLORS.accent} />
                  <Text style={styles.addressText}>
                    {runsheet.printablesPickupAddress}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.mapsButton}
                  onPress={() => openMaps(runsheet.printablesPickupAddress || '')}
                >
                  <Ionicons name="navigate" size={18} color={COLORS.primary} />
                  <Text style={styles.mapsButtonText}>Open in Maps</Text>
                </TouchableOpacity>
                <SwipeSlider
                  label="Confirm printables collected"
                  onComplete={handlePrintablesCollected}
                  completed={!!runsheet.printablesCollected}
                  completedLabel={`Collected at ${runsheet.printablesCollected || ''}`}
                  disabled={!runsheet.shiftStarted}
                />
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
                  setChecklist({ ...checklist, [item.id]: !checklist[item.id] })
                }
                disabled={!!runsheet.checklistCompleted}
              >
                <View
                  style={[
                    styles.checkbox,
                    checklist[item.id] && styles.checkboxChecked,
                  ]}
                >
                  {checklist[item.id] && (
                    <Ionicons name="checkmark" size={16} color={COLORS.primary} />
                  )}
                </View>
                <Text
                  style={[
                    styles.checklistLabel,
                    checklist[item.id] && styles.checklistLabelChecked,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
            <View style={{ marginTop: SPACING.sm }}>
              <SwipeSlider
                label="Swipe to confirm all done"
                onComplete={handleChecklistComplete}
                completed={!!runsheet.checklistCompleted}
                completedLabel={`Completed at ${runsheet.checklistCompleted || ''}`}
                disabled={!allChecklistCompleted}
              />
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
            <Text style={styles.stopCount}>
              {completedStops}/{patientStops.length}
            </Text>
          </View>
          <View style={styles.stepContent}>
            {patientStops.map((stop, index) => (
              <PatientStopCard
                key={stop.id}
                stop={stop}
                stopNumber={index + 1}
                onArrive={() => handlePatientArrive(stop.id)}
                onComplete={() => handlePatientComplete(stop.id)}
                onNotesChange={(notes) => handleNotesChange(stop.id, notes)}
              />
            ))}
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
              <Text style={styles.dropOffLocation}>{runsheet.dropOffLocation}</Text>
              <View style={styles.addressContainer}>
                <Ionicons name="location" size={18} color={COLORS.accent} />
                <Text style={styles.addressText}>{runsheet.dropOffAddress}</Text>
              </View>
              <TouchableOpacity
                style={styles.mapsButton}
                onPress={() => openMaps(runsheet.dropOffAddress)}
              >
                <Ionicons name="navigate" size={18} color={COLORS.primary} />
                <Text style={styles.mapsButtonText}>Navigate</Text>
              </TouchableOpacity>
              <SwipeSlider
                label="Swipe to confirm drop-off"
                onComplete={handleDropOff}
                completed={!!runsheet.specimensDroppedOff}
                completedLabel={`Dropped off at ${runsheet.specimensDroppedOff || ''}`}
              />
            </View>
          </View>
        </View>

        {/* End of Run Summary */}
        {runsheet.specimensDroppedOff && (
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
