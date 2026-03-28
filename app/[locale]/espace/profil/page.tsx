import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, MapPin, Calendar, Building } from "lucide-react";
async function getAdherent(adherentId: number) {
    return prisma.adherent.findUnique({
        where: { id: adherentId },
        include: {
            organisation: true,
        },
    });
}
export default async function ProfilPage() {
    const session = await getSession();
    if (!session || session.type !== "adherent") {
        return null;
    }
    const adherent = await getAdherent(session.id);
    if (!adherent)
        return null;
    return (<div className="p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        Mon profil
      </h1>

      <div className="grid gap-6 lg:grid-cols-2">
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-cyan-600"/>
              Informations personnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom</Label>
                <Input id="nom" defaultValue={adherent.nom}/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="prenom">Prénom</Label>
                <Input id="prenom" defaultValue={adherent.prenom}/>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4"/>
                Email
              </Label>
              <Input id="email" defaultValue={adherent.email || ""} disabled/>
              <p className="text-xs text-gray-500">L&apos;email ne peut pas être modifié</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telephone" className="flex items-center gap-2">
                <Phone className="h-4 w-4"/>
                Téléphone
              </Label>
              <Input id="telephone" defaultValue={adherent.telephone || ""}/>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adresse" className="flex items-center gap-2">
                <MapPin className="h-4 w-4"/>
                Adresse
              </Label>
              <Input id="adresse" defaultValue={adherent.adresse || ""}/>
            </div>

            <Button>Enregistrer les modifications</Button>
          </CardContent>
        </Card>

        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-cyan-600"/>
              Informations du compte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="h-4 w-4"/>
                N° Dossier
              </Label>
              <Input value={adherent.numeroDossier} disabled/>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4"/>
                Date de naissance
              </Label>
              <Input value={new Date(adherent.dateNaissance).toLocaleDateString("fr-FR")} disabled/>
            </div>

            <div className="space-y-2">
              <Label>Organisation</Label>
              <Input value={adherent.organisation.designation} disabled/>
            </div>

            {adherent.numeroMatricule && (<div className="space-y-2">
                <Label>N° Matricule</Label>
                <Input value={adherent.numeroMatricule} disabled/>
              </div>)}
          </CardContent>
        </Card>

        
        <Card>
          <CardHeader>
            <CardTitle>Changer le mot de passe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mot de passe actuel</Label>
              <Input id="currentPassword" type="password"/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <Input id="newPassword" type="password"/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">Confirmer le nouveau mot de passe</Label>
              <Input id="confirmNewPassword" type="password"/>
            </div>
            <Button variant="outline">Changer le mot de passe</Button>
          </CardContent>
        </Card>
      </div>
    </div>);
}
