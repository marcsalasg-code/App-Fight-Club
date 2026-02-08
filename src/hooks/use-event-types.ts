import { useState, useEffect } from "react";
import { getEventTypes } from "@/app/(admin)/configuracion/competencias/actions";

export type EventType = {
    id: string;
    label: string;
    active: boolean;
};

// Default constants in case DB is empty or fails
const DEFAULT_EVENT_TYPES = [
    { id: "default-1", label: "Torneo", active: true },
    { id: "default-2", label: "Interclub", active: true },
    { id: "default-3", label: "Seminario", active: true },
    { id: "default-4", label: "Exhibición", active: true },
];

export function useEventTypes() {
    // Initialize with defaults to avoid flash if desired, or empty
    // For consistency with ClassTypes, let's use defaults pattern if robust enough, 
    // but maybe empty is safer if we want to force DB data. 
    // Given the migration strategy, DB should have data.
    const [types, setTypes] = useState<EventType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const res = await getEventTypes();

                if (res.success && res.data && res.data.length > 0) {
                    setTypes(res.data);
                } else {
                    // Fallback if needed
                    console.warn("Using fallback Event Types");
                    setTypes(DEFAULT_EVENT_TYPES);
                }
            } catch (e) {
                console.error(e);
                setError("Error loading event types");
                setTypes(DEFAULT_EVENT_TYPES);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    return { types, loading, error };
}
