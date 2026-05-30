import api from '../utils/api';

// ─── Phases ───

/** Fetch all phases with their stats for a given year */
export const getAllPhases = async (year: number) => {
  const res: any = await api.get(`/phases?year=${year}`);
  if (res.success) return res.data;
  throw new Error('Failed to load phases');
};
