// app/[locale]/admin/adherents/AdherentsFilters.tsx
"use client";

import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

interface AdherentsFiltersProps {
    locale: string;
    initialSearch?: string;
    initialStatus?: string;
    initialOrganisation?: string;
    organisations: Array<{ id: number; code: string; designation: string }>;
    labels: {
        searchPlaceholder: string;
        allStatuses: string;
        active: string;
        inactive: string;
        allOrganisations: string;
        reset: string;
    };
}

export function AdherentsFilters({
    locale,
    initialSearch = "",
    initialStatus = "all",
    initialOrganisation = "all",
    organisations,
    labels,
}: AdherentsFiltersProps) {
    const router = useRouter();

    const updateFilters = useCallback((updates: Record<string, string>) => {
        const params = new URLSearchParams();

        // Preserve existing filters
        const search = updates.search !== undefined ? updates.search : initialSearch;
        const status = updates.status !== undefined ? updates.status : initialStatus;
        const organisation = updates.organisation !== undefined ? updates.organisation : initialOrganisation;

        if (search && search !== "all") params.set("search", search);
        if (status && status !== "all") params.set("status", status);
        if (organisation && organisation !== "all") params.set("organisation", organisation);

        const queryString = params.toString();
        router.push(`/admin/adherents${queryString ? `?${queryString}` : ""}` as any);
    }, [initialSearch, initialStatus, initialOrganisation, router]);

    const handleSearch = useCallback((e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const searchValue = formData.get("search") as string;
        updateFilters({ search: searchValue });
    }, [updateFilters]);

    const handleStatusChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        updateFilters({ status: e.target.value });
    }, [updateFilters]);

    const handleOrganisationChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        updateFilters({ organisation: e.target.value });
    }, [updateFilters]);

    const handleReset = useCallback(() => {
        router.push(`/admin/adherents` as any);
    }, [locale, router]);

    const hasActiveFilters = initialStatus !== "all" || initialOrganisation !== "all";

    return (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                    <form onSubmit={handleSearch} className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="search"
                            name="search"
                            defaultValue={initialSearch}
                            placeholder={labels.searchPlaceholder}
                            className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                        />
                    </form>
                </div>

                {/* Status Filter */}
                <div className="sm:w-48">
                    <select
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                        onChange={handleStatusChange}
                        value={initialStatus}
                    >
                        <option value="all">{labels.allStatuses}</option>
                        <option value="active">{labels.active}</option>
                        <option value="inactive">{labels.inactive}</option>
                    </select>
                </div>

                {/* Organisation Filter */}
                <div className="sm:w-64">
                    <select
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                        onChange={handleOrganisationChange}
                        value={initialOrganisation}
                    >
                        <option value="all">{labels.allOrganisations}</option>
                        {organisations.map((org) => (
                            <option key={org.id} value={org.id}>
                                {org.code} - {org.designation}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Reset Filters */}
                {hasActiveFilters && (
                    <button
                        onClick={handleReset}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-slate-400 hover:text-slate-200 transition-all"
                    >
                        <X className="w-3.5 h-3.5" />
                        {labels.reset}
                    </button>
                )}
            </div>
        </div>
    );
}