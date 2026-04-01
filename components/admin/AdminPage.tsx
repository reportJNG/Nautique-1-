import * as React from "react";
import { cn } from "@/lib/utils";
import { Waves, ExternalLink, Heart } from "lucide-react";

/* ══════════════════════════════════════════════════════
   Types & Interfaces
══════════════════════════════════════════════════════ */
interface AdminFooterLink {
  label: string;
  href: string;
  external?: boolean;
  icon?: React.ReactNode;
}

interface StatusPillProps {
  status: "operational" | "degraded" | "outage";
  label?: string;
}

/* ══════════════════════════════════════════════════════
   Constants
══════════════════════════════════════════════════════ */
const FOOTER_LINKS: AdminFooterLink[] = [
  { label: "Documentation", href: "/docs", external: true },
  { label: "Support", href: "/support", external: false },
  { label: "Politique de confidentialité", href: "/privacy", external: false },
  { label: "Statut", href: "/status", external: false },
];

const STATUS_CONFIG = {
  operational: {
    color: "bg-emerald-400",
    shadow: "shadow-[0_0_5px_rgba(52,211,153,0.7)]",
    label: "Tous les services opérationnels",
  },
  degraded: {
    color: "bg-amber-400",
    shadow: "shadow-[0_0_5px_rgba(251,191,36,0.7)]",
    label: "Performance dégradée",
  },
  outage: {
    color: "bg-red-400",
    shadow: "shadow-[0_0_5px_rgba(248,113,113,0.7)]",
    label: "Interruption de service",
  },
} as const;

/* ══════════════════════════════════════════════════════
   Utility Components
══════════════════════════════════════════════════════ */
const StatusPill = ({ status = "operational", label }: StatusPillProps) => {
  const config = STATUS_CONFIG[status];

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.05] bg-white/[0.02]">
      <span className={cn("w-1.5 h-1.5 rounded-full", config.color, config.shadow)} />
      <span className="text-[10.5px] font-medium text-[#1a3050]">
        {label || config.label}
      </span>
    </div>
  );
};

const FooterLink = ({ link }: { link: AdminFooterLink }) => {
  const Icon = link.icon;

  return (
    <a
      href={link.href}
      target={link.external ? "_blank" : undefined}
      rel={link.external ? "noopener noreferrer" : undefined}
      className="flex items-center gap-0.5 text-[11px] text-[#1e3550] hover:text-[#4a7090] transition-colors group"
      aria-label={link.label}
    >
      {link.label}
      {link.external && (
        <ExternalLink className="w-2.5 h-2.5 opacity-50 group-hover:opacity-70 transition-opacity" />
      )}
    </a>
  );
};

/* ══════════════════════════════════════════════════════
   AdminPageShell
══════════════════════════════════════════════════════ */
interface AdminPageShellProps extends React.HTMLAttributes<HTMLDivElement> {
  locale: string;
  showFooter?: boolean;
  systemStatus?: "operational" | "degraded" | "outage";
}

export function AdminPageShell({
  className,
  children,
  locale,
  showFooter = true,
  systemStatus = "operational",
  ...props
}: AdminPageShellProps) {
  return (
    <div
      className={cn(
        "flex flex-col min-h-full w-full max-w-[1440px] mx-auto",
        "px-5 sm:px-7 lg:px-8 py-6 sm:py-7 gap-6",
        "box-border",
        className
      )}
      {...props}
    >
      {children}
      {showFooter && <AdminFooter locale={locale} systemStatus={systemStatus} />}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   AdminFooter (enhanced)
══════════════════════════════════════════════════════ */
interface AdminFooterProps {
  locale: string;
  systemStatus?: "operational" | "degraded" | "outage";
  links?: AdminFooterLink[];
}

export function AdminFooter({
  locale,
  systemStatus = "operational",
  links = FOOTER_LINKS,
  copyright,
  tagline,
}: AdminFooterProps & { copyright?: string; tagline?: string }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto pt-5" role="contentinfo">
      {/* Top rule with shimmer animation */}
      <div className="relative h-px w-full mb-5">
        <div className="absolute inset-0 bg-white/[0.05]" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent animate-pulse" />
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Brand Section */}
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-transform hover:scale-105">
            <Waves className="w-3 h-3 text-white" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#2a4060] tracking-tight leading-none">
              {copyright || `© ${currentYear} — Tous droits réservés`}
            </p>
            <p className="text-[9.5px] text-[#1a2e40] mt-0.5 flex items-center gap-1">
              <Heart className="w-2.5 h-2.5 text-rose-400/70" />
              {tagline || "Fait avec soin"}
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-4 flex-wrap" aria-label="Footer navigation">
          {links.map((link) => (
            <FooterLink key={link.label} link={link} />
          ))}
        </nav>

        {/* Status Indicator */}
        <StatusPill status={systemStatus} />
      </div>
    </footer>
  );
}

