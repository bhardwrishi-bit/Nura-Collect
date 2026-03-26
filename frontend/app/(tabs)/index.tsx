import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { NuraLogo } from '../../src/components/NuraLogo';
import { JobCard } from '../../src/components/JobCard';
import { generateWeeklyJobs } from '../../src/data/sampleData';

export default function JobsScreen() {
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const jobs = generateWeeklyJobs();

  const selectedDateJobs = jobs.filter(
    (job) => job.date === format(selectedDate, 'EEE, dd MMM')
  );

  const navigateWeek = (direction: 'prev' | 'next') => {
    const days = direction === 'prev' ? -7 : 7;
    setSelectedDate(addDays(selectedDate, days));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <NuraLogo size={36} />
        <Text style={styles.headerTitle}>My Jobs</Text>
      </View>

      {/* Week Navigation */}
      <View style={styles.weekNavigation}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateWeek('prev')}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.accent} />
        </TouchableOpacity>
        <Text style={styles.weekLabel}>
          {format(weekStart, 'dd MMM')} - {format(addDays(weekStart, 6), 'dd MMM yyyy')}
        </Text>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateWeek('next')}
        >
          <Ionicons name="chevron-forward" size={24} color={COLORS.accent} />
        </TouchableOpacity>
      </View>

      {/* Week Calendar */}
      <View style={styles.weekCalendar}>
        {weekDays.map((day, index) => {
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          const hasJob = jobs.some((job) => job.date === format(day, 'EEE, dd MMM'));

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayButton,
                isSelected && styles.dayButtonSelected,
                isToday && !isSelected && styles.dayButtonToday,
              ]}
              onPress={() => setSelectedDate(day)}
            >
              <Text
                style={[
                  styles.dayName,
                  isSelected && styles.dayTextSelected,
                ]}
              >
                {format(day, 'EEE')}
              </Text>
              <Text
                style={[
                  styles.dayNumber,
                  isSelected && styles.dayTextSelected,
                ]}
              >
                {format(day, 'd')}
              </Text>
              {hasJob && (
                <View
                  style={[
                    styles.jobIndicator,
                    isSelected && styles.jobIndicatorSelected,
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Jobs List */}
      <ScrollView
        style={styles.jobsList}
        contentContainerStyle={styles.jobsListContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.selectedDateLabel}>
          {format(selectedDate, 'EEEE, dd MMMM')}
        </Text>

        {selectedDateJobs.length > 0 ? (
          selectedDateJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              expanded={expandedJobId === job.id}
              onPress={() =>
                setExpandedJobId(expandedJobId === job.id ? null : job.id)
              }
            />
          ))
        ) : (
          <View style={styles.noJobsContainer}>
            <Ionicons name="calendar-outline" size={48} color={COLORS.textSecondary} />
            <Text style={styles.noJobsText}>No jobs scheduled</Text>
            <Text style={styles.noJobsSubtext}>
              Enjoy your day off!
            </Text>
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
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 'auto',
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
  weekLabel: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '500',
  },
  weekCalendar: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    gap: 4,
  },
  dayButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.cardBackground,
  },
  dayButtonSelected: {
    backgroundColor: COLORS.accent,
  },
  dayButtonToday: {
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  dayName: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  dayNumber: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },
  dayTextSelected: {
    color: COLORS.primary,
  },
  jobIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
    marginTop: 4,
  },
  jobIndicatorSelected: {
    backgroundColor: COLORS.primary,
  },
  jobsList: {
    flex: 1,
  },
  jobsListContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  selectedDateLabel: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  noJobsContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  noJobsText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
    marginTop: SPACING.md,
  },
  noJobsSubtext: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: SPACING.xs,
  },
});
