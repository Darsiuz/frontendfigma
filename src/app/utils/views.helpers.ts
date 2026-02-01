import { VIEWS_CONFIG } from '@/app/utils/views.config';
import type { View } from '@/app/types/View';

export const getViewLabel = (view: View): string => {
  const found = VIEWS_CONFIG.find(v => v.id === view);
  return found?.label ?? 'Dashboard';
};