/* ══════════════════════════════════════════════════════
   AdminPageHeader (enhanced)
══════════════════════════════════════════════════════ */
interface AdminPageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  className?: string;
}

export function AdminPageHeader({
  title,
  description,
  actions,
  children,
  icon,
  badge,
  breadcrumbs,
  className,
}: AdminPageHeaderProps) {
  return (
    <header className={cn("relative pb-5 border-b border-white/[0.05]", className)}>
      {/* Animated accent underline */}
      <div className="absolute bottom-0 left-0 h-[2px] w-16 rounded-full bg-gradient-to-r from-cyan-400 to-sky-500 shadow-[0_0_12px_rgba(6,182,212,0.5)] transition-all duration-300 group-hover:w-24" />

      {breadcrumbs && (
        <div className="mb-3 text-xs text-[#3a5a7a]">{breadcrumbs}</div>
      )}

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3.5 min-w-0">
          {icon && (
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500/15 to-sky-500/10 border border-cyan-500/15 flex items-center justify-center text-cyan-400 flex-shrink-0 shadow-[0_0_20px_rgba(6,182,212,0.1)] transition-all group-hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]">
              {icon}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-[20px] sm:text-[24px] font-extrabold tracking-tight text-[#f0f9ff] leading-none break-words">
                {title}
              </h1>
              {badge && <div className="flex-shrink-0">{badge}</div>}
            </div>
            {description && (
              <p className="text-[12.5px] text-[#3a5a7a] mt-1.5 max-w-[520px] leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
            {actions}
          </div>
        )}
      </div>

      {children && <div className="mt-4">{children}</div>}
    </header>
  );
}

/* ══════════════════════════════════════════════════════
   AdminSection (enhanced)
══════════════════════════════════════════════════════ */
interface AdminSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  headerRight?: React.ReactNode;
  noPadding?: boolean;
  elevated?: boolean;
  loading?: boolean;
  skeleton?: React.ReactNode;
}

export function AdminSection({
  title,
  description,
  headerRight,
  className,
  children,
  noPadding = false,
  elevated = false,
  loading = false,
  skeleton,
  ...props
}: AdminSectionProps) {
  const content = loading && skeleton ? skeleton : children;

  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.06]",
        "bg-[#0a1828]/70 backdrop-blur-md",
        "shadow-[0_1px_3px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.02)_inset]",
        elevated && "shadow-[0_8px_30px_rgba(0,0,0,0.4)]",
        "hover:border-cyan-500/10",
        "transition-all duration-200 overflow-hidden",
        className
      )}
      {...props}
    >
      {(title || description || headerRight) && (
        <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-3.5 border-b border-white/[0.05]">
          <div className="flex-1 min-w-0">
            {title && (
              <h2 className="text-[13px] font-bold text-[#c8dff5] tracking-tight">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-[11.5px] text-[#3a5a7a] mt-0.5 leading-relaxed">
                {description}
              </p>
            )}
          </div>
          {headerRight && (
            <div className="flex items-center gap-2 flex-shrink-0">{headerRight}</div>
          )}
        </div>
      )}
      <div className={cn(!noPadding && "p-5", loading && "opacity-50 animate-pulse")}>
        {content}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   AdminDataTable (enhanced)
══════════════════════════════════════════════════════ */
interface AdminDataTableProps {
  toolbar?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  emptyState?: React.ReactNode;
  isLoading?: boolean;
  totalItems?: number;
  itemsPerPage?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

export function AdminDataTable({
  toolbar,
  children,
  footer,
  emptyState,
  isLoading = false,
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
}: AdminDataTableProps) {
  const hasData = React.Children.count(children) > 0;

  return (
    <div className="flex flex-col">
      {toolbar && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 px-5 py-3 border-b border-white/[0.05]">
          {toolbar}
        </div>
      )}
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400" />
          </div>
        ) : !hasData && emptyState ? (
          emptyState
        ) : (
          children
        )}
      </div>
      {(footer || (totalItems && itemsPerPage && currentPage && onPageChange)) && (
        <div className="flex items-center justify-between px-5 py-2.5 text-[11px] text-[#2a4060] border-t border-white/[0.05]">
          {footer}
          {totalItems && itemsPerPage && currentPage && onPageChange && (
            <div className="flex items-center gap-2">
              <span className="text-[#3a5a7a]">
                {Math.min(currentPage * itemsPerPage, totalItems)} / {totalItems}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   AdminFormLayout (enhanced)
══════════════════════════════════════════════════════ */
interface AdminFormLayoutProps extends React.FormHTMLAttributes<HTMLFormElement> {
  sidebar?: React.ReactNode;
  loading?: boolean;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function AdminFormLayout({
  className,
  children,
  sidebar,
  loading = false,
  onSubmit,
  ...props
}: AdminFormLayoutProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (loading) {
      e.preventDefault();
      return;
    }
    onSubmit?.(e);
  };

  return (
    <form
      className={cn(
        "grid gap-5 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]",
        loading && "opacity-60 pointer-events-none",
        className
      )}
      onSubmit={handleSubmit}
      {...props}
    >
      <div className="rounded-2xl border border-white/[0.06] bg-[#0a1828]/70 backdrop-blur-md p-5 flex flex-col gap-4">
        {children}
      </div>
      {sidebar && <aside className="flex flex-col gap-4 sticky top-6">{sidebar}</aside>}
    </form>
  );
}

/* ══════════════════════════════════════════════════════
   AdminDetailLayout (enhanced)
══════════════════════════════════════════════════════ */
interface AdminDetailLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  chips?: React.ReactNode;
  headerAside?: React.ReactNode;
  metadata?: Array<{ label: string; value: string | React.ReactNode }>;
  actions?: React.ReactNode;
}

export function AdminDetailLayout({
  title,
  subtitle,
  chips,
  headerAside,
  metadata,
  actions,
  className,
  children,
  ...props
}: AdminDetailLayoutProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <header className="flex flex-col gap-3 pb-4 border-b border-white/[0.05]">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold tracking-tight text-[#f0f9ff] break-words">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-[#3a5a7a] mt-0.5">{subtitle}</p>
            )}
          </div>
          {headerAside && <div className="flex items-center gap-2 flex-shrink-0">{headerAside}</div>}
        </div>

        {metadata && metadata.length > 0 && (
          <div className="flex flex-wrap gap-4 text-xs">
            {metadata.map((item, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <span className="text-[#3a5a7a]">{item.label}:</span>
                <span className="text-[#b0d0ff] font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        )}

        {chips && <div className="flex flex-wrap gap-1.5">{chips}</div>}

        {actions && (
          <div className="flex items-center gap-2 pt-2">{actions}</div>
        )}
      </header>
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   Table Primitives (enhanced with better accessibility)
══════════════════════════════════════════════════════ */
interface AdminTableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

export function AdminTable({ children, className, ...props }: AdminTableProps) {
  return (
    <table
      className={cn("w-full border-collapse text-[12.5px]", className)}
      {...props}
    >
      {children}
    </table>
  );
}

interface AdminTableHeadProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export function AdminTableHead({ children, className, ...props }: AdminTableHeadProps) {
  return (
    <thead
      className={cn("border-b border-white/[0.05] bg-white/[0.015]", className)}
      {...props}
    >
      {children}
    </thead>
  );
}

interface AdminTableHeaderCellProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  sortable?: boolean;
  onSort?: () => void;
  sortDirection?: "asc" | "desc" | null;
}

export function AdminTableHeaderCell({
  children,
  sortable = false,
  onSort,
  sortDirection,
  className,
  ...props
}: AdminTableHeaderCellProps) {
  const handleClick = () => {
    if (sortable && onSort) {
      onSort();
    }
  };

  return (
    <th
      className={cn(
        "px-4 py-3 text-[10px] font-bold text-[#253d56] uppercase tracking-[0.12em] text-left whitespace-nowrap",
        sortable && "cursor-pointer hover:text-[#3a5a7a] transition-colors select-none",
        className
      )}
      onClick={handleClick}
      aria-sort={
        sortable && sortDirection
          ? sortDirection === "asc"
            ? "ascending"
            : "descending"
          : undefined
      }
      {...props}
    >
      <div className="flex items-center gap-1.5">
        {children}
        {sortable && sortDirection && (
          <span className="text-[8px]">
            {sortDirection === "asc" ? "↑" : "↓"}
          </span>
        )}
      </div>
    </th>
  );
}

interface AdminTableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export function AdminTableBody({ children, className, ...props }: AdminTableBodyProps) {
  return (
    <tbody className={cn("divide-y divide-white/[0.03]", className)} {...props}>
      {children}
    </tbody>
  );
}

interface AdminTableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
  clickable?: boolean;
  onClick?: () => void;
}

export function AdminTableRow({
  children,
  clickable = false,
  onClick,
  className,
  ...props
}: AdminTableRowProps) {
  return (
    <tr
      className={cn(
        "transition-colors",
        clickable && "cursor-pointer hover:bg-white/[0.05]",
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </tr>
  );
}

interface AdminTableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  primary?: boolean;
  align?: "left" | "center" | "right";
}

export function AdminTableCell({
  children,
  primary = false,
  align = "left",
  className,
  ...props
}: AdminTableCellProps) {
  return (
    <td
      className={cn(
        "px-4 py-3 align-middle",
        primary ? "text-[#d8ecff] font-semibold" : "text-[#4a6a88]",
        align === "center" && "text-center",
        align === "right" && "text-right",
        className
      )}
      {...props}
    >
      {children}
    </td>
  );
}