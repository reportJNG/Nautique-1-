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
      className={`rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 ${className}`}
    >
      {children}
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  iconColor = "text-violet-500",
  iconBg = "bg-violet-100 dark:bg-violet-900/40",
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  iconColor?: string;
  iconBg?: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4 dark:border-gray-800">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
      >
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{title}</p>
        {subtitle && (
          <p className="text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>
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
      className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500"
    >
      {children}
    </Label>
  );
}

function ReadonlyField({ value }: { value: string }) {
  return (
    <div className="flex h-10 w-full items-center rounded-xl border border-gray-100 bg-gray-50 px-3 text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-800/60 dark:text-gray-400">
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
    <div className="min-h-screen bg-gray-50/60 px-4 py-8 dark:bg-gray-950 sm:px-8">
      {/* Page header */}
      <div className="mb-8 flex items-center gap-5">
        {/* Avatar */}
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-xl font-bold text-violet-600 dark:bg-violet-900/40 dark:text-violet-400">
          {initials}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            Espace membre
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {adherent.prenom} {adherent.nom}
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500">
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
                  className="rounded-xl border-gray-200 bg-white text-sm dark:border-gray-700 dark:bg-gray-800"
                />
              </FieldGroup>
              <FieldGroup>
                <FieldLabel htmlFor="prenom">Prénom</FieldLabel>
                <Input
                  id="prenom"
                  defaultValue={adherent.prenom}
                  className="rounded-xl border-gray-200 bg-white text-sm dark:border-gray-700 dark:bg-gray-800"
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
                className="rounded-xl border-gray-100 bg-gray-50 text-sm text-gray-400 dark:border-gray-800 dark:bg-gray-800/60"
              />
              <p className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
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
                className="rounded-xl border-gray-200 bg-white text-sm dark:border-gray-700 dark:bg-gray-800"
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
                className="rounded-xl border-gray-200 bg-white text-sm dark:border-gray-700 dark:bg-gray-800"
              />
            </FieldGroup>

            <div className="pt-2">
              <Button className="rounded-xl bg-gray-900 text-sm text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200">
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
            iconColor="text-sky-500"
            iconBg="bg-sky-100 dark:bg-sky-900/40"
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
                className="rounded-xl border-gray-200 bg-white text-sm dark:border-gray-700 dark:bg-gray-800"
              />
            </FieldGroup>
            <FieldGroup>
              <FieldLabel htmlFor="newPassword">Nouveau mot de passe</FieldLabel>
              <Input
                id="newPassword"
                type="password"
                className="rounded-xl border-gray-200 bg-white text-sm dark:border-gray-700 dark:bg-gray-800"
              />
            </FieldGroup>
            <FieldGroup>
              <FieldLabel htmlFor="confirmNewPassword">Confirmer le mot de passe</FieldLabel>
              <Input
                id="confirmNewPassword"
                type="password"
                className="rounded-xl border-gray-200 bg-white text-sm dark:border-gray-700 dark:bg-gray-800"
              />
            </FieldGroup>
            <div className="sm:col-span-3 pt-1">
              <Button
                variant="outline"
                className="rounded-xl border-gray-200 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
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