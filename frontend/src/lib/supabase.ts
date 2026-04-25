import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

// ============================================
// CLIENT SETUP
// ============================================
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
  },
});

// Storage bucket name — case-sensitive
export const STORAGE_BUCKET = 'Collector-documents';
export const PRESCRIPTIONS_BUCKET = 'Prescriptions';

// Drop-off location constant (not stored in patient_bookings)
export const DROP_OFF_LOCATION = 'Sullivan Nicolaides Pathology';
export const DROP_OFF_ADDRESS = '24 Bowen Bridge Road, Bowen Hills QLD 4006';

// Event type mapping for runsheet events
export const RUNSHEET_EVENT_TYPES = {
  SHIFT_START: 'shift_start',
  PRINTABLES_COLLECTED: 'printables_collected',
  CHECKLIST_COMPLETE: 'checklist_complete',
  ARRIVED_AT_STOP: 'arrived_at_stop',
  COLLECTION_COMPLETE: 'collection_complete',
  SPECIMENS_DROPPED_OFF: 'specimens_dropped_off',
} as const;

// Error logging helper
const logError = (context: string, error: any) => {
  console.error(`[Nura Supabase Error] ${context}:`, error);
};

// Brisbane timezone helper
export function getBrisbaneToday(): string {
  const now = new Date();
  const brisbane = toZonedTime(now, 'Australia/Brisbane');
  return format(brisbane, 'yyyy-MM-dd');
}

// ============================================
// TYPES
// ============================================
export interface Collector {
  id: string;
  auth_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  status: string;
}

export interface Booking {
  id: string;
  collector_id: string;
  first_name: string;
  last_name: string;
  address: string;
  phone: string | null;
  scheduled_date: string;
  scheduled_time: string | null;
  status: string;
  special_notes: string | null;
  referral_uploaded: boolean | null;
}

export interface RunsheetEvent {
  id: string;
  job_id: string;
  collector_id: string;
  event_type: string;
  event_timestamp: string;
  stop_id: string | null;
}

// ============================================
// AUTH
// ============================================
export const signIn = async (
  email: string,
  password: string
): Promise<{ error: string | null }> => {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    logError('signIn', error);
    return { error: error.message };
  }
  return { error: null };
};

export const signOut = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) logError('signOut', error);
};

export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) logError('getSession', error);
  return data.session;
};

// ============================================
// COLLECTOR
// ============================================
export const getCurrentCollector = async (): Promise<Collector | null> => {
  const session = await getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from('collectors')
    .select('id, auth_id, first_name, last_name, email, phone, status')
    .eq('auth_id', session.user.id)
    .single();

  if (error) {
    logError('getCurrentCollector', error);
    return null;
  }
  return data as Collector;
};

// ============================================
// BOOKINGS
// ============================================
export const getWeekBookings = async (
  startISO: string,
  endISO: string
): Promise<Booking[]> => {
  const { data, error } = await supabase
    .from('patient_bookings')
    .select(
      'id, collector_id, first_name, last_name, address, phone, scheduled_date, scheduled_time, status, special_notes, referral_uploaded'
    )
    .gte('scheduled_date', startISO)
    .lte('scheduled_date', endISO)
    .order('scheduled_date', { ascending: true })
    .order('scheduled_time', { ascending: true });

  if (error) {
    logError('getWeekBookings', error);
    return [];
  }
  return (data ?? []) as Booking[];
};

export const getTodaysBookings = async (dateISO: string): Promise<Booking[]> => {
  const { data, error } = await supabase
    .from('patient_bookings')
    .select(
      'id, collector_id, first_name, last_name, address, phone, scheduled_date, scheduled_time, status, special_notes, referral_uploaded'
    )
    .eq('scheduled_date', dateISO)
    .in('status', ['confirmed', 'assigned'])
    .order('scheduled_time', { ascending: true });

  if (error) {
    logError('getTodaysBookings', error);
    return [];
  }
  return (data ?? []) as Booking[];
};

// ============================================
// RUNSHEET EVENTS
// ============================================
export const getTodaysEvents = async (dateISO: string): Promise<RunsheetEvent[]> => {
  const { data, error } = await supabase
    .from('runsheet_events')
    .select('id, job_id, collector_id, event_type, event_timestamp, stop_id')
    .gte('event_timestamp', `${dateISO}T00:00:00`)
    .lte('event_timestamp', `${dateISO}T23:59:59`)
    .order('event_timestamp', { ascending: true });

  if (error) {
    logError('getTodaysEvents', error);
    return [];
  }
  return (data ?? []) as RunsheetEvent[];
};

