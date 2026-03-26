import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS, SPACING } from '../constants/theme';
import { Job } from '../types';

interface JobCardProps {
  job: Job;
  onPress?: () => void;
  expanded?: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onPress, expanded = false }) => {
  const getStatusColor = () => {
    switch (job.status) {
      case 'upcoming':
        return COLORS.accent;
      case 'in_progress':
        return COLORS.warning;
      case 'completed':
        return COLORS.success;
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusLabel = () => {
    switch (job.status) {
      case 'upcoming':
        return 'Upcoming';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      default:
        return '';
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.dateTimeContainer}>
          <Text style={styles.date}>{job.date}</Text>
          <Text style={styles.time}>{job.timeSlot}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{getStatusLabel()}</Text>
        </View>
      </View>

      <View style={styles.locationContainer}>
        <Ionicons name="location" size={18} color={COLORS.accent} />
        <Text style={styles.suburb}>{job.suburb}</Text>
      </View>

      <View style={styles.earningsContainer}>
        <Ionicons name="cash" size={18} color={COLORS.accent} />
        <Text style={styles.earnings}>${job.earnings.toFixed(2)}</Text>
      </View>

      {expanded && (
        <View style={styles.expandedContent}>
          <View style={styles.divider} />
          <Text style={styles.addressLabel}>Full Address</Text>
          <Text style={styles.address}>{job.address}</Text>
          {job.patientName && (
            <>
              <Text style={styles.addressLabel}>Patient</Text>
              <Text style={styles.address}>{job.patientName}</Text>
            </>
          )}
        </View>
      )}

      <View style={styles.chevronContainer}>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={COLORS.textSecondary}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(128, 229, 203, 0.2)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  dateTimeContainer: {
    flex: 1,
  },
  date: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  time: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusText: {
    color: COLORS.background,
    fontSize: 12,
    fontWeight: '600',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  suburb: {
    color: COLORS.text,
    fontSize: 14,
  },
  earningsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  earnings: {
    color: COLORS.accent,
    fontSize: 18,
    fontWeight: '700',
  },
  expandedContent: {
    marginTop: SPACING.sm,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(128, 229, 203, 0.2)',
    marginBottom: SPACING.sm,
  },
  addressLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 2,
  },
  address: {
    color: COLORS.text,
    fontSize: 14,
    marginBottom: SPACING.sm,
  },
  chevronContainer: {
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
});
