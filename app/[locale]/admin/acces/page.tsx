// app/[locale]/admin/acces/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogIn, Search } from "lucide-react";

export default function AccesPage() {
  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        Contrôle d&apos;accès
      </h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogIn className="h-5 w-5 text-cyan-600" />
            Enregistrer un accès
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input 
                placeholder="N° dossier ou code barre..." 
                className="pl-10"
              />
            </div>
            <Button>Valider l&apos;accès</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Journal d&apos;accès</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Aucun accès enregistré aujourd&apos;hui</p>
        </CardContent>
      </Card>
    </div>
  );
}
