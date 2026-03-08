export interface SystemConfig {
  companyName: string;
  lowStockThreshold: number;
  currency: string;
  autoApproveMovements: boolean;
  requireIncidentApproval: boolean;
  enableNotifications: boolean;
  defaultLocation: string;
  maxStockPerProduct: number;
}