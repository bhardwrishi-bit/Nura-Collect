import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS, SPACING } from '../constants/theme';
import { SwipeSlider } from './SwipeSlider';
import { PatientStop } from '../types';

interface PatientStopCardProps {
  stop: PatientStop;
  stopNumber: number;
  onArrive: () => void;
  onComplete: () => void;
  onNotesChange: (notes: string) => void;
}

export const PatientStopCard: React.FC<PatientStopCardProps> = ({
  stop,
  stopNumber,
  onArrive,
  onComplete,
  onNotesChange,
}) => {
  const [notes, setNotes] = useState(stop.notes || '');

  const openMaps = () => {
    const url = `https://maps.google.com/?q=${encodeURIComponent(stop.address)}`;
    Linking.openURL(url);
  };

  const callPatient = () => {
    if (stop.phone) Linking.openURL(`tel:${stop.phone}`);
  };

  const handleNotesChange = (text: string) => {
    setNotes(text);
    onNotesChange(text);
  };

  const tubes = stop.tubes ?? [];
  const accessories = stop.accessories ?? [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.stopNumber}>
          <Text style={styles.stopNumberText}>{stopNumber}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.patientName}>{stop.patientName}</Text>
          {stop.time ? (
            <Text style={styles.suburb}>Scheduled {stop.time}</Text>
          ) : stop.suburb ? (
            <Text style={styles.suburb}>{stop.suburb}</Text>
          ) : null}
        </View>
        {stop.phone && (
          <TouchableOpacity style={styles.callButton} onPress={callPatient}>
            <Ionicons name="call" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.addressContainer}>
        <Ionicons name="location" size={18} color={COLORS.accent} />
        <Text style={styles.address}>{stop.address}</Text>
      </View>

      <TouchableOpacity style={styles.mapsButton} onPress={openMaps}>
        <Ionicons name="navigate" size={18} color={COLORS.primary} />
        <Text style={styles.mapsButtonText}>Navigate</Text>
      </TouchableOpacity>

      {stop.specialNotes ? (
        <View style={styles.specialNotesBox}>
          <Ionicons name="information-circle" size={16} color={COLORS.warning} />
          <Text style={styles.specialNotesText}>{stop.specialNotes}</Text>
        </View>
      ) : null}

      {stop.referralUploaded === true && (
        <View style={styles.referralBadge}>
          <Ionicons name="document-text" size={14} color={COLORS.accent} />
          <Text style={styles.referralText}>Referral on file</Text>
        </View>
      )}

      {tubes.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Required Tubes</Text>
          {tubes.map((tube, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.bullet} />
              <Text style={styles.itemText}>{tube}</Text>
            </View>
          ))}
        </View>
      )}

      {accessories.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Required Accessories</Text>
          {accessories.map((accessory, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.bullet} />
              <Text style={styles.itemText}>{accessory}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.slidersContainer}>
        <SwipeSlider
          label="Swipe to confirm arrival"
          onComplete={onArrive}
          completed={!!stop.arrivedAt}
          completedLabel={`Arrived at ${stop.arrivedAt || ''}`}
        />

        <View style={{ height: SPACING.sm }} />

        <SwipeSlider
          label="Swipe to complete collection"
          onComplete={onComplete}
          completed={!!stop.completedAt}
          completedLabel={`Completed at ${stop.completedAt || ''}`}
          disabled={!stop.arrivedAt}
        />
      </View>

      <View style={styles.notesContainer}>
        <Text style={styles.notesLabel}>Notes (optional)</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="Add notes about this collection..."
          placeholderTextColor={COLORS.textSecondary}
          value={notes}
          onChangeText={handleNotesChange}
          multiline
          numberOfLines={2}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(128, 229, 203, 0.2)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  stopNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  stopNumberText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  headerInfo: {
    flex: 1,
  },
  patientName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  suburb: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  callButton: {
    backgroundColor: COLORS.accent,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  address: {
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
  specialNotesBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
    backgroundColor: 'rgba(255, 183, 77, 0.1)',
    borderWidth: 1,
    borderColor: COLORS.warning,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  specialNotesText: {
    color: COLORS.warning,
    fontSize: 13,
    flex: 1,
  },
  referralBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SPACING.sm,
  },
  referralText: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
    marginRight: SPACING.sm,
  },
  itemText: {
    color: COLORS.text,
    fontSize: 14,
  },
  slidersContainer: {
    marginBottom: SPACING.md,
  },
  notesContainer: {
    marginTop: SPACING.xs,
  },
  notesLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: SPACING.xs,
  },
  notesInput: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    color: COLORS.text,
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: 'top',
  },
});
