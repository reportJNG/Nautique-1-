import { History, ScanLine, Calendar, Clock, MapPin, ChevronRight } from "lucide-react";

export default function AccesPage() {
  // Mock data for demonstration - replace with real data
  const hasAccessHistory = false; // Set to true to see populated state

  // Example of populated state data structure
  const accessHistory = [
    {
      id: 1,
      date: "15 Mars 2024",
      time: "09:24",
      location: "Entrée Principale",
      type: "Entrée",
    },
    {
      id: 2,
      date: "14 Mars 2024",
      time: "17:45",
      location: "Accès Parking",
      type: "Sortie",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 dark:from-blue-950 dark:via-cyan-950 dark:to-blue-950 px-4 py-8 sm:px-8">
      {/* Page header with animation */}
      <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-blue-200 dark:to-blue-800" />
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-400 dark:text-blue-500">
            Espace membre
          </p>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-blue-200 dark:to-blue-800" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-900 to-cyan-600 dark:from-white dark:to-cyan-400 bg-clip-text text-transparent text-center sm:text-left">
          Historique d'accès
        </h1>
        <p className="text-sm text-blue-500 dark:text-blue-400 mt-2 text-center sm:text-left">
          Consultez l'ensemble de vos entrées et sorties
        </p>
      </div>

      {/* Main Card with glass morphism effect */}
      <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
        <div className="rounded-2xl bg-white/80 backdrop-blur-sm dark:bg-blue-950/80 border border-blue-200/50 dark:border-blue-800/50 shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">

          {/* Section header with enhanced design */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5" />
            <div className="flex items-center gap-4 px-6 py-5 border-b border-blue-200/50 dark:border-blue-800/50">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 rounded-xl blur-xl" />
                <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
                  <History className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-base font-semibold text-blue-900 dark:text-white">
                  Séances d'accès
                </p>
                <p className="text-xs text-blue-500 dark:text-blue-400">
                  Historique chronologique de vos entrées enregistrées
                </p>
              </div>
              {hasAccessHistory && (
                <button className="text-xs font-medium text-blue-600 hover:text-cyan-600 dark:text-blue-400 dark:hover:text-cyan-300 transition-colors">
                  Voir tout
                </button>
              )}
            </div>
          </div>

          {/* Content Area with conditional rendering */}
          {!hasAccessHistory ? (
            // Enhanced Empty State
            <div className="flex flex-col items-center justify-center gap-6 px-6 py-16 sm:py-20">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-800 dark:to-cyan-800/50 border-2 border-blue-200/50 dark:border-blue-700/50 shadow-inner">
                  <ScanLine className="h-10 w-10 text-blue-400 dark:text-blue-500" />
                  <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-300 dark:bg-blue-600 border-2 border-white dark:border-blue-800">
                    <span className="h-2 w-2 rounded-full bg-blue-500 dark:bg-blue-400" />
                  </div>
                </div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                  <div className="h-1 w-1 rounded-full bg-blue-400/60 animate-pulse" />
                  <div className="h-1 w-1 rounded-full bg-cyan-400/40 animate-pulse delay-150" />
                  <div className="h-1 w-1 rounded-full bg-blue-400/20 animate-pulse delay-300" />
                </div>
              </div>

              <div className="text-center max-w-sm">
                <p className="text-lg font-semibold bg-gradient-to-r from-blue-700 to-cyan-600 dark:from-blue-300 dark:to-cyan-400 bg-clip-text text-transparent">
                  Aucun accès enregistré
                </p>
                <p className="mt-2 text-sm text-blue-500 dark:text-blue-400">
                  Vos entrées et sorties apparaîtront ici après votre première visite.
                </p>
                <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-100 dark:bg-blue-800 text-xs text-blue-600 dark:text-blue-300">
                  <Calendar className="h-3 w-3" />
                  <span>Première visite bientôt ?</span>
                </div>
              </div>
            </div>
          ) : (
            // Populated State with timeline design
            <div className="divide-y divide-blue-100 dark:divide-blue-800">
              {accessHistory.map((access, index) => (
                <div
                  key={access.id}
                  className="group relative px-6 py-4 hover:bg-blue-50 dark:hover:bg-blue-800/50 transition-colors duration-200 animate-in fade-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-4">
                    {/* Timeline indicator */}
                    <div className="relative flex-shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/10">
                        <Clock className="h-4 w-4 text-blue-600 dark:text-cyan-400" />
                      </div>
                      {index < accessHistory.length - 1 && (
                        <div className="absolute left-1/2 top-10 h-full w-px -translate-x-1/2 bg-gradient-to-b from-blue-200 to-transparent dark:from-blue-800" />
                      )}
                    </div>

                    {/* Access details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-blue-900 dark:text-white">
                            {access.location}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3 w-3 text-blue-400" />
                              <span className="text-xs text-blue-600 dark:text-blue-400">
                                {access.date}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3 w-3 text-blue-400" />
                              <span className="text-xs text-blue-600 dark:text-blue-400">
                                {access.time}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Access type badge */}
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${access.type === "Entrée"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-400"
                          }`}>
                          <div className={`h-1.5 w-1.5 rounded-full ${access.type === "Entrée" ? "bg-emerald-500" : "bg-blue-400"
                            }`} />
                          {access.type}
                        </div>
                      </div>
                    </div>

                    <ChevronRight className="h-4 w-4 text-blue-300 dark:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Optional footer with stats */}
          <div className="border-t border-blue-100 dark:border-blue-800 px-6 py-3 bg-blue-50/50 dark:bg-blue-900/30">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-blue-500 dark:text-blue-400">
                <MapPin className="h-3 w-3" />
                <span>Dernière connexion: Aujourd'hui à 09:24</span>
              </div>
              <div className="text-blue-400 dark:text-blue-600">
                {hasAccessHistory ? `${accessHistory.length} accès` : "0 accès"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}