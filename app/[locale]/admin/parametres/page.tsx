// app/[locale]/admin/parametres/page.tsx
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";

async function getParametres() {
  return prisma.parametres.findFirst();
}

export default async function ParametresPage() {
  const params = await getParametres();

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        Paramètres globaux
      </h1>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-cyan-600" />
            Configuration du centre
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Désignation du centre</Label>
            <Input defaultValue={params?.designationCentre || ""} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input defaultValue={params?.emailCentre || ""} />
            </div>
            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input defaultValue={params?.telephoneCentre || ""} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Adresse</Label>
            <Input defaultValue={params?.adresseCentre || ""} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Tolérance accès avance (min)</Label>
              <Input 
                type="number" 
                defaultValue={params?.toleranceAccesAvance || 15} 
              />
            </div>
            <div className="space-y-2">
              <Label>Tolérance accès retard (min)</Label>
              <Input 
                type="number" 
                defaultValue={params?.toleranceAccesRetard || 10} 
              />
            </div>
          </div>

          <Button>Enregistrer les modifications</Button>
        </CardContent>
      </Card>
    </div>
  );
}
