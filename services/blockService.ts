import api from '../utils/api';

// ─── Blocks ───

/** Fetch all blocks summary for a given year */
export const getAllBlocks = async (year: number) => {
  const res: any = await api.get(`/blocks?year=${year}`);
  if (res.success) return res.data;
  throw new Error('Failed to load blocks');
};

/** Fetch single block detail (plots + stats) by block letter & year */
export const getBlockDetail = async (block: string, year: number) => {
  const res: any = await api.get(`/blocks/${block}?year=${year}`);
  if (res.success) return res.data;
  throw new Error('Failed to load block detail');
};
