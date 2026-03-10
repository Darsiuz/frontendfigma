import { useState, useEffect } from "react";
import { toast } from "sonner";

import { type Incident, IncidentStatus } from "@type/Incident";
import type { User } from "@type/User";

import * as IncidentService from "@services/incident.service";
import { canViewIncidents } from "@utils/permissions";

interface UseIncidentsProps {
  user: User | null;
}

export function useIncidents({ user }: UseIncidentsProps) {
  const [incidents, setIncidents] = useState<Incident[]>([]);

  // Cargar incidencias cuando el usuario cambia
  useEffect(() => {
    if (!user) return;

    if (!canViewIncidents(user)) return;

    IncidentService.getIncidents()
      .then(setIncidents)
      .catch(() => console.warn("Incidencias no cargadas"));
  }, [user]);

  // Crear incidencia
  const handleAddIncident = async (
    incidentData: Omit<
      Incident,
      "id" | "productName" | "reportedAt" | "reportedBy" | "status"
    >
  ) => {
    const promise = IncidentService.createIncident(incidentData);

    toast.promise(promise, {
      loading: "Registrando incidencia...",
      success: "Incidencia registrada correctamente",
      error: (err) =>
        err?.response?.data?.message || "Error registrando incidencia",
    });

    try {
      const newIncident: Incident = await promise;
      setIncidents((prev) => [...prev, newIncident]);
    } catch {}
  };

  // Resolver o rechazar incidencia
  const handleResolveIncident = async (
    id: string,
    status: IncidentStatus
  ) => {
    try {
      const updated =
        status === IncidentStatus.RESUELTO
          ? await IncidentService.resolveIncident(id)
          : await IncidentService.rejectIncident(id);

      setIncidents((prev) =>
        prev.map((i) => (i.id === id ? updated : i))
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Error actualizando incidencia"
      );
    }
  };

  return {
    incidents,
    handleAddIncident,
    handleResolveIncident,
  };
}
