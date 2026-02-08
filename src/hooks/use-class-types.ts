"use client";

import { useState, useEffect } from "react";
import { getClassTypes } from "@/actions/class-types";
import { CLASS_TYPES } from "@/lib/constants";
import { TYPE_COLORS } from "@/components/calendar/types";

export type ClassType = {
    id: string;
    code: string;
    label: string;
    color: string;
    borderColor: string;
    icon?: string | null;
    active: boolean;
};

export function useClassTypes() {
    const [types, setTypes] = useState<ClassType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const res = await getClassTypes();

                if (res.success && res.data && res.data.length > 0) {
                    setTypes(res.data);
                } else {
                    // Fallback to Constants
                    console.warn("Using fallback Class Types from constants");
                    const fallbackTypes: ClassType[] = CLASS_TYPES.map(t => {
                        const colors = TYPE_COLORS[t.value] || TYPE_COLORS.default;
                        // Default icons logic (mirrors migration script)
                        let iconName = "Dumbbell";
                        if (t.value.includes("THAI")) iconName = "Sword";
                        if (t.value.includes("BOXING")) iconName = "Swords";
                        if (t.value.includes("KIDS")) iconName = "Baby";
                        if (t.value.includes("CONDITIONING")) iconName = "Activity";

                        return {
                            id: `fallback-${t.value}`,
                            code: t.value,
                            label: t.label,
                            color: colors.bg,
                            borderColor: colors.border,
                            icon: iconName,
                            active: true
                        };
                    });
                    setTypes(fallbackTypes);
                }
            } catch (e) {
                console.error(e);
                setError("Error loading class types");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    return { types, loading, error };
}
