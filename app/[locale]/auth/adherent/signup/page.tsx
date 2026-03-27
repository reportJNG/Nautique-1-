// app/[locale]/auth/adherent/signup/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Waves, Eye, EyeOff } from "lucide-react";
import { signupAction } from "@/lib/actions/auth.actions";

export default function AdherentSignupPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const locale = useLocale();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError("");

    const result = await signupAction(formData);

    if (result.error) {
      setError(result.error);
      setIsPending(false);
    } else if (result.success) {
      router.push(`/espace`);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8 dark:bg-gray-950">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <Waves className="h-12 w-12 text-cyan-600" />
          </div>
          <CardTitle className="text-2xl">{t("signup")}</CardTitle>
          <CardDescription>Créez votre compte adhérent</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom</Label>
                <Input id="nom" name="nom" required placeholder="Votre nom" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prenom">Prénom</Label>
                <Input
                  id="prenom"
                  name="prenom"
                  required
                  placeholder="Votre prénom"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="votre@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone</Label>
              <Input id="telephone" name="telephone" placeholder="+213..." />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sexe">Sexe</Label>
                <select
                  id="sexe"
                  name="sexe"
                  required
                  className="flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                >
                  <option value="">Sélectionner</option>
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateNaissance">Date de naissance</Label>
                <Input
                  id="dateNaissance"
                  name="dateNaissance"
                  type="date"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adresse">Adresse</Label>
              <Input id="adresse" name="adresse" placeholder="Votre adresse" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numeroMatricule">
                N° Matricule SONATRACH (optionnel)
              </Label>
              <Input
                id="numeroMatricule"
                name="numeroMatricule"
                placeholder="Si employé SONATRACH"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password">{t("password")}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="8 caractères min"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Confirmez"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Inscription..." : t("register")}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {t("hasAccount")}{" "}
            </span>
            <Link
              href={`/${locale}/auth/adherent/login`}
              className="text-cyan-600 hover:underline dark:text-cyan-400"
            >
              {t("login")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
