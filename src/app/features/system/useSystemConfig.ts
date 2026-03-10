import { useState, useEffect } from "react";
import { toast } from "sonner";

import type { SystemConfig } from "@type/SystemConfig";
import type { User } from "@type/User";

import * as SystemConfigService from "@services/systemConfig.service";
import { canViewSystemSettings, canEditSystemSettings } from "@utils/permissions";

interface UseSystemConfigProps {
    user: User | null;
}

export function useSystemConfig({ user }: UseSystemConfigProps) {
    const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null);

    // Cargar configuracion
    useEffect(() => {
        if (!systemConfig?.companyName) return;
        document.title = systemConfig.companyName;
    }, [systemConfig]);

    useEffect(() => {
        if (!user) return;
        if (!canViewSystemSettings(user)) return;
        const cached = localStorage.getItem("systemConfig");
        if (cached) {
            setSystemConfig(JSON.parse(cached));
        }

        SystemConfigService.getSystemConfig()
            .then(config => {
                setSystemConfig(config);
                localStorage.setItem("systemConfig", JSON.stringify(config));
            })
            .catch(() => toast.error("Error cargando configuracion del sistema"));
    }, [user]);

    // Guardar configuracion
    const handleSaveConfig = async (config: SystemConfig) => {
        if (!canEditSystemSettings(user!)) {
            toast.error("No tienes permisos para editar la configuracion del sistema");
            return;
        }
        try {
            const updated = await SystemConfigService.updateSystemConfig(config);
            setSystemConfig(updated);
            toast.success("Configuracion guardada correctamente");
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message ||
                "Error guardando configuracion"
            );
        }
    };

    return {
        systemConfig,
        handleSaveConfig,
    };
}
