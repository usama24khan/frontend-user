import api, { API_URL } from '../utils/api';
import type { ResidentProfile } from '../store/slices/authSlice';

export interface ResidentLoginPayload {
  plotNumber: string;
  block: string;
  credential: string; // CNIC or phone — backend matches both fields after digit normalization
}

export interface ResidentLoginResult {
  plot: ResidentProfile;
  accessToken: string;
  refreshToken: string;
}

/**
 * Authenticate a resident by plot number + block + CNIC/phone.
 */
export const residentLogin = async (
  payload: ResidentLoginPayload,
): Promise<ResidentLoginResult> => {
  const res: any = await api.post('/resident-auth/login', payload);
  if (res.success) return res.data as ResidentLoginResult;
  throw new Error(res?.message || 'Login failed');
};

/**
 * Fetch the currently-authenticated resident's plot + payment history.
 */
export const residentMe = async () => {
  const res: any = await api.get('/resident-auth/me');
  if (res.success) return res.data;
  throw new Error(res?.message || 'Failed to fetch profile');
};

export interface ResidentNotice {
  _id: string;
  type: 'plot' | 'block' | 'phase';
  targetId: string;
  targetLabel?: string;
  year: number;
  yearFrom?: number;
  yearTo?: number;
  language?: 'en' | 'ur';
  paymentDeadline?: string | null;
  plotCount: number;
  totalDue: number;
  pdfPath: string;
  pdfPaths?: string[];
  createdAt: string;
}

/**
 * List notices that apply to the resident's plot (plot-scoped, plus any
 * block/phase notices that targeted their block/phase).
 */
export const residentNotices = async (limit = 50): Promise<ResidentNotice[]> => {
  const res: any = await api.get(`/resident-auth/notices?limit=${limit}`);
  if (res.success) return res.data || [];
  throw new Error(res?.message || 'Failed to fetch notices');
};

/**
 * Build a public download URL for a notice PDF.
 */
export const getNoticeDownloadUrl = (pdfPath: string): string => {
  const fileName = pdfPath.split('/').pop() || pdfPath.split('\\').pop() || '';
  return `${API_URL}/notices/download/${encodeURIComponent(fileName)}`;
};
