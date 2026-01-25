import api from '@/services/api';
import { Incident, IncidentStatus } from '@/app/types/Incident';

const mapStatus = (status?: string): IncidentStatus => {
  switch (status?.toUpperCase()) {
    case 'RESOLVED':
    case 'RESUELTO':
      return 'resuelto';
    case 'REJECTED':
    case 'RECHAZADO':
      return 'rechazado';
    case 'PENDING':
    case 'PENDIENTE':
    default:
      return 'pendiente';
  }
};

const mapIncident = (i: any): Incident => ({
  ...i,
  status: mapStatus(i.status),
});

export const getIncidents = async (): Promise<Incident[]> => {
  const { data } = await api.get('/incident');
  return data.map(mapIncident);
};

export const createIncident = async (
  incident: Omit<
    Incident,
    'id' | 'productName' | 'reportedAt' | 'reportedBy' | 'status'
  >
): Promise<Incident> => {
  const { data } = await api.post('/incident', incident);
  return mapIncident(data);
};

export const resolveIncident = async (
  id: string
): Promise<Incident> => {
  const { data } = await api.put(`/incident/${id}/resolve`);
  return mapIncident(data);
};

export const rejectIncident = async (
  id: string
): Promise<Incident> => {
  const { data } = await api.put(`/incident/${id}/reject`);
  return mapIncident(data);
};
