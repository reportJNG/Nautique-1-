"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useLocale } from "next-intl";
export default function NouvelAdherentPage() {
    const locale = useLocale();
    return (<div className="p-6">
      <div className="mb-6">
        <Link href={`/${locale}/admin/adherents`}>
          <Button variant="ghost" size="sm">
            <ChevronLeft className="mr-2 h-4 w-4"/>
            Retour
          </Button>
        </Link>
      </div>

      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        Nouvel adhérent
      </h1>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informations de l&apos;adhérent</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input placeholder="Nom de famille"/>
            </div>
            <div className="space-y-2">
              <Label>Prénom</Label>
              <Input placeholder="Prénom"/>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" placeholder="email@exemple.com"/>
          </div>

          <div className="space-y-2">
            <Label>Téléphone</Label>
            <Input placeholder="+213..."/>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Date de naissance</Label>
              <Input type="date"/>
            </div>
            <div className="space-y-2">
              <Label>Sexe</Label>
              <select className="w-full rounded-xl border border-gray-200 p-2 dark:border-gray-700 dark:bg-gray-900">
                <option value="">Sélectionner</option>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Organisation</Label>
            <select className="w-full rounded-xl border border-gray-200 p-2 dark:border-gray-700 dark:bg-gray-900">
              <option value="">Sélectionner</option>
              <option value="SON">Employés SONATRACH</option>
              <option value="PAR">Membres particuliers</option>
              <option value="CLB">Club sportif</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Mot de passe initial</Label>
            <Input type="password"/>
          </div>

          <Button>Créer l&apos;adhérent</Button>
        </CardContent>
      </Card>
    </div>);
}
