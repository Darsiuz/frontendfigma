export interface Incident {
    id: string;
    productId: number;
    productName: string;
    type: 'daño' | 'pérdida' | 'robo' | 'vencimiento' | 'otro';
    quantity: number;
    description: string;
    status: 'pendiente' | 'resuelto' | 'rechazado';
    reportedBy: string;
    reportedAt: string;
    resolvedBy?: string;
    resolvedAt?: string;
}

