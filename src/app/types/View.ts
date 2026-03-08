export type View =
  | 'dashboard'
  | 'inventory'
  | 'users'
  | 'settings'
  | 'reports'
  | 'supervise'
  | 'approve'
  | 'incidents'
  | 'manager-reports'
  | 'register-movements'
  | 'consult-inventory'
  | 'report-incident'
  | 'audit-inventory'
  | 'audit-movements'
  | 'audit-reports';


export interface ViewConfig {
  id: View;
  label: string;
  icon: any;
  badge?: number;
}