import api from '../utils/api';

export interface ComplaintPayload {
  name: string;
  mobile: string;
  message: string;
}

export interface ComplaintReceipt {
  id: string;
  createdAt: string;
}

/**
 * Submit a complaint to the society office. It lands in the admin panel's
 * complaints queue; the mobile number typed here is how the office replies.
 */
export const submitComplaint = async (
  payload: ComplaintPayload,
): Promise<ComplaintReceipt> => {
  const res: any = await api.post('/complaints', payload);
  if (res.success) return res.data as ComplaintReceipt;
  throw new Error(res?.message || 'Failed to submit complaint');
};
