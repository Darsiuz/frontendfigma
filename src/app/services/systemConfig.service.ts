import api from '@/app/services/api';
import { SystemConfig } from '@/app/types/SystemConfig';

export const getSystemConfig = async (): Promise<SystemConfig> => {
  const { data } = await api.get('/admin/system');
  return data;
};

export const updateSystemConfig = async (
  config: SystemConfig
): Promise<SystemConfig> => {
  const { data } = await api.put('/admin/system', config);
  return data;
};
