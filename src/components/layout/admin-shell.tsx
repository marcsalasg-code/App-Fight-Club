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
                )}
            >
                <div className="min-h-full p-4 md:p-6 pb-32 md:pb-10 max-w-[1600px] xl:mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
