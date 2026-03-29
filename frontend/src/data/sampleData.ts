import { Job, PatientStop, Runsheet, Profile, Document, LeaveBalance, LeaveRequest } from '../types';
import { format, addDays, subDays, startOfWeek } from 'date-fns';

const today = new Date();
const weekStart = startOfWeek(today, { weekStartsOn: 1 });

// Generate weekly jobs
export const generateWeeklyJobs = (weekStartDate: Date): Job[] => {
  const jobs: Job[] = [];
  const suburbs = [
    'Paddington',
    'New Farm',
    'Fortitude Valley',
    'Woolloongabba',
    'West End',
    'Kangaroo Point',
  ];

  for (let i = 0; i < 7; i++) {
    const jobDate = addDays(weekStartDate, i);
    const isPast = jobDate < today && format(jobDate, 'yyyy-MM-dd') !== format(today, 'yyyy-MM-dd');
    const isToday = format(jobDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');

    if (i !== 5 && i !== 6) { // Skip weekends
      jobs.push({
        id: `job-${i + 1}`,
        date: format(jobDate, 'EEE, dd MMM'),
        fullDate: jobDate,
        timeSlot: '7:00 AM – 11:30 AM',
        suburb: suburbs[i % suburbs.length],
        address: `${10 + i * 23} ${suburbs[i % suburbs.length]} Street, ${suburbs[i % suburbs.length]} QLD 400${i}`,
        earnings: 48 + i * 7,
        status: isPast ? 'completed' : isToday ? 'in_progress' : 'upcoming',
      });
    }
  }

  return jobs;
};

// Today's patient stops
export const todaysPatientStops: PatientStop[] = [
  {
    id: 'stop-1',
    patientName: 'Margaret Thompson',
    address: '42 Latrobe Terrace, Paddington QLD 4064',
    suburb: 'Paddington',
    tubes: ['2x EDTA Purple', '1x SST Gold', '1x Sodium Citrate Blue'],
    accessories: ['21G needle', 'Tourniquet', 'Alcohol wipes', 'Gauze', 'Bandaid'],
  },
  {
    id: 'stop-2',
    patientName: 'Robert Chen',
    address: '15 Brunswick Street, New Farm QLD 4005',
    suburb: 'New Farm',
    tubes: ['1x EDTA Purple', '2x SST Gold'],
    accessories: ['23G butterfly needle', 'Tourniquet', 'Alcohol wipes', 'Gauze', 'Bandaid'],
  },
  {
    id: 'stop-3',
    patientName: 'Jessica Williams',
    address: '78 Commercial Road, Teneriffe QLD 4005',
    suburb: 'Teneriffe',
    tubes: ['3x EDTA Purple', '1x Lithium Heparin Green'],
    accessories: ['21G needle', 'Tourniquet', 'Alcohol wipes', 'Gauze', 'Bandaid', 'Cold pack'],
  },
  {
    id: 'stop-4',
    patientName: 'David Morrison',
    address: '203 Given Terrace, Paddington QLD 4064',
    suburb: 'Paddington',
    tubes: ['1x EDTA Purple', '1x SST Gold', '1x Sodium Fluoride Grey'],
    accessories: ['21G needle', 'Tourniquet', 'Alcohol wipes', 'Gauze', 'Bandaid'],
  },
];

// Today's runsheet
export const todaysRunsheet: Runsheet = {
  id: 'runsheet-today',
  date: format(today, 'EEEE, dd MMMM'),
  startTime: '7:00 AM',
  printablesRequired: true,
  printablesPickupAddress: 'Sullivan Nicolaides, 24 Bowen Bridge Rd, Bowen Hills QLD 4006',
  patientStops: todaysPatientStops,
  dropOffAddress: '24 Bowen Bridge Road, Bowen Hills QLD 4006',
  dropOffLocation: 'Sullivan Nicolaides Pathology',
};

// Profile documents
export const profileDocuments: Document[] = [
  {
    id: 'doc-1',
    name: 'Police Check',
    type: 'police_check',
    expiryDate: format(addDays(today, 180), 'dd MMM yyyy'),
    status: 'valid',
    icon: '🔵',
  },
  {
    id: 'doc-2',
    name: 'Working With Children Check',
    type: 'wwcc',
    expiryDate: format(addDays(today, 25), 'dd MMM yyyy'),
    status: 'expiring_soon',
    icon: '🟡',
  },
  {
    id: 'doc-3',
    name: 'Phlebotomy Certificate',
    type: 'phlebotomy_cert',
    expiryDate: format(addDays(today, 365), 'dd MMM yyyy'),
    status: 'valid',
    icon: '🩺',
  },
  {
    id: 'doc-4',
    name: "Driver's Licence",
    type: 'drivers_licence',
    expiryDate: format(addDays(today, 730), 'dd MMM yyyy'),
    status: 'valid',
    icon: '🪪',
  },
  {
    id: 'doc-5',
    name: 'Public Liability Insurance',
    type: 'insurance',
    expiryDate: format(subDays(today, 10), 'dd MMM yyyy'),
    status: 'expired',
    icon: '🛡️',
  },
  {
    id: 'doc-6',
    name: 'ABN',
    type: 'abn',
    expiryDate: 'No expiry',
    status: 'valid',
    icon: '🔢',
  },
];

// Earnings history
const earningsHistory = [
  { week: 'W1', amount: 624 },
  { week: 'W2', amount: 712 },
  { week: 'W3', amount: 568 },
  { week: 'W4', amount: 695 },
  { week: 'W5', amount: 754 },
  { week: 'W6', amount: 648 },
  { week: 'W7', amount: 702 },
  { week: 'W8', amount: 678 },
];

// Sarah Chen's profile
export const sarahChenProfile: Profile = {
  id: 'user-1',
  name: 'Sarah Chen',
  phone: '+61 412 345 678',
  email: 'sarah.chen@nurahealth.com.au',
  employmentType: 'independent_contractor',
  documents: profileDocuments,
  weeklyEarnings: 678,
  monthlyEarnings: 2734,
  earningsHistory,
};

// Tax invoices for contractors
export const taxInvoices = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2026-008',
    period: '1–14 Mar 2026',
    runsCompleted: 12,
    totalAmount: 624.00,
    gst: 56.73,
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2026-007',
    period: '15–28 Feb 2026',
    runsCompleted: 14,
    totalAmount: 712.00,
    gst: 64.73,
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-2026-006',
    period: '1–14 Feb 2026',
    runsCompleted: 11,
    totalAmount: 568.00,
    gst: 51.64,
  },
];

// Payslips for employees
export const payslips = [
  {
    id: 'pay-1',
    payPeriod: '15–28 Mar 2026',
    grossPay: 1248.00,
    taxWithheld: 187.20,
    superannuation: 130.03,
    netPay: 1060.80,
  },
  {
    id: 'pay-2',
    payPeriod: '1–14 Mar 2026',
    grossPay: 1424.00,
    taxWithheld: 213.60,
    superannuation: 148.50,
    netPay: 1210.40,
  },
];

// Leave balances
export const leaveBalance: LeaveBalance = {
  annual: 12.5,
  sick: 8,
  personal: 2,
};

// Leave request history
export const leaveRequests: LeaveRequest[] = [
  {
    id: 'leave-1',
    type: 'annual',
    startDate: '14 Apr 2026',
    endDate: '18 Apr 2026',
    duration: 5,
    status: 'pending',
  },
  {
    id: 'leave-2',
    type: 'annual',
    startDate: '23 Dec 2025',
    endDate: '24 Dec 2025',
    duration: 2,
    status: 'approved',
  },
];
