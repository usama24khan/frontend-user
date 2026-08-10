import api, { API_URL } from '../utils/api';
import type { PortalUser } from '../store/slices/authSlice';

export interface UserLoginPayload {
  email: string;
  password: string;
}

export interface UserLoginResult {
  user: PortalUser;
  accessToken: string;
  refreshToken: string;
}

/**
 * Sign in to the resident portal. There is a single shared account for the
 * whole society — see USER_PORTAL_EMAIL / USER_PORTAL_PASSWORD on the backend.
 */
export const userLogin = async (payload: UserLoginPayload): Promise<UserLoginResult> => {
  const res: any = await api.post('/user-auth/login', payload);
  if (res.success) return res.data as UserLoginResult;
  throw new Error(res?.message || 'Login failed');
};

/** Confirm the stored token is still valid, returning the portal identity. */
export const userMe = async (): Promise<PortalUser> => {
  const res: any = await api.get('/user-auth/me');
  if (res.success) return res.data as PortalUser;
  throw new Error(res?.message || 'Failed to fetch profile');
};

export interface SocietyNotice {
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
 * List notices issued across the society, newest first. The portal account is
 * shared, so notices aren't scoped to a single plot.
 */
export const societyNotices = async (limit = 50): Promise<SocietyNotice[]> => {
  const res: any = await api.get(`/user-auth/notices?limit=${limit}`);
  if (res.success) return res.data || [];
  throw new Error(res?.message || 'Failed to fetch notices');
};

/**
 * Build a public download URL for a notice PDF.
 */
export const getNoticeDownloadUrl = (pdfPath: string): string => {
  if (/^https?:\/\//i.test(pdfPath)) return pdfPath;
  const fileName = pdfPath.split('/').pop() || pdfPath.split('\\').pop() || '';
  return `${API_URL}/notices/download/${encodeURIComponent(fileName)}`;
};
