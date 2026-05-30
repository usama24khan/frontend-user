import api from '../utils/api';

// ─── Analytics / Dashboard Overview ───

export interface OverviewParams {
  year: string;
  monthFrom?: string;
  monthTo?: string;
  phase?: string;
  block?: string;
}

export const getOverview = async (params: OverviewParams) => {
  const { year, monthFrom, monthTo, phase, block } = params;
  const isOverall = year === 'overall';

  let url = `/analytics/overview?year=${year}`;
  if (!isOverall && monthFrom) url += `&monthFrom=${monthFrom}`;
  if (!isOverall && monthTo) url += `&monthTo=${monthTo}`;
  if (block) url += `&block=${block}`;
  else if (phase) url += `&phase=${encodeURIComponent(phase)}`;

  const res: any = await api.get(url);
  if (res.success) return res.data;
  throw new Error('Failed to load overview data');
};
