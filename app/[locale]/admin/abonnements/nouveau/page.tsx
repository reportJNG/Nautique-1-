// app/[locale]/admin/abonnements/nouveau/page.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useLocale } from "next-intl";

export default function NouvelAbonnementAdminPage() {
  const locale = useLocale();

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href={`/${locale}/admin/abonnements`}>
          <Button variant="ghost" size="sm">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </Link>
      </div>

      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        Nouvel abonnement (Admin)
      </h1>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Sélectionner un adhérent</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Rechercher un adhérent</Label>
            <Input placeholder="Nom, email ou n° dossier..." />
          </div>

          <div className="space-y-2">
            <Label>Discipline</Label>
            <select className="w-full rounded-xl border border-gray-200 p-2 dark:border-gray-700 dark:bg-gray-900">
              <option>Sélectionner une discipline</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Type d&apos;abonnement</Label>
            <select className="w-full rounded-xl border border-gray-200 p-2 dark:border-gray-700 dark:bg-gray-900">
              <option>Open Saison</option>
              <option>Par Durée</option>
              <option>Par Séances</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Montant (DA)</Label>
            <Input type="number" placeholder="0.00" />
          </div>

          <Button>Créer l&apos;abonnement</Button>
        </CardContent>
      </Card>
    </div>
  );
}