// ============================================
// JOBS (synthetic daily job row)
// ============================================
export const getOrCreateTodaysJob = async (dateISO: string): Promise<string | null> => {
  const collector = await getCurrentCollector();
  if (!collector) return null;

  // Check for existing job today
  const { data: existing, error: fetchError } = await supabase
    .from('jobs')
    .select('id')
    .eq('collector_id', collector.id)
    .eq('scheduled_date', dateISO)
    .maybeSingle();

  if (fetchError) {
    logError('getOrCreateTodaysJob - fetch', fetchError);
    return null;
  }

  if (existing) return existing.id;

  // Create new job row
  const { data: created, error: insertError } = await supabase
    .from('jobs')
    .insert({
      collector_id: collector.id,
      scheduled_date: dateISO,
      status: 'in_progress',
    })
    .select('id')
    .single();

  if (insertError) {
    logError('getOrCreateTodaysJob - insert', insertError);
    return null;
  }

  return created.id;
};

export const insertRunsheetEvent = async (
  eventType: string,
  stopId: string | null = null
): Promise<boolean> => {
  const dateISO = getBrisbaneToday();
  const jobId = await getOrCreateTodaysJob(dateISO);
  if (!jobId) {
    logError('insertRunsheetEvent', 'No job ID available');
    return false;
  }

  const collector = await getCurrentCollector();
  if (!collector) {
    logError('insertRunsheetEvent', 'No collector found');
    return false;
  }

  const { error } = await supabase.from('runsheet_events').insert({
    job_id: jobId,
    collector_id: collector.id,
    event_type: eventType,
    event_timestamp: new Date().toISOString(),
    stop_id: stopId,
  });

  if (error) {
    logError('insertRunsheetEvent', error);
    return false;
  }
  console.log(`[Nura Supabase] Runsheet event recorded: ${eventType}`);
  return true;
};

// ============================================
// PRESCRIPTIONS
// ============================================
export const getPrescriptionUrl = async (bookingId: string): Promise<string | null> => {
  const { data, error } = await supabase.storage
    .from(PRESCRIPTIONS_BUCKET)
    .createSignedUrl(`${bookingId}.pdf`, 60 * 60 * 24); // 24h

  if (error) {
    logError('getPrescriptionUrl', error);
    return null;
  }
  return data?.signedUrl ?? null;
};

// ============================================
// AVAILABILITY
// ============================================
export interface AvailabilityDay {
  date: Date;
  slot: string;
}

export const insertAvailability = async (
  days: AvailabilityDay[],
  weekStart: Date
): Promise<{ success: boolean; error?: string }> => {
  const collector = await getCurrentCollector();
  if (!collector) {
    return { success: false, error: 'Not signed in' };
  }

  const records = days.map((day) => ({
    collector_id: collector.id,
    available_date: day.date.toISOString().split('T')[0],
    slot: day.slot,
    week_start: weekStart.toISOString().split('T')[0],
    submitted: true,
    submitted_at: new Date().toISOString(),
  }));

  const { error } = await supabase.from('availability').insert(records);

  if (error) {
    logError('insertAvailability', error);
    return { success: false, error: 'Failed to save — please try again' };
  }
  console.log(`[Nura Supabase] Availability submitted: ${records.length} days`);
  return { success: true };
};

// ============================================
// DOCUMENT UPLOADS
// ============================================
export const uploadDocument = async (
  file: { uri: string; name: string; type: string },
  documentType: string
): Promise<{ success: boolean; fileUrl?: string; error?: string }> => {
  const collector = await getCurrentCollector();
  if (!collector) {
    return { success: false, error: 'Not signed in' };
  }

  const filePath = `${collector.id}/${documentType}/${file.name}`;

  const response = await fetch(file.uri);
  const blob = await response.blob();

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, blob, { contentType: file.type, upsert: true });

  if (uploadError) {
    logError('uploadDocument - storage', uploadError);
    return { success: false, error: 'Upload failed — please try again' };
  }

  const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
  const fileUrl = urlData?.publicUrl || '';

  const { error: insertError } = await supabase.from('documents').insert({
    collector_id: collector.id,
    document_type: documentType,
    file_url: fileUrl,
    file_name: file.name,
    status: 'pending_review',
  });

  if (insertError) {
    logError('uploadDocument - insert', insertError);
    return { success: false, error: 'Upload failed — please try again' };
  }

  console.log(`[Nura Supabase] Document uploaded: ${file.name}`);
  return { success: true, fileUrl };
};

// ============================================
// LEAVE REQUESTS
// ============================================
export const insertLeaveRequest = async (
  leaveType: string,
  startDate: string,
  endDate: string,
  workingDays: number,
  reason?: string
): Promise<{ success: boolean; error?: string }> => {
  const collector = await getCurrentCollector();
  if (!collector) {
    return { success: false, error: 'Not signed in' };
  }

  const { error } = await supabase.from('leave_requests').insert({
    collector_id: collector.id,
    leave_type: leaveType,
    start_date: startDate,
    end_date: endDate,
    working_days: workingDays,
    reason: reason || null,
    status: 'pending',
    submitted_at: new Date().toISOString(),
  });

  if (error) {
    logError('insertLeaveRequest', error);
    return { success: false, error: 'Failed to submit — please try again' };
  }
  console.log(`[Nura Supabase] Leave request submitted: ${leaveType}`);
  return { success: true };
};
