export interface Job {
  id: string;
  date: string;
  timeSlot: string;
  suburb: string;
  address: string;
  earnings: number;
  status: 'upcoming' | 'in_progress' | 'completed';
  patientName?: string;
}

export interface PatientStop {
  id: string;
  patientName: string;
  address: string;
  suburb: string;
  tubes: string[];
  accessories: string[];
  arrivedAt?: string;
  arrivedCoords?: { lat: number; lng: number };
  completedAt?: string;
  completedCoords?: { lat: number; lng: number };
  notes?: string;
}

export interface Runsheet {
  id: string;
  date: string;
  startTime: string;
  shiftStarted?: string;
  shiftStartedCoords?: { lat: number; lng: number };
  printablesRequired: boolean;
  printablesPickupAddress?: string;
  printablesCollected?: string;
  printablesCollectedCoords?: { lat: number; lng: number };
  checklistCompleted?: string;
  patientStops: PatientStop[];
  dropOffAddress: string;
  dropOffLocation: string;
  specimensDroppedOff?: string;
  specimensDroppedOffCoords?: { lat: number; lng: number };
}

export interface Document {
  id: string;
  name: string;
  type: string;
  expiryDate: string;
  status: 'valid' | 'expiring_soon' | 'expired';
  fileUrl?: string;
}

export interface Profile {
  id: string;
  name: string;
  photoUrl?: string;
  phone: string;
  email: string;
  employmentType: 'independent_contractor' | 'full_time_employee';
  documents: Document[];
  weeklyEarnings: number;
  monthlyEarnings: number;
  earningsHistory: { week: string; amount: number }[];
}

export interface SliderAction {
  action: string;
  timestamp: string;
  coordinates?: { lat: number; lng: number };
}
