import api from '../utils/api';

export type ComplaintStatus = 'pending' | 'in_progress' | 'resolved';

export interface ComplaintPayload {
  name: string;
  mobile: string;
  message: string;
}

export interface ComplaintReceipt {
  id: string;
  /** Human-readable tracking id, e.g. "CMP-2026-0001". */
  trackingNumber: string;
  status: ComplaintStatus;
  createdAt: string;
}

export interface ComplaintStatusEvent {
  status: ComplaintStatus;
  at: string;
}

/**
 * A tracked complaint. Note the absence of `mobile` — the backend withholds it
 * because tracking numbers are sequential and therefore guessable.
 */
export interface TrackedComplaint {
  _id: string;
  trackingNumber: string;
  name: string;
  message: string;
  status: ComplaintStatus;
  statusHistory: ComplaintStatusEvent[];
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Submit a complaint to the society office. It lands in the admin panel's
 * complaints queue; the returned tracking number is how the resident checks back.
 */
export const submitComplaint = async (
  payload: ComplaintPayload,
): Promise<ComplaintReceipt> => {
  const res: any = await api.post('/complaints', payload);
  if (res.success) return res.data as ComplaintReceipt;
  throw new Error(res?.message || 'Failed to submit complaint');
};

/** Look up one complaint's current status by its tracking number. */
export const trackComplaint = async (trackingNumber: string): Promise<TrackedComplaint> => {
  const res: any = await api.get(
    `/complaints/track/${encodeURIComponent(trackingNumber.trim())}`,
  );
  if (res.success) return res.data as TrackedComplaint;
  throw new Error(res?.message || 'Could not find that complaint');
};

// ─── Device-local record of submissions ──────────────────────────────────────
// The portal is one shared account, so the server cannot tell residents apart.
// We remember tracking numbers submitted from THIS browser so the resident gets
// a list of their own complaints without exposing anyone else's.

const STORAGE_KEY = 'kkb4_my_complaints';
const MAX_REMEMBERED = 30;

export interface RememberedComplaint {
  trackingNumber: string;
  name: string;
  message: string;
  createdAt: string;
}

export const getMyComplaints = (): RememberedComplaint[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const rememberComplaint = (entry: RememberedComplaint): void => {
  if (typeof window === 'undefined') return;
  try {
    const existing = getMyComplaints().filter(
      (c) => c.trackingNumber !== entry.trackingNumber,
    );
    const next = [entry, ...existing].slice(0, MAX_REMEMBERED);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch { /* quota or privacy mode — the lookup box still works */ }
};

export const forgetComplaint = (trackingNumber: string): void => {
  if (typeof window === 'undefined') return;
  try {
    const next = getMyComplaints().filter((c) => c.trackingNumber !== trackingNumber);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch { /* ignore */ }
};
