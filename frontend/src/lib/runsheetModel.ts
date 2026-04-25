import { format } from 'date-fns';
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';
import {
  getTodaysBookings,
  getTodaysEvents,
  getBrisbaneToday,
  RUNSHEET_EVENT_TYPES,
} from './supabase';
import { PatientStop } from '../types';

const BRISBANE_TZ = 'Australia/Brisbane';

export interface RunsheetState {
  date: string;
  shiftStarted: string | null;
  printablesCollected: string | null;
  checklistCompleted: string | null;
  specimensDroppedOff: string | null;
  patientStops: PatientStop[];
}

function extractSuburb(address: string): string {
  const match = address.match(/,\s+([^,]+)\s+QLD\s+\d{4}/i);
  return match ? match[1].trim() : '';
}

function fmtEventTime(isoTimestamp: string): string {
  return formatInTimeZone(new Date(isoTimestamp), BRISBANE_TZ, 'h:mm a');
}

export async function buildRunsheetForToday(): Promise<RunsheetState> {
  const todayISO = getBrisbaneToday();

  const [bookings, events] = await Promise.all([
    getTodaysBookings(todayISO),
    getTodaysEvents(todayISO),
  ]);

  const findEventTime = (eventType: string): string | null => {
    const event = events.find((e) => e.event_type === eventType);
    return event ? fmtEventTime(event.event_timestamp) : null;
  };

  const patientStops: PatientStop[] = bookings.map((booking) => {
    const arrivedEvent = events.find(
      (e) => e.event_type === RUNSHEET_EVENT_TYPES.ARRIVED_AT_STOP && e.stop_id === booking.id
    );
    const completedEvent = events.find(
      (e) => e.event_type === RUNSHEET_EVENT_TYPES.COLLECTION_COMPLETE && e.stop_id === booking.id
    );

    // Format scheduled_time (stored as HH:MM:SS) to h:mm a
    let displayTime: string | undefined;
    if (booking.scheduled_time) {
      const [h, m] = booking.scheduled_time.split(':').map(Number);
      const d = new Date();
      d.setHours(h, m, 0, 0);
      displayTime = format(d, 'h:mm a');
    }

    return {
      id: booking.id,
      patientName: `${booking.first_name} ${booking.last_name}`,
      address: booking.address,
      suburb: extractSuburb(booking.address),
      time: displayTime,
      phone: booking.phone ?? undefined,
      specialNotes: booking.special_notes ?? undefined,
      referralUploaded: booking.referral_uploaded ?? undefined,
      tubes: [],
      accessories: [],
      arrivedAt: arrivedEvent ? fmtEventTime(arrivedEvent.event_timestamp) : undefined,
      completedAt: completedEvent ? fmtEventTime(completedEvent.event_timestamp) : undefined,
    };
  });

  const brisbaneNow = toZonedTime(new Date(), BRISBANE_TZ);
  const date = format(brisbaneNow, 'EEEE, dd MMMM yyyy');

  return {
    date,
    shiftStarted: findEventTime(RUNSHEET_EVENT_TYPES.SHIFT_START),
    printablesCollected: findEventTime(RUNSHEET_EVENT_TYPES.PRINTABLES_COLLECTED),
    checklistCompleted: findEventTime(RUNSHEET_EVENT_TYPES.CHECKLIST_COMPLETE),
    specimensDroppedOff: findEventTime(RUNSHEET_EVENT_TYPES.SPECIMENS_DROPPED_OFF),
    patientStops,
  };
}
