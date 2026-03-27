// app/[locale]/auth/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
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
import { loginAgentAction } from "@/lib/actions/auth.actions";

export default function AgentLoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const locale = useLocale();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError("");

    const result = await loginAgentAction(formData);

    if (result.error) {
      setError(result.error);
      setIsPending(false);
    } else if (result.success) {
      router.push(`/admin`);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <Waves className="h-12 w-12 text-cyan-600" />
          </div>
          <CardTitle className="text-2xl">{t("login")}</CardTitle>
          <CardDescription>
            Espace Staff - Centre Nautique SONATRACH
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login">{t("loginField")}</Label>
              <Input
                id="login"
                name="login"
                type="text"
                required
                placeholder="Votre identifiant"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Votre mot de passe"
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
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Connexion..." : t("loginSubmit")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
