import { Job, PatientStop, Runsheet, Profile, Document } from '../types';
import { format, addDays, subDays, startOfWeek } from 'date-fns';

const today = new Date();
const weekStart = startOfWeek(today, { weekStartsOn: 1 });

// Generate weekly jobs
export const generateWeeklyJobs = (): Job[] => {
  const jobs: Job[] = [];
  const suburbs = [
    'Paddington',
    'New Farm',
    'Fortitude Valley',
    'Woolloongabba',
    'West End',
    'Kangaroo Point',
    'South Brisbane',
    'Teneriffe',
  ];

  for (let i = 0; i < 7; i++) {
    const jobDate = addDays(weekStart, i);
    const isPast = jobDate < today;
    const isToday = format(jobDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');

    if (i !== 5 && i !== 6) { // Skip weekends
      jobs.push({
        id: `job-${i + 1}`,
        date: format(jobDate, 'EEE, dd MMM'),
        timeSlot: '7:00 AM - 11:30 AM',
        suburb: suburbs[i % suburbs.length],
        address: `${Math.floor(Math.random() * 200) + 1} ${suburbs[i % suburbs.length]} Street, ${suburbs[i % suburbs.length]} QLD 4000`,
        earnings: 48 + Math.floor(Math.random() * 20),
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
    accessories: ['21G needle', 'tourniquet', 'alcohol wipes', 'gauze', 'bandaid'],
  },
  {
    id: 'stop-2',
    patientName: 'Robert Chen',
    address: '15 Brunswick Street, New Farm QLD 4005',
    suburb: 'New Farm',
    tubes: ['1x EDTA Purple', '2x SST Gold'],
    accessories: ['23G butterfly needle', 'tourniquet', 'alcohol wipes', 'gauze', 'bandaid'],
  },
  {
    id: 'stop-3',
    patientName: 'Jessica Williams',
    address: '78 Commercial Road, Teneriffe QLD 4005',
    suburb: 'Teneriffe',
    tubes: ['3x EDTA Purple', '1x Lithium Heparin Green'],
    accessories: ['21G needle', 'tourniquet', 'alcohol wipes', 'gauze', 'bandaid', 'cold pack'],
  },
  {
    id: 'stop-4',
    patientName: 'David Morrison',
    address: '203 Given Terrace, Paddington QLD 4064',
    suburb: 'Paddington',
    tubes: ['1x EDTA Purple', '1x SST Gold', '1x Sodium Fluoride Grey'],
    accessories: ['21G needle', 'tourniquet', 'alcohol wipes', 'gauze', 'bandaid'],
  },
];

// Today's runsheet
export const todaysRunsheet: Runsheet = {
  id: 'runsheet-today',
  date: format(today, 'EEEE, dd MMMM yyyy'),
  startTime: '7:00 AM',
  printablesRequired: true,
  printablesPickupAddress: '123 Ann Street, Brisbane City QLD 4000',
  patientStops: todaysPatientStops,
  dropOffAddress: 'Sullivan Nicolaides Pathology, 24 Bowen Bridge Road, Bowen Hills QLD 4006',
  dropOffLocation: 'Sullivan Nicolaides Pathology, Bowen Hills',
};

// Profile documents
export const profileDocuments: Document[] = [
  {
    id: 'doc-1',
    name: 'Police Check',
    type: 'police_check',
    expiryDate: format(addDays(today, 180), 'dd MMM yyyy'),
    status: 'valid',
  },
  {
    id: 'doc-2',
    name: 'Working With Children Check',
    type: 'wwcc',
    expiryDate: format(addDays(today, 25), 'dd MMM yyyy'),
    status: 'expiring_soon',
  },
  {
    id: 'doc-3',
    name: 'Phlebotomy Certificate',
    type: 'phlebotomy_cert',
    expiryDate: format(addDays(today, 365), 'dd MMM yyyy'),
    status: 'valid',
  },
  {
    id: 'doc-4',
    name: "Driver's Licence",
    type: 'drivers_licence',
    expiryDate: format(addDays(today, 730), 'dd MMM yyyy'),
    status: 'valid',
  },
  {
    id: 'doc-5',
    name: 'Public Liability Insurance',
    type: 'insurance',
    expiryDate: format(subDays(today, 10), 'dd MMM yyyy'),
    status: 'expired',
  },
  {
    id: 'doc-6',
    name: 'ABN',
    type: 'abn',
    expiryDate: 'N/A',
    status: 'valid',
  },
];

// Earnings history
const earningsHistory = [
  { week: 'Week 1', amount: 624 },
  { week: 'Week 2', amount: 712 },
  { week: 'Week 3', amount: 568 },
  { week: 'Week 4', amount: 695 },
  { week: 'Week 5', amount: 754 },
  { week: 'Week 6', amount: 648 },
  { week: 'Week 7', amount: 702 },
  { week: 'Week 8', amount: 678 },
];

// Sarah Chen's profile
export const sarahChenProfile: Profile = {
  id: 'user-1',
  name: 'Sarah Chen',
  phone: '+61 412 345 678',
  email: 'sarah.chen@email.com',
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
    invoiceNumber: 'INV-2024-001',
    period: '1-14 Jul 2025',
    runsCompleted: 12,
    totalAmount: 624.00,
    gst: 56.73,
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2024-002',
    period: '15-28 Jul 2025',
    runsCompleted: 14,
    totalAmount: 712.00,
    gst: 64.73,
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-2024-003',
    period: '29 Jul - 11 Aug 2025',
    runsCompleted: 11,
    totalAmount: 568.00,
    gst: 51.64,
  },
];

// Payslips for employees
export const payslips = [
  {
    id: 'pay-1',
    payPeriod: '1-14 Jul 2025',
    grossPay: 1248.00,
    taxWithheld: 187.20,
    superannuation: 130.03,
    netPay: 1060.80,
  },
  {
    id: 'pay-2',
    payPeriod: '15-28 Jul 2025',
    grossPay: 1424.00,
    taxWithheld: 213.60,
    superannuation: 148.50,
    netPay: 1210.40,
  },
];
