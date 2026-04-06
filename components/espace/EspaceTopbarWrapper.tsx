"use client";

import { useState, useEffect, useCallback } from "react";
import { EspaceTopbar } from "./EspacebarTopbar";

interface Props {
    adherent: {
        nom: string;
        prenom: string;
        numeroDossier: string;
        email?: string | null;
    };
}

export function EspaceTopbarWrapper({ adherent }: Props) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Keep local state in sync when sidebar closes itself (e.g. overlay click)
    useEffect(() => {
        const handleToggle = (e: CustomEvent<{ open: boolean }>) => {
            setIsSidebarOpen(e.detail.open);
        };
        window.addEventListener("espace:sidebar-toggle", handleToggle as EventListener);
        return () => window.removeEventListener("espace:sidebar-toggle", handleToggle as EventListener);
    }, []);

    // On desktop the sidebar is always open
    useEffect(() => {
        const syncWithViewport = () => {
            if (window.innerWidth >= 768) {
                setIsSidebarOpen(true);
                window.dispatchEvent(
                    new CustomEvent("espace:sidebar-toggle", { detail: { open: true } })
                );
            }
        };
        syncWithViewport();
        window.addEventListener("resize", syncWithViewport);
        return () => window.removeEventListener("resize", syncWithViewport);
    }, []);

    const handleMenuClick = useCallback(() => {
        const next = !isSidebarOpen;
        setIsSidebarOpen(next);
        window.dispatchEvent(
            new CustomEvent("espace:sidebar-toggle", { detail: { open: next } })
        );
    }, [isSidebarOpen]);

    return <EspaceTopbar onMenuClick={handleMenuClick} adherent={adherent} sidebarOpen={isSidebarOpen} />;
}