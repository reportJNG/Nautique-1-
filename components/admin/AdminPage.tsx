import * as React from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { ExternalLink, Heart, Waves } from "lucide-react";

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

const STATUS_CONFIG = {
  operational: {
    color: "bg-primary",
    shadow: "shadow-[0_0_5px_rgba(52,211,153,0.7)]",
  },
  degraded: {
    color: "bg-accent",
    shadow: "shadow-[0_0_5px_rgba(251,191,36,0.7)]",
  },
  outage: {
    color: "bg-destructive",
    shadow: "shadow-[0_0_5px_rgba(248,113,113,0.7)]",
  },
} as const;

const StatusPill = ({ status = "operational", label }: StatusPillProps) => {
  const t = useTranslations("admin.page.status");
  const config = STATUS_CONFIG[status];

  return (
    <div className="flex items-center gap-2 rounded-full border border-border/30 bg-muted/20 px-3 py-1.5">
      <span className={cn("h-1.5 w-1.5 rounded-full", config.color, config.shadow)} />
      <span className="text-[10.5px] font-medium text-muted-foreground">
        {label || t(status)}
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
      className="group flex items-center gap-0.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
      aria-label={link.label}
    >
      {Icon ? <span className="shrink-0">{Icon}</span> : null}
      {link.label}
      {link.external ? (
        <ExternalLink className="h-2.5 w-2.5 opacity-50 transition-opacity group-hover:opacity-70" />
      ) : null}
    </a>
  );
};

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
        "mx-auto flex min-h-full w-full max-w-[1440px] flex-col",
        "box-border gap-6 px-5 py-6 sm:px-7 sm:py-7 lg:px-8",
        className
      )}
      {...props}
    >
      {children}
      {showFooter ? <AdminFooter locale={locale} systemStatus={systemStatus} /> : null}
    </div>
  );
}

interface AdminFooterProps {
  locale: string;
  systemStatus?: "operational" | "degraded" | "outage";
  links?: AdminFooterLink[];
}

