import { Sidebar } from "@/components/sidebar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CommandPalette } from "@/components/command-palette";

import Link from "next/link"; // Not needed but harmless if auto-added
import Image from "next/image";
// ... imports

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex min-h-screen relative isolation-auto">
            {/* Background Watermark */}
            <div className="fixed inset-0 z-[-1] pointer-events-none flex items-center justify-center overflow-hidden">
                <div className="relative w-[80vh] h-[80vh] opacity-[0.03] blur-sm grayscale hover:grayscale-0 transition-all duration-1000 animate-in fade-in zoom-in-50 duration-1000">
                    <Image
                        src="/logo.png"
                        alt="Background Logo"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
            </div>

            <CommandPalette />

            {/* Skip to main content - Accessibility */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:outline-none"
            >
                Saltar al contenido principal
            </a>

            <Sidebar />

            <main id="main-content" className="flex-1 md:ml-64 pb-20 md:pb-0">
                <div className="p-4 md:p-8 pt-16 md:pt-8">
                    <Breadcrumbs />
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav />
        </div>
    );
}
