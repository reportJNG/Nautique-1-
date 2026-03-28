"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight } from "lucide-react";
export default function NouvelAbonnementPage() {
    const [step, setStep] = useState(1);
    return (<div className="p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        Nouvel abonnement
      </h1>

      
      <div className="mb-8 flex items-center justify-center">
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (<div key={s} className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${s === step
                ? "bg-cyan-600 text-white"
                : s < step
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-500 dark:bg-gray-700"}`}>
              {s < step ? "✓" : s}
            </div>))}
        </div>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>
            {step === 1 && "Étape 1 : Discipline et Saison"}
            {step === 2 && "Étape 2 : Catégorie et Type"}
            {step === 3 && "Étape 3 : Confirmation"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {step === 1 && (<div className="space-y-4">
              <div className="space-y-2">
                <Label>Espace</Label>
                <select className="w-full rounded-xl border border-gray-200 p-2 dark:border-gray-700 dark:bg-gray-900">
                  <option>Sélectionner un espace</option>
                  <option>Espace Nautique</option>
                  <option>Espace Forme</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Discipline</Label>
                <select className="w-full rounded-xl border border-gray-200 p-2 dark:border-gray-700 dark:bg-gray-900">
                  <option>Sélectionner une discipline</option>
                </select>
              </div>
            </div>)}

          {step === 2 && (<div className="space-y-4">
              <div className="space-y-2">
                <Label>Type d&apos;abonnement</Label>
                <select className="w-full rounded-xl border border-gray-200 p-2 dark:border-gray-700 dark:bg-gray-900">
                  <option>Open Saison</option>
                  <option>Par Durée</option>
                  <option>Par Séances</option>
                </select>
              </div>
            </div>)}

          {step === 3 && (<div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Veuillez vérifier les informations avant de confirmer.
              </p>
            </div>)}

          <div className="mt-6 flex justify-between">
            {step > 1 && (<Button variant="outline" onClick={() => setStep(step - 1)}>
                <ChevronLeft className="mr-2 h-4 w-4"/>
                Précédent
              </Button>)}
            {step < 3 ? (<Button onClick={() => setStep(step + 1)} className="ml-auto">
                Suivant
                <ChevronRight className="ml-2 h-4 w-4"/>
              </Button>) : (<Button className="ml-auto">Confirmer</Button>)}
          </div>
        </CardContent>
      </Card>
    </div>);
}
