// app/[locale]/espace/acces/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History } from "lucide-react";

export default function AccesPage() {
  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        Historique d&apos;accès
      </h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-cyan-600" />
            Séances d&apos;accès
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Aucun accès enregistré</p>
        </CardContent>
      </Card>
    </div>
  );
}
