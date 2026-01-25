export type MovementType = 'entrada' | 'salida';
export type MovementStatus = 'pendiente' | 'aprobado' | 'rechazado';

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