"use client";

import { useState, useEffect, useCallback } from "react";
import { EspaceSidebar } from "./EspaceSidebar";

interface Props {
    adherent: {
        nom: string;
        prenom: string;
        numeroDossier: string;
    };
    /** Called by layout so the topbar toggle button can control sidebar state */
    onOpenChange?: (open: boolean) => void;
}

export function EspaceSidebarWrapper({ adherent }: Props) {
    const [isOpen, setIsOpen] = useState(false);

    // On desktop (≥ md) the sidebar is always visible via CSS translate;
    // we keep isOpen=true so the component renders correctly.
    useEffect(() => {
        const syncWithViewport = () => {
            if (window.innerWidth >= 768) {
                setIsOpen(true);
            } else {
                setIsOpen(false);
            }
        };

        syncWithViewport();
        window.addEventListener("resize", syncWithViewport);

        // Listen for toggle events dispatched by EspaceTopbarWrapper
        const handleToggle = (e: CustomEvent<{ open: boolean }>) => {
            setIsOpen(e.detail.open);
        };
        window.addEventListener("espace:sidebar-toggle", handleToggle as EventListener);

        return () => {
            window.removeEventListener("resize", syncWithViewport);
            window.removeEventListener("espace:sidebar-toggle", handleToggle as EventListener);
        };
    }, []);

    const close = useCallback(() => {
        setIsOpen(false);
        // Notify topbar so its internal state stays in sync
        window.dispatchEvent(
            new CustomEvent("espace:sidebar-toggle", { detail: { open: false } })
        );
    }, []);

    return <EspaceSidebar adherent={adherent} isOpen={isOpen} onClose={close} />;
}