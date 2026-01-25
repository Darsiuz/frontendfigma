
export interface Movement {
    id: string;
    productId: number;
    productName: string;
    type: 'entrada' | 'salida';
    quantity: number;
    date: string;
    reason: string;
    user: string;
    status?: 'pendiente' | 'aprobado' | 'rechazado';
    reviewedBy?: string;
    reviewedAt?: string;
}