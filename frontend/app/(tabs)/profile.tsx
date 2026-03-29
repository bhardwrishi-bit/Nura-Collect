import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { NuraLogo } from '../../src/components/NuraLogo';
import { DocumentCard } from '../../src/components/DocumentCard';
import {
  sarahChenProfile,
  taxInvoices,
  payslips,
  leaveBalance,
  leaveRequests,
} from '../../src/data/sampleData';
import { LeaveType, LeaveStatus, LeaveRequest } from '../../src/types';
import { uploadDocument, insertLeaveRequest } from '../../src/lib/supabase';
import * as DocumentPicker from 'expo-document-picker';

// Simple Bar Chart Component
const SimpleBarChart: React.FC<{ data: { week: string; amount: number }[] }> = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.amount));
  
  return (
    <View style={chartStyles.container}>
      <View style={chartStyles.barsContainer}>
        {data.map((item, index) => (
          <View key={index} style={chartStyles.barWrapper}>
            <View style={chartStyles.barBackground}>
              <View 
                style={[
                  chartStyles.bar, 
                  { height: `${(item.amount / maxValue) * 100}%` }
                ]} 
              />
            </View>
            <Text style={chartStyles.barLabel}>W{index + 1}</Text>
            <Text style={chartStyles.barValue}>${item.amount}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const chartStyles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.md,
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  barBackground: {
    width: '100%',
    height: 120,
    backgroundColor: 'rgba(128, 229, 203, 0.1)',
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 4,
  },
  barLabel: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 4,
  },
  barValue: {
    color: COLORS.text,
    fontSize: 9,
    marginTop: 2,
  },
});

// Leave Status Badge Component
const LeaveStatusBadge: React.FC<{ status: LeaveStatus }> = ({ status }) => {
  const getStatusStyle = () => {
    switch (status) {
      case 'approved':
        return { bg: 'rgba(128, 229, 203, 0.2)', color: COLORS.accent };
      case 'pending':
        return { bg: 'rgba(255, 183, 77, 0.2)', color: COLORS.warning };
      case 'declined':
        return { bg: 'rgba(244, 67, 54, 0.2)', color: COLORS.error };
      default:
        return { bg: COLORS.card, color: COLORS.muted };
    }
  };

  const style = getStatusStyle();
  
  return (
    <View style={[leaveStyles.statusBadge, { backgroundColor: style.bg }]}>
      <Text style={[leaveStyles.statusBadgeText, { color: style.color }]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Text>
    </View>
  );
};

// Leave Type Label
const getLeaveTypeLabel = (type: LeaveType): string => {
  switch (type) {
    case 'annual': return 'Annual Leave';
    case 'sick': return 'Sick Leave';
    case 'personal': return 'Personal Leave';
    case 'other': return 'Other';
    default: return type;
  }
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState(sarahChenProfile);
  const [activeSection, setActiveSection] = useState<'documents' | 'earnings' | 'reports' | 'leave'>('documents');
  
  // Leave form state
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [leaveType, setLeaveType] = useState<LeaveType>('annual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveHistory, setLeaveHistory] = useState<LeaveRequest[]>(leaveRequests);
  
  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleDocumentUpload = async (docId: string, docType: string) => {
    try {
      // Open file picker
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const file = result.assets[0];
      
      // Fire and forget - Supabase upload
      const uploadResult = await uploadDocument(
        { uri: file.uri, name: file.name, type: file.mimeType || 'application/octet-stream' },
        docType
      );

      if (uploadResult.success) {
        showToastMessage('Document uploaded — pending review');
      } else {
        showToastMessage(uploadResult.error || 'Upload failed — please try again');
      }
    } catch (error) {
      console.error('[Nura Supabase Error] handleDocumentUpload:', error);
      showToastMessage('Upload failed — please try again');
    }
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    Alert.alert('Download', 'Invoice PDF would download here.');
  };

  const handleDownloadPayslip = (payslipId: string) => {
    Alert.alert('Download', 'Payslip PDF would download here.');
  };

  const expiringDocuments = profile.documents.filter(
    (doc) => doc.status === 'expiring_soon' || doc.status === 'expired'
  );

  const isContractor = profile.employmentType === 'independent_contractor';
  const contractorDocs = profile.documents.filter(
    (doc) => doc.type !== 'insurance' && doc.type !== 'abn'
  );
  const allDocs = isContractor ? profile.documents : contractorDocs;

  // Calculate working days between dates (Mon-Fri)
  const calculateWorkingDays = (start: string, end: string): number => {
    // Simple mock calculation - would need proper date parsing
    if (!start || !end) return 0;
    // Just return a placeholder for demo
    return 5;
  };

  const handleSubmitLeave = async () => {
    if (!startDate || !endDate) {
      Alert.alert('Error', 'Please enter start and end dates.');
      return;
    }
    
    if ((leaveType === 'sick' || leaveType === 'personal') && !leaveReason) {
      Alert.alert('Error', 'Reason is required for sick and personal leave.');
      return;
    }

    const workingDays = calculateWorkingDays(startDate, endDate);

    // Fire and forget - Supabase call
    const result = await insertLeaveRequest(
      leaveType,
      startDate,
      endDate,
      workingDays,
      leaveReason
    );

    if (result.success) {
      const newRequest: LeaveRequest = {
        id: `leave-${Date.now()}`,
        type: leaveType,
        startDate,
        endDate,
        duration: workingDays,
        reason: leaveReason,
        status: 'pending',
      };

      setLeaveHistory([newRequest, ...leaveHistory]);
      setShowLeaveForm(false);
      setStartDate('');
      setEndDate('');
      setLeaveReason('');
      showToastMessage('Leave request submitted');
    } else {
      showToastMessage(result.error || 'Failed to submit — please try again');
    }
  };

  // Section tabs - include Leave only for employees
  const sectionTabs = isContractor 
    ? ['documents', 'earnings', 'reports'] as const
    : ['documents', 'earnings', 'reports', 'leave'] as const;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <NuraLogo size={36} />
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Section A: Personal Info */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color={COLORS.accent} />
            </View>
          </View>
          <Text style={styles.profileName}>{profile.name}</Text>
          <View style={styles.contactRow}>
            <Ionicons name="call" size={16} color={COLORS.muted} />
            <Text style={styles.contactText}>{profile.phone}</Text>
          </View>
          <View style={styles.contactRow}>
            <Ionicons name="mail" size={16} color={COLORS.muted} />
            <Text style={styles.contactText}>{profile.email}</Text>
          </View>

          <View style={styles.employmentTypeContainer}>
            <Text style={styles.employmentLabel}>Employment Type</Text>
            <View style={styles.employmentToggle}>
              <TouchableOpacity
                style={[
                  styles.employmentOption,
                  isContractor && styles.employmentOptionActive,
                ]}
                onPress={() =>
                  setProfile({ ...profile, employmentType: 'independent_contractor' })
                }
              >
                <Text
                  style={[
                    styles.employmentOptionText,
                    isContractor && styles.employmentOptionTextActive,
                  ]}
                >
                  Contractor
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.employmentOption,
                  !isContractor && styles.employmentOptionActive,
                ]}
                onPress={() =>
                  setProfile({ ...profile, employmentType: 'full_time_employee' })
                }
              >
                <Text
                  style={[
                    styles.employmentOptionText,
                    !isContractor && styles.employmentOptionTextActive,
                  ]}
                >
                  Employee
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Alert Banner */}
        {expiringDocuments.length > 0 && (
          <View style={styles.alertBanner}>
            <Ionicons name="warning" size={20} color={COLORS.error} />
            <Text style={styles.alertText}>
              {expiringDocuments.length} document(s) expiring or expired
            </Text>
          </View>
        )}

        {/* Section Tabs */}
        <View style={styles.sectionTabs}>
          <TouchableOpacity
            style={[
              styles.sectionTab,
              activeSection === 'documents' && styles.sectionTabActive,
            ]}
            onPress={() => setActiveSection('documents')}
          >
            <Text
              style={[
                styles.sectionTabText,
                activeSection === 'documents' && styles.sectionTabTextActive,
              ]}
            >
              Documents
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sectionTab,
              activeSection === 'earnings' && styles.sectionTabActive,
            ]}
            onPress={() => setActiveSection('earnings')}
          >
            <Text
              style={[
                styles.sectionTabText,
                activeSection === 'earnings' && styles.sectionTabTextActive,
              ]}
            >
              Earnings
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sectionTab,
              activeSection === 'reports' && styles.sectionTabActive,
            ]}
            onPress={() => setActiveSection('reports')}
          >
            <Text
              style={[
                styles.sectionTabText,
                activeSection === 'reports' && styles.sectionTabTextActive,
              ]}
            >
              {isContractor ? 'Invoices' : 'Payslips'}
            </Text>
          </TouchableOpacity>
          {!isContractor && (
            <TouchableOpacity
              style={[
                styles.sectionTab,
                activeSection === 'leave' && styles.sectionTabActive,
              ]}
              onPress={() => setActiveSection('leave')}
            >
              <Text
                style={[
                  styles.sectionTabText,
                  activeSection === 'leave' && styles.sectionTabTextActive,
                ]}
              >
                Leave
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Section B: Documents */}
        {activeSection === 'documents' && (
          <View style={styles.section}>
            {allDocs.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onUpload={(docType) => handleDocumentUpload(doc.id, docType)}
              />
            ))}
          </View>
        )}

        {/* Section C: Earnings */}
        {activeSection === 'earnings' && (
          <View style={styles.section}>
            <View style={styles.earningsCards}>
              <View style={styles.earningsCard}>
                <Text style={styles.earningsLabel}>This Week</Text>
                <Text style={styles.earningsValue}>
                  ${profile.weeklyEarnings.toFixed(2)}
                </Text>
              </View>
              <View style={styles.earningsCard}>
                <Text style={styles.earningsLabel}>This Month</Text>
                <Text style={styles.earningsValue}>
                  ${profile.monthlyEarnings.toFixed(2)}
                </Text>
              </View>
            </View>

            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Weekly Earnings (Last 8 Weeks)</Text>
              <SimpleBarChart data={profile.earningsHistory} />
            </View>
          </View>
        )}

        {/* Section D: Reports & Pay */}
        {activeSection === 'reports' && (
          <View style={styles.section}>
            {isContractor ? (
              // Tax Invoices
              <>
                <Text style={styles.reportsSectionTitle}>Tax Invoices</Text>
                {taxInvoices.map((invoice) => (
                  <View key={invoice.id} style={styles.reportCard}>
                    <View style={styles.reportHeader}>
                      <Text style={styles.reportNumber}>{invoice.invoiceNumber}</Text>
                      <TouchableOpacity
                        style={styles.downloadButton}
                        onPress={() => handleDownloadInvoice(invoice.id)}
                      >
                        <Ionicons name="download" size={18} color={COLORS.accent} />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.reportPeriod}>{invoice.period}</Text>
                    <View style={styles.reportDetails}>
                      <View style={styles.reportRow}>
                        <Text style={styles.reportLabel}>Runs Completed</Text>
                        <Text style={styles.reportValue}>{invoice.runsCompleted}</Text>
                      </View>
                      <View style={styles.reportRow}>
                        <Text style={styles.reportLabel}>Total Amount</Text>
                        <Text style={styles.reportValue}>
                          ${invoice.totalAmount.toFixed(2)}
                        </Text>
                      </View>
                      <View style={styles.reportRow}>
                        <Text style={styles.reportLabel}>GST</Text>
                        <Text style={styles.reportValue}>
                          ${invoice.gst.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </>
            ) : (
              // Payslips
              <>
                <Text style={styles.reportsSectionTitle}>Payslips</Text>
                {payslips.map((payslip) => (
                  <View key={payslip.id} style={styles.reportCard}>
                    <View style={styles.reportHeader}>
                      <Text style={styles.reportNumber}>{payslip.payPeriod}</Text>
                      <TouchableOpacity
                        style={styles.downloadButton}
                        onPress={() => handleDownloadPayslip(payslip.id)}
                      >
                        <Ionicons name="download" size={18} color={COLORS.accent} />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.reportDetails}>
                      <View style={styles.reportRow}>
                        <Text style={styles.reportLabel}>Gross Pay</Text>
                        <Text style={styles.reportValue}>
                          ${payslip.grossPay.toFixed(2)}
                        </Text>
                      </View>
                      <View style={styles.reportRow}>
                        <Text style={styles.reportLabel}>Tax Withheld</Text>
                        <Text style={styles.reportValue}>
                          -${payslip.taxWithheld.toFixed(2)}
                        </Text>
                      </View>
                      <View style={styles.reportRow}>
                        <Text style={styles.reportLabel}>Superannuation</Text>
                        <Text style={styles.reportValue}>
                          ${payslip.superannuation.toFixed(2)}
                        </Text>
                      </View>
                      <View style={styles.reportRow}>
                        <Text style={styles.reportLabelBold}>Net Pay</Text>
                        <Text style={styles.reportValueAccent}>
                          ${payslip.netPay.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </>
            )}
          </View>
        )}

        {/* Section E: Leave (Employees Only) */}
        {activeSection === 'leave' && !isContractor && (
          <View style={styles.section}>
            {/* Leave Balance Cards */}
            <View style={leaveStyles.balanceContainer}>
              <View style={leaveStyles.balanceCard}>
                <Text style={leaveStyles.balanceLabel}>Annual Leave</Text>
                <Text style={leaveStyles.balanceValue}>{leaveBalance.annual}</Text>
                <Text style={leaveStyles.balanceSubtext}>days left</Text>
              </View>
              <View style={leaveStyles.balanceCard}>
                <Text style={leaveStyles.balanceLabel}>Sick Leave</Text>
                <Text style={leaveStyles.balanceValue}>{leaveBalance.sick}</Text>
                <Text style={leaveStyles.balanceSubtext}>days left</Text>
              </View>
              <View style={leaveStyles.balanceCard}>
                <Text style={leaveStyles.balanceLabel}>Personal Leave</Text>
                <Text style={leaveStyles.balanceValue}>{leaveBalance.personal}</Text>
                <Text style={leaveStyles.balanceSubtext}>days left</Text>
              </View>
            </View>

            {/* Apply for Leave Button */}
            {!showLeaveForm && (
              <TouchableOpacity
                style={leaveStyles.applyButton}
                onPress={() => setShowLeaveForm(true)}
              >
                <Ionicons name="add-circle" size={20} color={COLORS.background} />
                <Text style={leaveStyles.applyButtonText}>Apply for Leave</Text>
              </TouchableOpacity>
            )}

            {/* Leave Application Form */}
            {showLeaveForm && (
              <View style={leaveStyles.formContainer}>
                <View style={leaveStyles.formHeader}>
                  <Text style={leaveStyles.formTitle}>Leave Application</Text>
                  <TouchableOpacity onPress={() => setShowLeaveForm(false)}>
                    <Ionicons name="close" size={24} color={COLORS.muted} />
                  </TouchableOpacity>
                </View>

                {/* Leave Type Selector */}
                <Text style={leaveStyles.inputLabel}>Leave Type</Text>
                <View style={leaveStyles.typeSelector}>
                  {(['annual', 'sick', 'personal', 'other'] as LeaveType[]).map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        leaveStyles.typeButton,
                        leaveType === type && leaveStyles.typeButtonActive,
                      ]}
                      onPress={() => setLeaveType(type)}
                    >
                      <Text
                        style={[
                          leaveStyles.typeButtonText,
                          leaveType === type && leaveStyles.typeButtonTextActive,
                        ]}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Date Inputs */}
                <Text style={leaveStyles.inputLabel}>Start Date</Text>
                <TextInput
                  style={leaveStyles.textInput}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor={COLORS.muted}
                  value={startDate}
                  onChangeText={setStartDate}
                />

                <Text style={leaveStyles.inputLabel}>End Date</Text>
                <TextInput
                  style={leaveStyles.textInput}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor={COLORS.muted}
                  value={endDate}
                  onChangeText={setEndDate}
                />

                {/* Duration Display */}
                {startDate && endDate && (
                  <Text style={leaveStyles.durationText}>
                    Duration: {calculateWorkingDays(startDate, endDate)} working days
                  </Text>
                )}

                {/* Reason Input */}
                <Text style={leaveStyles.inputLabel}>
                  Reason / Notes {(leaveType === 'sick' || leaveType === 'personal') && (
                    <Text style={leaveStyles.requiredText}>*required</Text>
                  )}
                </Text>
                <TextInput
                  style={[leaveStyles.textInput, leaveStyles.textArea]}
                  placeholder="Enter reason..."
                  placeholderTextColor={COLORS.muted}
                  value={leaveReason}
                  onChangeText={setLeaveReason}
                  multiline
                  numberOfLines={3}
                />

                {/* Submit Button */}
                <TouchableOpacity
                  style={leaveStyles.submitButton}
                  onPress={handleSubmitLeave}
                >
                  <Text style={leaveStyles.submitButtonText}>Submit Leave Request</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Leave Request History */}
            <Text style={leaveStyles.historyTitle}>Leave History</Text>
            {leaveHistory.map((request) => (
              <View key={request.id} style={leaveStyles.historyCard}>
                <View style={leaveStyles.historyHeader}>
                  <Text style={leaveStyles.historyType}>
                    {getLeaveTypeLabel(request.type)}
                  </Text>
                  <LeaveStatusBadge status={request.status} />
                </View>
                <Text style={leaveStyles.historyDates}>
                  {request.startDate} – {request.endDate}
                </Text>
                <Text style={leaveStyles.historyDuration}>
                  {request.duration} days
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Toast */}
      {showToast && (
        <View style={[styles.toast, { bottom: insets.bottom + 80 }]}>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl * 2,
  },
  profileCard: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatarContainer: {
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(128, 229, 203, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  profileName: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  contactText: {
    color: COLORS.muted,
    fontSize: 14,
  },
  employmentTypeContainer: {
    width: '100%',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  employmentLabel: {
    color: COLORS.muted,
    fontSize: 12,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  employmentToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.sm,
    padding: 4,
  },
  employmentOption: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm - 2,
    alignItems: 'center',
  },
  employmentOptionActive: {
    backgroundColor: COLORS.accent,
  },
  employmentOptionText: {
    color: COLORS.muted,
    fontSize: 14,
    fontWeight: '600',
  },
  employmentOptionTextActive: {
    color: COLORS.primary,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  alertText: {
    color: COLORS.error,
    fontSize: 14,
    fontWeight: '500',
  },
  sectionTabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.sm,
    padding: 4,
    marginBottom: SPACING.md,
  },
  sectionTab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm - 2,
    alignItems: 'center',
  },
  sectionTabActive: {
    backgroundColor: COLORS.accent,
  },
  sectionTabText: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTabTextActive: {
    color: COLORS.primary,
  },
  section: {
    marginBottom: SPACING.md,
  },
  earningsCards: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  earningsCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  earningsLabel: {
    color: COLORS.muted,
    fontSize: 12,
    marginBottom: SPACING.xs,
  },
  earningsValue: {
    color: COLORS.accent,
    fontSize: 24,
    fontWeight: '700',
  },
  chartContainer: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chartTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  reportsSectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  reportCard: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  reportNumber: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  downloadButton: {
    padding: SPACING.xs,
  },
  reportPeriod: {
    color: COLORS.muted,
    fontSize: 14,
    marginBottom: SPACING.sm,
  },
  reportDetails: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
  },
  reportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  reportLabel: {
    color: COLORS.muted,
    fontSize: 14,
  },
  reportLabelBold: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  reportValue: {
    color: COLORS.text,
    fontSize: 14,
  },
  reportValueAccent: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: '700',
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

const leaveStyles = StyleSheet.create({
  balanceContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  balanceCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  balanceLabel: {
    color: COLORS.muted,
    fontSize: 10,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  balanceValue: {
    color: COLORS.accent,
    fontSize: 24,
    fontWeight: '700',
  },
  balanceSubtext: {
    color: COLORS.muted,
    fontSize: 10,
  },
  applyButton: {
    backgroundColor: COLORS.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  applyButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '700',
  },
  formContainer: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  formTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
  },
  inputLabel: {
    color: COLORS.muted,
    fontSize: 12,
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
  },
  requiredText: {
    color: COLORS.error,
    fontSize: 10,
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  typeButton: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typeButtonActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  typeButtonText: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: COLORS.background,
  },
  textInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    color: COLORS.text,
    fontSize: 14,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  durationText: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: SPACING.xs,
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  submitButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '700',
  },
  historyTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  historyCard: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  historyType: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  historyDates: {
    color: COLORS.muted,
    fontSize: 14,
  },
  historyDuration: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '500',
    marginTop: SPACING.xs,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
