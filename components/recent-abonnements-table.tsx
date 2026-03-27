"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { STATUT_ABONNEMENT_STYLES } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Eye } from "lucide-react";

interface RecentAbonnementsTableProps {
  abonnements: Array<{
    id: number;
    statut: string;
    typeAbonnement: string;
    montantTtc: { toString(): string } | number;
    dateDebut: Date;
    adherent: { nom: string; prenom: string };
    discipline: { designation: string };
  }>;
  locale: string;
}

export function RecentAbonnementsTable({
  abonnements,
  locale,
}: RecentAbonnementsTableProps) {
  const t = useTranslations();

  if (abonnements.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Aucun abonnement récent
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Adhérent</TableHead>
          <TableHead>Discipline</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Montant</TableHead>
          <TableHead>Date début</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {abonnements.map((abonnement) => (
          <TableRow key={abonnement.id}>
            <TableCell className="font-medium">
              {abonnement.adherent.prenom} {abonnement.adherent.nom}
            </TableCell>
            <TableCell>{abonnement.discipline.designation}</TableCell>
            <TableCell>
              {t(`types.${abonnement.typeAbonnement as "OPN" | "DUR" | "SEA"}`)}
            </TableCell>
            <TableCell>
              <Badge
                className={STATUT_ABONNEMENT_STYLES[abonnement.statut] || ""}
              >
                {t(`statuts.${abonnement.statut}`)}
              </Badge>
            </TableCell>
            <TableCell>
              {formatCurrency(
                typeof abonnement.montantTtc === "object"
                  ? Number(abonnement.montantTtc)
                  : abonnement.montantTtc,
                locale
              )}
            </TableCell>
            <TableCell>{formatDate(abonnement.dateDebut, locale)}</TableCell>
            <TableCell className="text-right">
              <Link href={`/admin/abonnements/${abonnement.id}`}>
                <Button variant="ghost" size="icon">
                  <Eye className="h-4 w-4" />
                </Button>
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
