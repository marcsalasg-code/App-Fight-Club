"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { cn } from "@/lib/utils";

const SIDEBAR_STATE_KEY = "gym_manager_sidebar_collapsed";

export function AdminShell({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Persist state
    useEffect(() => {
        const saved = localStorage.getItem(SIDEBAR_STATE_KEY);
        if (saved) {
            setIsCollapsed(JSON.parse(saved));
        }

        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const toggleCollapse = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem(SIDEBAR_STATE_KEY, JSON.stringify(newState));
    };

    return (
        <div className="flex h-full w-full overflow-hidden">
            <Sidebar
                isCollapsed={isCollapsed}
                toggleCollapse={toggleCollapse}
            />
            <main
                id="main-content"
                className={cn(
                    "flex-1 h-full overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out relative z-10",
                    isCollapsed ? "md:ml-20" : "md:ml-64",
                    // Reset margin on mobile since Sidebar is fixed/overlay there, 
                    // but wait, internal scroll means we behave differently.
                    // Actually, if Sidebar is fixed in desktop, we need to account for it in the flex flow or keep it fixed.
                    // The original Sidebar was fixed: "md:fixed md:top-0...". 
                    // If we want "App Shell" with flex, Sidebar should ideally be relative in the flex container OR we keep margin.
                    // Let's keep margin logic for desktop compatibility if Sidebar stays fixed.
                    // BUT checking sidebar.tsx: it has "md:fixed".
                    // So we must keep the margin logic.
                    // CRITICAL: "overflow-y-auto" enables the internal scroll.
                    // We remove "pb-20" here if we want the scroll to be clean, or keep it inside the scroll area.
                )}
            >
                <div className="min-h-full p-4 md:p-6 pb-32 md:pb-10">
                    {children}
                </div>
            </main>
        </div>
    );
}
