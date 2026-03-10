import { useState, useEffect } from "react";
import * as MovementService from "@services/movement.service";
import { type Movement, MovementStatus, MovementType } from "@type/Movement";
import type { Product } from "@type/Product";
import type { User } from "@type/User";
import { toast } from "sonner";
import { canViewMovements } from "@utils/permissions";

interface Props {
  user: User | null;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

export function useMovements({ user, products, setProducts }: Props) {
  const [movements, setMovements] = useState<Movement[]>([]);

  // Cargar movimientos
  useEffect(() => {
    if (!user) return;
    if (!canViewMovements(user)) return;

    MovementService.getMovements()
      .then(setMovements)
      .catch(() => console.warn("Movimientos no cargados"));
  }, [user]);

  //  Crear movimiento
  const handleAddMovement = async (
    movementData: Omit<
      Movement,
      "id" | "date" | "productName" | "user" | "status"
    >
  ) => {
    const promise = MovementService.createMovement(movementData);

    toast.promise(promise, {
      loading: "Registrando movimiento...",
      success: "Movimiento registrado correctamente",
      error: (err) =>
        err?.response?.data?.message || "Error registrando movimiento",
    });

    try {
      const newMovement = await promise;

      setMovements((prev) => [...prev, newMovement]);

      if (newMovement.status === MovementStatus.APROBADO) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === newMovement.productId
              ? {
                  ...p,
                  quantity:
                    newMovement.type === MovementType.ENTRADA
                      ? p.quantity + newMovement.quantity
                      : p.quantity - newMovement.quantity,
                }
              : p
          )
        );
      }
    } catch {}
  };

  // Aprobar
  const handleApproveMovement = async (id: string) => {
    try {
      const updated = await MovementService.approveMovement(id);

      setMovements((prev) =>
        prev.map((m) => (m.id === id ? updated : m))
      );

      setProducts((prev) =>
        prev.map((p) =>
          p.id === updated.productId
            ? {
                ...p,
                quantity:
                  updated.type === MovementType.ENTRADA
                    ? p.quantity + updated.quantity
                    : p.quantity - updated.quantity,
              }
            : p
        )
      );
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Error aprobando movimiento");
    }
  };

  // Rechazar
  const handleRejectMovement = async (id: string) => {
    try {
      const updated = await MovementService.rejectMovement(id);

      setMovements((prev) =>
        prev.map((m) => (m.id === id ? updated : m))
      );
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Error rechazando movimiento");
    }
  };

  return {
    movements,
    handleAddMovement,
    handleApproveMovement,
    handleRejectMovement,
  };
}
