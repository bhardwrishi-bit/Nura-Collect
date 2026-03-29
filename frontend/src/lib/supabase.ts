import { createClient } from '@supabase/supabase-js';

// Supabase Configuration
const SUPABASE_URL = 'https://yxoqvzypgvkdabqnwacs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4b3F2enlwZ3ZrZGFicW53YWNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3NzAzODUsImV4cCI6MjA5MDM0NjM4NX0.ilvfIOE-xLa_UnECHBr1SubljFTDHKqP_Ubbf00fJXQ';

// Hardcoded test UUIDs for now
export const TEST_JOB_ID = '00000000-0000-0000-0000-000000000001';
export const TEST_COLLECTOR_ID = '00000000-0000-0000-0000-000000000002';

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Storage bucket name
export const STORAGE_BUCKET = 'collector-documents';

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

// ============================================
// RUNSHEET EVENTS
// ============================================
export const insertRunsheetEvent = async (
  eventType: string,
  stopId: string | null = null
): Promise<boolean> => {
  try {
    const { error } = await supabase.from('runsheet_events').insert({
      job_id: TEST_JOB_ID,
      collector_id: TEST_COLLECTOR_ID,
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
  } catch (err) {
    logError('insertRunsheetEvent', err);
    return false;
  }
};

// ============================================
// AVAILABILITY
// ============================================
export interface AvailabilityDay {
  date: Date;
  slot: string; // 'full_day', 'am_only', 'pm_only', 'unavailable'
}

export const insertAvailability = async (
  days: AvailabilityDay[],
  weekStart: Date
): Promise<{ success: boolean; error?: string }> => {
  try {
    const records = days.map((day) => ({
      collector_id: TEST_COLLECTOR_ID,
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
  } catch (err) {
    logError('insertAvailability', err);
    return { success: false, error: 'Failed to save — please try again' };
  }
};

// ============================================
// DOCUMENT UPLOADS
// ============================================
export const uploadDocument = async (
  file: { uri: string; name: string; type: string },
  documentType: string
): Promise<{ success: boolean; fileUrl?: string; error?: string }> => {
  try {
    // Create file path
    const filePath = `${TEST_COLLECTOR_ID}/${documentType}/${file.name}`;

    // Fetch the file as blob for upload
    const response = await fetch(file.uri);
    const blob = await response.blob();

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, blob, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      logError('uploadDocument - storage', uploadError);
      return { success: false, error: 'Upload failed — please try again' };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    const fileUrl = urlData?.publicUrl || '';

    // Insert document record
    const { error: insertError } = await supabase.from('documents').insert({
      collector_id: TEST_COLLECTOR_ID,
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
  } catch (err) {
    logError('uploadDocument', err);
    return { success: false, error: 'Upload failed — please try again' };
  }
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
  try {
    const { error } = await supabase.from('leave_requests').insert({
      collector_id: TEST_COLLECTOR_ID,
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
  } catch (err) {
    logError('insertLeaveRequest', err);
    return { success: false, error: 'Failed to submit — please try again' };
  }
};
