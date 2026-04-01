import { History, ScanLine } from "lucide-react";

export default function AccesPage() {
  return (
    <div className="min-h-screen bg-gray-50/60 px-4 py-8 dark:bg-gray-950 sm:px-8">
      {/* Page header */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          Espace membre
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Historique d&apos;accès
        </h1>
      </div>

      {/* Card */}
      <div className="max-w-2xl rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {/* Section header */}
        <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/40">
            <History className="h-4 w-4 text-violet-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              Séances d&apos;accès
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Historique de vos entrées enregistrées
            </p>
          </div>
        </div>

        {/* Empty state */}
        <div className="flex flex-col items-center justify-center gap-4 px-6 py-20">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
            <ScanLine className="h-7 w-7 text-gray-300 dark:text-gray-600" />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
              <span className="h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-gray-500" />
            </span>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Aucun accès enregistré
            </p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Vos entrées apparaîtront ici après votre première visite.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}