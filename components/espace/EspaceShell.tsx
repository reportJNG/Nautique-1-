"use client";

import { useState, useEffect } from "react";
import { EspaceSidebar } from "./EspaceSidebar";
import { EspaceTopbar } from "./EspacebarTopbar";

interface Props {
    adherent: {
        nom: string;
        prenom: string;
        numeroDossier: string;
        email?: string | null;
    };
    children: React.ReactNode;
}

export function EspaceShell({ adherent, children }: Props) {
    // Desktop defaults open, mobile defaults closed
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const init = () => setSidebarOpen(window.innerWidth >= 768);
        init();

        const onResize = () => {
            // Don't auto-toggle on resize — only set initial value
            // so user's explicit choice is preserved after resize
        };
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    const toggle = () => setSidebarOpen((v) => !v);
    const close = () => setSidebarOpen(false);

    return (
        <div className="flex min-h-screen bg-background">
            {/* Sidebar */}
            <EspaceSidebar
                adherent={adherent}
                isOpen={sidebarOpen}
                onClose={close}
            />

            {/* Main area — shifts right only when sidebar is open */}
            <div
                className="flex flex-1 flex-col min-h-screen transition-all duration-300 ease-out"
                style={{ marginLeft: sidebarOpen ? "18rem" : "0" }}
            >
                {/* Topbar */}
                <EspaceTopbar
                    adherent={adherent}
                    onMenuClick={toggle}
                    sidebarOpen={sidebarOpen}
                />

                {/* Page content */}
                <main className="flex-1 pt-16">
                    {children}
                </main>
            </div>
        </div>
    );
}