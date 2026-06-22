import api from '../utils/api';

export type AppMode = 'test' | 'production';

let cachedMode: AppMode | null = null;

export async function getAppMode(): Promise<AppMode> {
  if (cachedMode) return cachedMode;
  try {
    const res: any = await api.get('/config/app-mode');
    cachedMode = res.data?.mode ?? 'production';
    return cachedMode!;
  } catch {
    return 'production';
  }
}
