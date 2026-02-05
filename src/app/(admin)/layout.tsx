import { AdminShell } from "@/components/layout/admin-shell";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { CommandPalette } from "@/components/layout/command-palette";

import Link from "next/link"; // Not needed but harmless if auto-added
import Image from "next/image";


export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (

        <div className="flex min-h-screen relative bg-background">
            {/* Background Watermark */}
            <div className="fixed inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden">
                <div className="relative w-[80vh] h-[80vh] opacity-[0.03] blur-sm grayscale">
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

            <AdminShell>
                <div className="p-4 md:p-8 pt-16 md:pt-8">
                    <Breadcrumbs />
                    {children}
                </div>
            </AdminShell>

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav />
        </div>
    );
}
