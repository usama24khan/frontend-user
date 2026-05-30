import api from '../utils/api';

// ─── Leaderboard / Statistics ───

/** Fetch top paid plots for a year */
export const getTopPlots = async (year: number) => {
  const res: any = await api.get(`/stats/top-plots?year=${year}`);
  if (res.success) return res.data || [];
  throw new Error('Failed to load top plots');
};

/** Fetch top performing blocks for a year */
export const getTopBlocks = async (year: number) => {
  const res: any = await api.get(`/stats/top-blocks?year=${year}`);
  if (res.success) return res.data || [];
  throw new Error('Failed to load top blocks');
};

/** Fetch defaulter data for a year */
export const getDefaulters = async (year: number) => {
  const res: any = await api.get(`/stats/defaulters?year=${year}`);
  if (res.success) return res.data;
  throw new Error('Failed to load defaulters');
};
