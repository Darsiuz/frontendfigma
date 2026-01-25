export type IncidentType = 'daño' | 'pérdida' | 'robo' | 'vencimiento' | 'otro';
export type IncidentStatus = 'pendiente' | 'resuelto' | 'rechazado';

export interface Incident {
    id: string;
    productId: number;
    productName: string;
    type: IncidentType;
    quantity: number;
    description: string;
    status: IncidentStatus;
    reportedBy: string;
    reportedAt: string;
    resolvedBy?: string;
    resolvedAt?: string;
}

