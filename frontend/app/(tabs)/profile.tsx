import React, { useState } from 'react';
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
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { NuraLogo } from '../../src/components/NuraLogo';
import { DocumentCard } from '../../src/components/DocumentCard';
import {
  sarahChenProfile,
  taxInvoices,
  payslips,
} from '../../src/data/sampleData';

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
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 4,
  },
  barValue: {
    color: COLORS.text,
    fontSize: 9,
    marginTop: 2,
  },
});

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState(sarahChenProfile);
  const [activeSection, setActiveSection] = useState<'documents' | 'earnings' | 'reports'>('documents');

  const toggleEmploymentType = () => {
    setProfile({
      ...profile,
      employmentType:
        profile.employmentType === 'independent_contractor'
          ? 'full_time_employee'
          : 'independent_contractor',
    });
  };

  const handleDocumentUpload = (docId: string) => {
    Alert.alert('Upload Document', 'Document upload functionality would open here.');
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

  // Chart data is directly used from profile.earningsHistory

  const isContractor = profile.employmentType === 'independent_contractor';
  const contractorDocs = profile.documents.filter(
    (doc) => doc.type !== 'insurance' && doc.type !== 'abn'
  );
  const allDocs = isContractor ? profile.documents : contractorDocs;

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
            <Ionicons name="call" size={16} color={COLORS.textSecondary} />
            <Text style={styles.contactText}>{profile.phone}</Text>
          </View>
          <View style={styles.contactRow}>
            <Ionicons name="mail" size={16} color={COLORS.textSecondary} />
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
        </View>

        {/* Section B: Documents */}
        {activeSection === 'documents' && (
          <View style={styles.section}>
            {allDocs.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onUpload={() => handleDocumentUpload(doc.id)}
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl * 2,
  },
  profileCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(128, 229, 203, 0.2)',
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
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  employmentTypeContainer: {
    width: '100%',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 229, 203, 0.2)',
  },
  employmentLabel: {
    color: COLORS.textSecondary,
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
    color: COLORS.textSecondary,
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
    backgroundColor: COLORS.cardBackground,
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
    color: COLORS.textSecondary,
    fontSize: 13,
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
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(128, 229, 203, 0.2)',
  },
  earningsLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: SPACING.xs,
  },
  earningsValue: {
    color: COLORS.accent,
    fontSize: 24,
    fontWeight: '700',
  },
  chartContainer: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(128, 229, 203, 0.2)',
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
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(128, 229, 203, 0.2)',
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
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: SPACING.sm,
  },
  reportDetails: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 229, 203, 0.2)',
    paddingTop: SPACING.sm,
  },
  reportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  reportLabel: {
    color: COLORS.textSecondary,
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
});
