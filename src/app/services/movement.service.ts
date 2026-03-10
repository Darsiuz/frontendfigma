import api from '@services/api';
import { type Movement, MovementStatus } from '@type/Movement';

const mapStatus = (status?: string): MovementStatus =>
  status?.toUpperCase() as MovementStatus ?? MovementStatus.PENDIENTE;

const mapMovement = (m: any): Movement => ({
  ...m,
  status: mapStatus(m.status),
});

export const getMovements = async (): Promise<Movement[]> => {
  const { data } = await api.get('/movement');
  return data.map(mapMovement);
};

export const createMovement = async (
  movement: Omit<Movement, 'id' | 'date' | 'productName' | 'user' | 'status'>
): Promise<Movement> => {
  const { data } = await api.post('/movement', movement);
  return mapMovement(data);
};

export const approveMovement = async (id: string): Promise<Movement> => {
  const { data } = await api.put(`/movement/${id}/approve`);
  return mapMovement(data);
};

export const rejectMovement = async (id: string): Promise<Movement> => {
  const { data } = await api.put(`/movement/${id}/reject`);
  return mapMovement(data);
};
