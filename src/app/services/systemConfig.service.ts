import api from '@services/api';
import type { SystemConfig } from '@type/SystemConfig';

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
