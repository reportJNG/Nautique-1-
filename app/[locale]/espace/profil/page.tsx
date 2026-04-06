import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  Lock,
  Hash,
  ShieldCheck,
} from "lucide-react";

async function getAdherent(adherentId: number) {
  return prisma.adherent.findUnique({
    where: { id: adherentId },
    include: { organisation: true },
  });
}

function SectionCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-blue-200/50 bg-white/80 backdrop-blur-sm shadow-xl dark:border-blue-800/50 dark:bg-blue-950/80 ${className}`}
    >
      {children}
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  iconColor = "text-blue-500",
  iconBg = "bg-blue-100 dark:bg-blue-900/40",
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  iconColor?: string;
  iconBg?: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-blue-200/50 px-6 py-4 dark:border-blue-800/50">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
      >
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      <div>
        <p className="text-sm font-semibold text-blue-900 dark:text-white">{title}</p>
        {subtitle && (
          <p className="text-xs text-blue-500 dark:text-blue-400">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function FieldGroup({ children }: { children: React.ReactNode }) {
  return <div className="space-y-1.5">{children}</div>;
}

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <Label
      htmlFor={htmlFor}
      className="text-xs font-semibold uppercase tracking-wider text-blue-500 dark:text-blue-400"
    >
      {children}
    </Label>
  );
}

function ReadonlyField({ value }: { value: string }) {
  return (
    <div className="flex h-10 w-full items-center rounded-xl border border-blue-200/50 bg-blue-50/30 px-3 text-sm text-blue-600 dark:border-blue-800/50 dark:bg-blue-900/20 dark:text-blue-400">
      {value}
    </div>
  );
}

export default async function ProfilPage() {
  const session = await getSession();
  if (!session || session.type !== "adherent") return null;

  const adherent = await getAdherent(session.id);
  if (!adherent) return null;

  const initials =
    adherent.prenom.charAt(0).toUpperCase() + adherent.nom.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 dark:from-blue-950 dark:via-cyan-950 dark:to-blue-950 px-4 py-8 sm:px-8">
      {/* Page header */}
      <div className="mb-8 flex items-center gap-5">
        {/* Avatar */}
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 text-xl font-bold text-white shadow-md">
          {initials}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 dark:text-blue-500">
            Espace membre
          </p>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-900 to-cyan-600 dark:from-white dark:to-cyan-400 bg-clip-text text-transparent">
            {adherent.prenom} {adherent.nom}
          </h1>
          <p className="text-sm text-blue-500 dark:text-blue-400">
            {adherent.organisation.designation} &middot; N°{" "}
            {adherent.numeroDossier}
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* ── Personal info ── */}
        <SectionCard>
          <SectionHeader
            icon={User}
            title="Informations personnelles"
            subtitle="Modifiables à tout moment"
          />
          <div className="space-y-4 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldGroup>
                <FieldLabel htmlFor="nom">Nom</FieldLabel>
                <Input
                  id="nom"
                  defaultValue={adherent.nom}
                  className="rounded-xl border-blue-200/50 bg-white/80 text-sm text-blue-900 placeholder:text-blue-400 focus:border-blue-500 focus:ring-blue-500 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white dark:placeholder:text-blue-500"
                />
              </FieldGroup>
              <FieldGroup>
                <FieldLabel htmlFor="prenom">Prénom</FieldLabel>
                <Input
                  id="prenom"
                  defaultValue={adherent.prenom}
                  className="rounded-xl border-blue-200/50 bg-white/80 text-sm text-blue-900 placeholder:text-blue-400 focus:border-blue-500 focus:ring-blue-500 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white dark:placeholder:text-blue-500"
                />
              </FieldGroup>
            </div>

            <FieldGroup>
              <FieldLabel htmlFor="email">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3 w-3" /> Email
                </span>
              </FieldLabel>
              <Input
                id="email"
                defaultValue={adherent.email || ""}
                disabled
                className="rounded-xl border-blue-200/50 bg-blue-50/30 text-sm text-blue-400 dark:border-blue-800/50 dark:bg-blue-900/20 dark:text-blue-500"
              />
              <p className="flex items-center gap-1 text-[11px] text-blue-500 dark:text-blue-400">
                <ShieldCheck className="h-3 w-3" />
                L&apos;email ne peut pas être modifié
              </p>
            </FieldGroup>

            <FieldGroup>
              <FieldLabel htmlFor="telephone">
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3 w-3" /> Téléphone
                </span>
              </FieldLabel>
              <Input
                id="telephone"
                defaultValue={adherent.telephone || ""}
                className="rounded-xl border-blue-200/50 bg-white/80 text-sm text-blue-900 placeholder:text-blue-400 focus:border-blue-500 focus:ring-blue-500 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white dark:placeholder:text-blue-500"
              />
            </FieldGroup>

            <FieldGroup>
              <FieldLabel htmlFor="adresse">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3" /> Adresse
                </span>
              </FieldLabel>
              <Input
                id="adresse"
                defaultValue={adherent.adresse || ""}
                className="rounded-xl border-blue-200/50 bg-white/80 text-sm text-blue-900 placeholder:text-blue-400 focus:border-blue-500 focus:ring-blue-500 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white dark:placeholder:text-blue-500"
              />
            </FieldGroup>

            <div className="pt-2">
              <Button className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-sm text-white shadow-md transition-all hover:from-blue-700 hover:to-cyan-700 dark:from-blue-500 dark:to-cyan-500 dark:hover:from-blue-600 dark:hover:to-cyan-600">
                Enregistrer les modifications
              </Button>
            </div>
          </div>
        </SectionCard>

        {/* ── Account info ── */}
        <SectionCard>
          <SectionHeader
            icon={Building2}
            title="Informations du compte"
            subtitle="Données en lecture seule"
            iconColor="text-cyan-500"
            iconBg="bg-cyan-100 dark:bg-cyan-900/40"
          />
          <div className="space-y-4 p-6">
            <FieldGroup>
              <FieldLabel>
                <span className="flex items-center gap-1.5">
                  <Hash className="h-3 w-3" /> N° Dossier
                </span>
              </FieldLabel>
              <ReadonlyField value={adherent.numeroDossier} />
            </FieldGroup>

            <FieldGroup>
              <FieldLabel>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" /> Date de naissance
                </span>
              </FieldLabel>
              <ReadonlyField
                value={new Date(adherent.dateNaissance).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              />
            </FieldGroup>

            <FieldGroup>
              <FieldLabel>
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-3 w-3" /> Organisation
                </span>
              </FieldLabel>
              <ReadonlyField value={adherent.organisation.designation} />
            </FieldGroup>

            {adherent.numeroMatricule && (
              <FieldGroup>
                <FieldLabel>
                  <span className="flex items-center gap-1.5">
                    <Hash className="h-3 w-3" /> N° Matricule
                  </span>
                </FieldLabel>
                <ReadonlyField value={adherent.numeroMatricule} />
              </FieldGroup>
            )}
          </div>
        </SectionCard>

        {/* ── Change password ── */}
        <SectionCard className="lg:col-span-2">
          <SectionHeader
            icon={Lock}
            title="Changer le mot de passe"
            subtitle="Utilisez un mot de passe fort et unique"
            iconColor="text-amber-500"
            iconBg="bg-amber-100 dark:bg-amber-900/40"
          />
          <div className="grid gap-4 p-6 sm:grid-cols-3">
            <FieldGroup>
              <FieldLabel htmlFor="currentPassword">Mot de passe actuel</FieldLabel>
              <Input
                id="currentPassword"
                type="password"
                className="rounded-xl border-blue-200/50 bg-white/80 text-sm text-blue-900 placeholder:text-blue-400 focus:border-blue-500 focus:ring-blue-500 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white dark:placeholder:text-blue-500"
              />
            </FieldGroup>
            <FieldGroup>
              <FieldLabel htmlFor="newPassword">Nouveau mot de passe</FieldLabel>
              <Input
                id="newPassword"
                type="password"
                className="rounded-xl border-blue-200/50 bg-white/80 text-sm text-blue-900 placeholder:text-blue-400 focus:border-blue-500 focus:ring-blue-500 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white dark:placeholder:text-blue-500"
              />
            </FieldGroup>
            <FieldGroup>
              <FieldLabel htmlFor="confirmNewPassword">Confirmer le mot de passe</FieldLabel>
              <Input
                id="confirmNewPassword"
                type="password"
                className="rounded-xl border-blue-200/50 bg-white/80 text-sm text-blue-900 placeholder:text-blue-400 focus:border-blue-500 focus:ring-blue-500 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white dark:placeholder:text-blue-500"
              />
            </FieldGroup>
            <div className="sm:col-span-3 pt-1">
              <Button
                variant="outline"
                className="rounded-xl border-blue-300/50 bg-white/50 text-sm text-blue-700 hover:bg-blue-50/80 dark:border-blue-700/50 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-800/50"
              >
                <Lock className="mr-2 h-3.5 w-3.5" />
                Changer le mot de passe
              </Button>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}