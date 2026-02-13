export enum MovementStatus {
  PENDIENTE = 'PENDIENTE',
  APROBADO = 'APROBADO',
  RECHAZADO = 'RECHAZADO',
}

export type MovementFilter = MovementStatus | 'all';

export type MovementType =
  | 'ENTRADA'
  | 'SALIDA';

export interface Movement {
    id: string;
    productId: number;
    productName: string;
    type: MovementType;
    quantity: number;
    date: string;
    reason: string;
    user: string;
    status: MovementStatus;
    reviewedBy?: string;
    reviewedAt?: string;
}