export type IncidentType = 'daño' | 'pérdida' | 'robo' | 'vencimiento' | 'otro';
export enum IncidentStatus {
    PENDIENTE = 'PENDIENTE',
    RESUELTO = 'RESUELTO',
    RECHAZADO = 'RECHAZADO'
}

export type IncidentFilter = IncidentStatus | 'all';

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

