import { useState, useEffect } from "react";
import { toast } from "sonner";

import type { Product } from "@type/Product";
import type { User } from "@type/User";

import * as ProductService from "@services/product.service";
import { canViewProduct } from "@utils/permissions";

interface UseProductsProps {
  user: User | null;
}

export function useProducts({ user }: UseProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Cargar productos
  useEffect(() => {
    if (!user) return;

    if (!canViewProduct(user)) return;

    ProductService.getProducts()
      .then(setProducts)
      .catch(() => console.warn("Productos no cargados"));
  }, [user]);

  // Crear producto
  const handleAddProduct = async (productData: Omit<Product, "id">) => {
    try {
      const newProduct = await ProductService.createProduct(productData);
      setProducts((prev) => [...prev, newProduct]);
      setFormErrors({});
      toast.success("Producto creado correctamente");
    } catch (error: any) {
      const backendErrors = error?.response?.data?.errors;

      if (backendErrors) {
        setFormErrors(backendErrors);
      } else {
        toast.error(error?.response?.data?.message || "Error creando producto");
      }
    }
  };

  // Editar producto
  const handleEditProduct = async (id: number, productData: Omit<Product, "id">) => {
    try {
      const updated = await ProductService.updateProduct(id, productData);

      setProducts((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
      setFormErrors({});
      toast.success("Producto actualizado correctamente");
    } catch (error: any) {
      const backendErrors = error?.response?.data?.errors;

      if (backendErrors) {
        setFormErrors(backendErrors);
      } else {
        toast.error(error?.response?.data?.message || "Error actualizando producto");
      }
      
    }
  };

  // Eliminar producto
  const handleDeleteProduct = async (id: number) => {
    try {
      await ProductService.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Producto eliminado correctamente");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Error eliminando producto"
      );
    }
  };

  return {
    products,
    setProducts,
    handleAddProduct,
    handleEditProduct,
    handleDeleteProduct,
    formErrors,
    setFormErrors,
  };
}
