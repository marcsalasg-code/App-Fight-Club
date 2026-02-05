import { useSyncExternalStore } from "react";

export function useMediaQuery(query: string) {
    const subscribe = (onStoreChange: () => void) => {
        const result = window.matchMedia(query);
        result.addEventListener("change", onStoreChange);
        return () => result.removeEventListener("change", onStoreChange);
    };

    const getSnapshot = () => window.matchMedia(query).matches;
    const getServerSnapshot = () => false;

    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
