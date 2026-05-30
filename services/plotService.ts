import api from '../utils/api';

// ─── Plots ───

export interface FetchPlotsParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: string;
  block?: string | null;
  phase?: string | null;
  search?: string;
}

/** Fetch paginated list of plots with filters */
export const getPlots = async (params: FetchPlotsParams) => {
  const { page, limit, sortBy = 'block', sortOrder = 'asc', block, phase, search } = params;

  let url = `/plots?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
  if (block) url += `&block=${block}`;
  else if (phase) url += `&phase=${encodeURIComponent(phase)}`;
  if (search?.trim()) url += `&search=${encodeURIComponent(search.trim())}`;

  const res: any = await api.get(url);
  if (res.success) return { data: res.data, meta: res.meta };
  throw new Error('Failed to load plots');
};

/** Fetch a single plot by ID */
export const getPlotById = async (plotId: string) => {
  const res: any = await api.get(`/plots/${plotId}`);
  if (res.success) return res.data;
  throw new Error('Failed to load plot detail');
};

/** Search plots by block and number (used for pin verification) */
export const searchPlots = async (block: string, search: string, limit = 10) => {
  const res: any = await api.get(`/plots?block=${block}&search=${search.trim()}&limit=${limit}`);
  if (res.success) return res.data;
  throw new Error('Failed to search plots');
};
