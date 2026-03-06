export interface Product {
  id: number;
  name: string;
  category: string;
  quantity: number;
  minStock: number;
  price: number;
  location: string;
}

export interface ApiProduct {
  id: number;
  name: string;
  category: string;
  quantity: number;
  minStock: number;
  price: number;
  location: string;
  active: boolean;
  createdAt: string;
}
