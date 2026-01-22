import api from "./api";
import { ApiUser } from "@/app/types/User";

export interface UserDTO {
  id: number;
  name: string;
  email: string;
  role: string;
  active: boolean;
}

export const getUsers = async (): Promise<ApiUser[]> => {
  const res = await api.get<ApiUser[]>("/admin/users");
  return res.data;
};

export const createUser = async (user: {
  name: string;
  email: string;
  password: string;
  role: string;
  active: boolean;
}) => {
  const res = await api.post("/admin/users", user);
  return res.data;
};

export const updateUser = async (id: number, user: {
  name: string;
  email: string;
  role: string;
  active: boolean;
}) => {
  const res = await api.put(`/admin/users/${id}`, user);
  return res.data;
};

export const disableUser = async (id: number) => {
  await api.patch(`/admin/users/${id}/disable`);
};

export const deleteUser = async (id: number) => {
  await api.delete(`/admin/users/${id}`);
};