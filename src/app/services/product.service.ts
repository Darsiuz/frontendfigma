import api from '@services/api';
import type { Product } from '@type/Product';

export const getProducts = async (): Promise<Product[]> => {
  const { data } = await api.get('/product');
  return data;
};

export const createProduct = async (
  product: Omit<Product, 'id'>
): Promise<Product> => {
  const { data } = await api.post('/product', product);
  return data;
};

export const updateProduct = async (
  id: number,
  product: Omit<Product, 'id'>
): Promise<Product> => {
  const { data } = await api.put(`/product/${id}`, product);
  return data;
};

export const deleteProduct = async (id: number): Promise<void> => {
  await api.delete(`/product/${id}`);
};

export const getProductById = async (id: number): Promise<Product> => {
  const { data } = await api.get(`/product/${id}`);
  return data;
}
