"use client";

import { Printer } from "lucide-react";
import type { ReactNode } from "react";

interface PrintFactureButtonProps {
  children: ReactNode;
  className?: string;
}

export function PrintFactureButton({
  children,
  className,
}: PrintFactureButtonProps) {
  return (
    <button type="button" className={className} onClick={() => window.print()}>
      <Printer size={14} />
      {children}
    </button>
  );
}
