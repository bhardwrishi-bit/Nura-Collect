import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format, addDays, startOfWeek, isBefore, isToday, isSameDay, addWeeks } from 'date-fns';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { NuraLogo } from '../../src/components/NuraLogo';
import { AvailabilityStatus } from '../../src/types';

interface DayAvailability {
  date: Date;
  status: AvailabilityStatus;
}

interface WeekData {
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  days: DayAvailability[];
  submitted: boolean;
}

const generateWeeks = (baseDate: Date): WeekData[] => {
  const weeks: WeekData[] = [];
  const currentWeekStart = startOfWeek(baseDate, { weekStartsOn: 1 });

  for (let i = 0; i < 4; i++) {
    const weekStart = addWeeks(currentWeekStart, i);
    const days: DayAvailability[] = [];
    
    for (let j = 0; j < 7; j++) {
      days.push({
        date: addDays(weekStart, j),
        status: 'not_set',
      });
    }

    weeks.push({
      weekNumber: i + 1,
      startDate: weekStart,
      endDate: addDays(weekStart, 6),
      days,
      submitted: false,
    });
  }

  return weeks;
};

export default function AvailabilityScreen() {
  const insets = useSafeAreaInsets();
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [weeks, setWeeks] = useState<WeekData[]>(() => generateWeeks(new Date()));
  const [expandedDayIndex, setExpandedDayIndex] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const currentWeek = weeks[currentWeekIndex];
  const today = new Date();

  const isPastDay = (date: Date): boolean => {
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return dateStart < todayStart;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentWeekIndex > 0) {
      setCurrentWeekIndex(currentWeekIndex - 1);
      setExpandedDayIndex(null);
    } else if (direction === 'next' && currentWeekIndex < 3) {
      setCurrentWeekIndex(currentWeekIndex + 1);
      setExpandedDayIndex(null);
    }
  };

  const setDayStatus = (dayIndex: number, status: AvailabilityStatus) => {
    if (currentWeek.submitted) return;
    
    const newWeeks = [...weeks];
    newWeeks[currentWeekIndex].days[dayIndex].status = status;
    setWeeks(newWeeks);
    
    if (status !== 'am_only' && status !== 'pm_only') {
      setExpandedDayIndex(null);
    }
  };

  const handleDayPress = (dayIndex: number) => {
    const day = currentWeek.days[dayIndex];
    if (isPastDay(day.date) || currentWeek.submitted) return;
    
    if (expandedDayIndex === dayIndex) {
      setExpandedDayIndex(null);
    } else {
      setExpandedDayIndex(dayIndex);
    }
  };

  const getStatusSummary = () => {
    let available = 0;
    let unavailable = 0;
    let notSet = 0;

    currentWeek.days.forEach((day) => {
      if (!isPastDay(day.date)) {
        if (day.status === 'available' || day.status === 'am_only' || day.status === 'pm_only') {
          available++;
        } else if (day.status === 'unavailable') {
          unavailable++;
        } else {
          notSet++;
        }
      }
    });

    return { available, unavailable, notSet };
  };

  const canSubmit = () => {
    if (currentWeek.submitted) return false;
    const summary = getStatusSummary();
    return summary.available > 0 || summary.unavailable > 0;
  };

  const handleSubmit = () => {
    const newWeeks = [...weeks];
    newWeeks[currentWeekIndex].submitted = true;
    setWeeks(newWeeks);
    
    const weekRange = `${format(currentWeek.startDate, 'dd MMM')} - ${format(currentWeek.endDate, 'dd MMM')}`;
    setToastMessage(`Availability submitted for ${weekRange}`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const summary = getStatusSummary();

  const getStatusColor = (status: AvailabilityStatus): string => {
    switch (status) {
      case 'available':
      case 'am_only':
      case 'pm_only':
        return COLORS.accent;
      case 'unavailable':
        return COLORS.error;
      default:
        return 'transparent';
    }
  };

  const getStatusLabel = (status: AvailabilityStatus): string => {
    switch (status) {
      case 'available':
        return 'Full Day';
      case 'am_only':
        return 'AM Only (7am-12pm)';
      case 'pm_only':
        return 'PM Only (12pm-5pm)';
      case 'unavailable':
        return 'Unavailable';
      default:
        return 'Tap to set';
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <NuraLogo size={36} />
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>My Availability</Text>
          <Text style={styles.headerSubtitle}>Submit your availability for the next 4 weeks</Text>
        </View>
      </View>

      {/* Week Status Pill */}
      <View style={styles.weekPillContainer}>
        <View style={styles.weekPill}>
          <Text style={styles.weekPillText}>Week {currentWeek.weekNumber} of 4</Text>
        </View>
        {currentWeek.submitted && (
          <View style={styles.submittedBadge}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.accent} />
            <Text style={styles.submittedText}>Submitted</Text>
          </View>
        )}
      </View>

      {/* Week Navigation */}
      <View style={styles.weekNavigation}>
        <TouchableOpacity
          style={[styles.navButton, currentWeekIndex === 0 && styles.navButtonDisabled]}
          onPress={() => navigateWeek('prev')}
          disabled={currentWeekIndex === 0}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={currentWeekIndex === 0 ? COLORS.muted : COLORS.accent}
          />
        </TouchableOpacity>
        <Text style={styles.weekLabel}>
          {format(currentWeek.startDate, 'dd MMM')} - {format(currentWeek.endDate, 'dd MMM yyyy')}
        </Text>
        <TouchableOpacity
          style={[styles.navButton, currentWeekIndex === 3 && styles.navButtonDisabled]}
          onPress={() => navigateWeek('next')}
          disabled={currentWeekIndex === 3}
        >
          <Ionicons
            name="chevron-forward"
            size={24}
            color={currentWeekIndex === 3 ? COLORS.muted : COLORS.accent}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Day Cards */}
        {currentWeek.days.map((day, index) => {
          const past = isPastDay(day.date);
          const isExpanded = expandedDayIndex === index;
          const isCurrentDay = isToday(day.date);
          const locked = currentWeek.submitted;

          return (
            <View key={index}>
              <TouchableOpacity
                style={[
                  styles.dayCard,
                  past && styles.dayCardPast,
                  locked && styles.dayCardLocked,
                  day.status === 'available' && styles.dayCardAvailable,
                  (day.status === 'am_only' || day.status === 'pm_only') && styles.dayCardPartial,
                  day.status === 'unavailable' && styles.dayCardUnavailable,
                  isCurrentDay && styles.dayCardToday,
                ]}
                onPress={() => handleDayPress(index)}
                disabled={past || locked}
              >
                <View style={styles.dayCardHeader}>
                  <View style={styles.dayInfo}>
                    <Text style={[styles.dayName, past && styles.textMuted]}>
                      {format(day.date, 'EEE')}
                    </Text>
                    <Text style={[styles.dayDate, past && styles.textMuted]}>
                      {format(day.date, 'd MMM')}
                    </Text>
                    {isCurrentDay && (
                      <View style={styles.todayBadge}>
                        <Text style={styles.todayText}>Today</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.dayStatus}>
                    {day.status === 'available' && (
                      <View style={styles.statusIcon}>
                        <Ionicons name="checkmark" size={20} color={COLORS.background} />
                      </View>
                    )}
                    {day.status === 'unavailable' && (
                      <View style={[styles.statusIcon, styles.statusIconRed]}>
                        <Ionicons name="close" size={20} color="#fff" />
                      </View>
                    )}
                    {(day.status === 'am_only' || day.status === 'pm_only') && (
                      <View style={[styles.statusIcon, styles.statusIconOrange]}>
                        <Text style={styles.partialText}>
                          {day.status === 'am_only' ? 'AM' : 'PM'}
                        </Text>
                      </View>
                    )}
                    <Text style={[styles.statusLabel, past && styles.textMuted]}>
                      {past ? 'Past' : getStatusLabel(day.status)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Expanded Options */}
              {isExpanded && !past && !locked && (
                <View style={styles.optionsContainer}>
                  <TouchableOpacity
                    style={[
                      styles.optionButton,
                      day.status === 'available' && styles.optionButtonActive,
                    ]}
                    onPress={() => setDayStatus(index, 'available')}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={day.status === 'available' ? COLORS.background : COLORS.accent}
                    />
                    <Text
                      style={[
                        styles.optionText,
                        day.status === 'available' && styles.optionTextActive,
                      ]}
                    >
                      Available (Full Day)
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.partialOptions}>
                    <TouchableOpacity
                      style={[
                        styles.partialButton,
                        day.status === 'am_only' && styles.partialButtonActive,
                      ]}
                      onPress={() => setDayStatus(index, 'am_only')}
                    >
                      <Text
                        style={[
                          styles.partialButtonText,
                          day.status === 'am_only' && styles.partialButtonTextActive,
                        ]}
                      >
                        AM Only (7am-12pm)
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.partialButton,
                        day.status === 'pm_only' && styles.partialButtonActive,
                      ]}
                      onPress={() => setDayStatus(index, 'pm_only')}
                    >
                      <Text
                        style={[
                          styles.partialButtonText,
                          day.status === 'pm_only' && styles.partialButtonTextActive,
                        ]}
                      >
                        PM Only (12pm-5pm)
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.optionButton,
                      styles.optionButtonUnavailable,
                      day.status === 'unavailable' && styles.optionButtonUnavailableActive,
                    ]}
                    onPress={() => setDayStatus(index, 'unavailable')}
                  >
                    <Ionicons
                      name="close-circle"
                      size={20}
                      color={day.status === 'unavailable' ? '#fff' : COLORS.error}
                    />
                    <Text
                      style={[
                        styles.optionText,
                        styles.optionTextUnavailable,
                        day.status === 'unavailable' && styles.optionTextUnavailableActive,
                      ]}
                    >
                      Unavailable
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Bottom Section */}
      <View style={[styles.bottomSection, { paddingBottom: insets.bottom + SPACING.md }]}>
        {/* Summary Row */}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>
            <Text style={styles.summaryValue}>{summary.available}</Text> days available
            <Text style={styles.summaryDot}> · </Text>
            <Text style={styles.summaryValue}>{summary.unavailable}</Text> days unavailable
            <Text style={styles.summaryDot}> · </Text>
            <Text style={styles.summaryValue}>{summary.notSet}</Text> not set
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            !canSubmit() && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!canSubmit()}
        >
          <Text
            style={[
              styles.submitButtonText,
              !canSubmit() && styles.submitButtonTextDisabled,
            ]}
          >
            {currentWeek.submitted ? 'Availability Submitted' : 'Submit Availability'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Toast */}
      {showToast && (
        <View style={[styles.toast, { bottom: insets.bottom + 100 }]}>
          <Ionicons name="checkmark-circle" size={20} color={COLORS.accent} />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}
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
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: SPACING.xs,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '600',
  },
  headerSubtitle: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 2,
  },
  weekPillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  weekPill: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  weekPillText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  submittedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(128, 229, 203, 0.15)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
  },
  submittedText: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '600',
  },
  weekNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  navButton: {
    padding: SPACING.xs,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  weekLabel: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  dayCard: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dayCardPast: {
    opacity: 0.5,
  },
  dayCardLocked: {
    opacity: 0.7,
  },
  dayCardAvailable: {
    backgroundColor: 'rgba(128, 229, 203, 0.15)',
    borderColor: COLORS.accent,
  },
  dayCardPartial: {
    backgroundColor: 'rgba(255, 183, 77, 0.15)',
    borderColor: COLORS.warning,
  },
  dayCardUnavailable: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderColor: COLORS.error,
  },
  dayCardToday: {
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  dayCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  dayName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    width: 40,
  },
  dayDate: {
    color: COLORS.muted,
    fontSize: 14,
  },
  todayBadge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  todayText: {
    color: COLORS.background,
    fontSize: 10,
    fontWeight: '700',
  },
  dayStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statusIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIconRed: {
    backgroundColor: COLORS.error,
  },
  statusIconOrange: {
    backgroundColor: COLORS.warning,
  },
  partialText: {
    color: COLORS.background,
    fontSize: 10,
    fontWeight: '700',
  },
  statusLabel: {
    color: COLORS.muted,
    fontSize: 12,
    maxWidth: 120,
  },
  textMuted: {
    color: COLORS.muted,
  },
  optionsContainer: {
    backgroundColor: COLORS.card2,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    marginTop: -SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionButtonActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  optionButtonUnavailable: {
    borderColor: COLORS.error,
  },
  optionButtonUnavailableActive: {
    backgroundColor: COLORS.error,
    borderColor: COLORS.error,
  },
  optionText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
  optionTextActive: {
    color: COLORS.background,
  },
  optionTextUnavailable: {
    color: COLORS.error,
  },
  optionTextUnavailableActive: {
    color: '#fff',
  },
  partialOptions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  partialButton: {
    flex: 1,
    backgroundColor: COLORS.card,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  partialButtonActive: {
    backgroundColor: COLORS.warning,
  },
  partialButtonText: {
    color: COLORS.warning,
    fontSize: 12,
    fontWeight: '600',
  },
  partialButtonTextActive: {
    color: COLORS.background,
  },
  bottomSection: {
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: SPACING.md,
  },
  summaryRow: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  summaryText: {
    color: COLORS.muted,
    fontSize: 13,
  },
  summaryValue: {
    color: COLORS.text,
    fontWeight: '600',
  },
  summaryDot: {
    color: COLORS.muted,
  },
  submitButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.muted,
    opacity: 0.5,
  },
  submitButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '700',
  },
  submitButtonTextDisabled: {
    color: COLORS.background,
  },
  toast: {
    position: 'absolute',
    left: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  toastText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
});