export function AdminFooter({
  locale,
  systemStatus = "operational",
  links = [],
  copyright,
  tagline,
}: AdminFooterProps & { copyright?: string; tagline?: string }) {
  const t = useTranslations("admin.footer");
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto pt-5" role="contentinfo" lang={locale}>
      <div className="relative mb-5 h-px w-full">
        <div className="absolute inset-0 bg-border/30" />
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>

      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-transform hover:scale-105">
            <Waves className="h-3 w-3 text-primary-foreground" />
          </div>
          <div>
            <p className="text-[11px] font-bold leading-none tracking-tight text-foreground/70">
              {copyright || t("copyright", { year: currentYear })}
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-[9.5px] text-muted-foreground/50">
              <Heart className="h-2.5 w-2.5 text-rose-400/70" />
              {tagline || t("tagline")}
            </p>
          </div>
        </div>

        {links.length > 0 ? (
          <nav
            className="flex flex-wrap items-center gap-4"
            aria-label={t("navigationAria")}
          >
            {links.map((link) => (
              <FooterLink key={link.label} link={link} />
            ))}
          </nav>
        ) : null}

        <StatusPill status={systemStatus} />
      </div>
    </footer>
  );
}

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
    <header className={cn("relative border-b border-border/30 pb-5", className)}>
      <div className="absolute bottom-0 left-0 h-[2px] w-16 rounded-full bg-gradient-to-r from-primary to-primary/80 shadow-[0_0_12px_rgba(6,182,212,0.5)] transition-all duration-300 group-hover:w-24" />

      {breadcrumbs ? (
        <div className="mb-3 text-xs text-muted-foreground">{breadcrumbs}</div>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-3.5">
          {icon ? (
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/15 to-primary/10 text-primary shadow-[0_0_20px_rgba(6,182,212,0.1)] transition-all group-hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]">
              {icon}
            </div>
          ) : null}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="break-words text-[20px] font-extrabold leading-none tracking-tight text-foreground sm:text-[24px]">
                {title}
              </h1>
              {badge ? <div className="flex-shrink-0">{badge}</div> : null}
            </div>
            {description ? (
              <p className="mt-1.5 max-w-[520px] text-[12.5px] leading-relaxed text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        {actions ? (
          <div className="ml-auto flex flex-shrink-0 items-center gap-2">{actions}</div>
        ) : null}
      </div>

      {children ? <div className="mt-4">{children}</div> : null}
    </header>
  );
}

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
        "overflow-hidden rounded-2xl border border-border/30",
        "bg-card/70 backdrop-blur-md",
        "shadow-[0_1px_3px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.02)_inset]",
        "transition-all duration-200 hover:border-primary/10",
        elevated && "shadow-[0_8px_30px_rgba(0,0,0,0.4)]",
        className
      )}
      {...props}
    >
      {title || description || headerRight ? (
        <div className="flex items-start justify-between gap-3 border-b border-border/30 px-5 pb-3.5 pt-4">
          <div className="min-w-0 flex-1">
            {title ? (
              <h2 className="text-[13px] font-bold tracking-tight text-foreground">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          {headerRight ? (
            <div className="flex flex-shrink-0 items-center gap-2">{headerRight}</div>
          ) : null}
        </div>
      ) : null}
      <div className={cn(!noPadding && "p-5", loading && "animate-pulse opacity-50")}>
        {content}
      </div>
    </div>
  );
}

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
      {toolbar ? (
        <div className="flex flex-col items-start justify-between gap-2.5 border-b border-border/30 px-5 py-3 sm:flex-row sm:items-center">
          {toolbar}
        </div>
      ) : null}
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          </div>
        ) : !hasData && emptyState ? (
          emptyState
        ) : (
          children
        )}
      </div>
      {footer || (totalItems && itemsPerPage && currentPage && onPageChange) ? (
        <div className="flex items-center justify-between border-t border-border/30 px-5 py-2.5 text-[11px] text-muted-foreground">
          {footer}
          {totalItems && itemsPerPage && currentPage && onPageChange ? (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">
                {Math.min(currentPage * itemsPerPage, totalItems)} / {totalItems}
              </span>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

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
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (loading) {
      event.preventDefault();
      return;
    }

    onSubmit?.(event);
  };

  return (
    <form
      className={cn(
        "grid gap-5 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]",
        loading && "pointer-events-none opacity-60",
        className
      )}
      onSubmit={handleSubmit}
      {...props}
    >
      <div className="flex flex-col gap-4 rounded-2xl border border-border/30 bg-card/70 p-5 backdrop-blur-md">
        {children}
      </div>
      {sidebar ? <aside className="sticky top-6 flex flex-col gap-4">{sidebar}</aside> : null}
    </form>
  );
}

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
      <header className="flex flex-col gap-3 border-b border-border/30 pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="break-words text-xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
          {headerAside ? (
            <div className="flex flex-shrink-0 items-center gap-2">{headerAside}</div>
          ) : null}
        </div>

        {metadata && metadata.length > 0 ? (
          <div className="flex flex-wrap gap-4 text-xs">
            {metadata.map((item, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <span className="text-muted-foreground">{item.label}:</span>
                <span className="font-medium text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        ) : null}

        {chips ? <div className="flex flex-wrap gap-1.5">{chips}</div> : null}

        {actions ? <div className="flex items-center gap-2 pt-2">{actions}</div> : null}
      </header>
      {children}
    </div>
  );
}

interface AdminTableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

export function AdminTable({ children, className, ...props }: AdminTableProps) {
  return (
    <table className={cn("w-full border-collapse text-[12.5px]", className)} {...props}>
      {children}
    </table>
  );
}

interface AdminTableHeadProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export function AdminTableHead({
  children,
  className,
  ...props
}: AdminTableHeadProps) {
  return (
    <thead className={cn("border-b border-border/30 bg-muted/20", className)} {...props}>
      {children}
    </thead>
  );
}

interface AdminTableHeaderCellProps
  extends React.ThHTMLAttributes<HTMLTableCellElement> {
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
        "whitespace-nowrap px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground",
        sortable && "cursor-pointer select-none transition-colors hover:text-foreground",
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
        {sortable && sortDirection ? (
          <span className="text-[8px]">{sortDirection === "asc" ? "↑" : "↓"}</span>
        ) : null}
      </div>
    </th>
  );
}

interface AdminTableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export function AdminTableBody({
  children,
  className,
  ...props
}: AdminTableBodyProps) {
  return (
    <tbody className={cn("divide-y divide-border/20", className)} {...props}>
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
        clickable && "cursor-pointer hover:bg-muted/30",
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
        primary ? "font-semibold text-foreground" : "text-muted-foreground",
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
