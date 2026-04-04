"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    User, Mail, Phone, Calendar, Building2, Save, Loader2,
    Hash, MapPin, Award, AtSign, ShieldCheck, Eye, EyeOff,
    CheckCircle, XCircle, AlertCircle, ChevronRight, UserCircle
} from "lucide-react";

interface Organisation {
    id: number;
    designation: string;
    code: string;
}

interface Adherent {
    id: number;
    nom: string;
    prenom: string;
    email: string | null;
    telephone: string | null;
    dateNaissance: Date;
    sexe: string;
    adresse: string | null;
    numeroDossier: string;
    numeroMatricule: string | null;
    organisationId: number;
    actif: number;
}

interface Props {
    adherent: Adherent;
    organisations: Organisation[];
    locale: string;
}

export function ModifierAdherentClient({ adherent, organisations, locale }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [activeSection, setActiveSection] = useState<string | null>(null);

    const [form, setForm] = useState({
        nom: adherent.nom,
        prenom: adherent.prenom,
        email: adherent.email ?? "",
        telephone: adherent.telephone ?? "",
        dateNaissance: new Date(adherent.dateNaissance).toISOString().split("T")[0],
        sexe: adherent.sexe,
        adresse: adherent.adresse ?? "",
        numeroMatricule: adherent.numeroMatricule ?? "",
        organisationId: String(adherent.organisationId),
        actif: String(adherent.actif),
        password: "",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const body: Record<string, unknown> = {
                nom: form.nom,
                prenom: form.prenom,
                email: form.email || null,
                telephone: form.telephone || null,
                dateNaissance: form.dateNaissance,
                sexe: form.sexe,
                adresse: form.adresse || null,
                numeroMatricule: form.numeroMatricule || null,
                organisationId: parseInt(form.organisationId),
                actif: parseInt(form.actif),
            };

            if (form.password) {
                body.password = form.password;
            }

            const res = await fetch(`/api/admin/adherents/${adherent.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Une erreur est survenue");
            }

            setSuccess(true);
            setTimeout(() => {
                router.push(`/${locale}/admin/adherents/${adherent.id}`);
                router.refresh();
            }, 1500);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Erreur inconnue");
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full px-4 py-2.5 rounded-xl bg-card/50 border border-border text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-card/70 transition-all duration-200";
    const labelClass = "block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider";

    const sections = [
        { id: "identity", icon: User, title: "Identité", color: "indigo", gradient: "from-primary to-primary/80" },
        { id: "contact", icon: Mail, title: "Contact", color: "blue", gradient: "from-primary to-primary/80" },
        { id: "organisation", icon: Building2, title: "Organisation", color: "amber", gradient: "from-primary to-primary/80" },
        { id: "security", icon: ShieldCheck, title: "Sécurité", color: "rose", gradient: "from-primary to-primary/80" },
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Enhanced Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card/90 via-card/80 to-card/90 backdrop-blur-xl border border-border/50 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/10" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse delay-1000" />

                <div className="relative p-8">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary rounded-full blur-xl opacity-50" />
                            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-2xl font-bold text-primary-foreground shadow-xl ring-4 ring-primary/30">
                                {adherent.prenom[0]}{adherent.nom[0]}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary border-2 border-border flex items-center justify-center">
                                <CheckCircle className="w-3 h-3 text-primary-foreground" />
                            </div>
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                                    {adherent.prenom} {adherent.nom}
                                </h1>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${parseInt(form.actif) === 1
                                    ? "bg-primary/20 text-primary border border-primary/30"
                                    : "bg-destructive/20 text-destructive border border-destructive/30"
                                    }`}>
                                    {parseInt(form.actif) === 1 ? "Actif" : "Inactif"}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                    <Hash className="w-3.5 h-3.5" />
                                    {adherent.numeroDossier}
                                </span>
                                {adherent.numeroMatricule && (
                                    <span className="flex items-center gap-1.5">
                                        <Award className="w-3.5 h-3.5" />
                                        {adherent.numeroMatricule}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="hidden sm:block text-right">
                            <div className="text-xs text-muted-foreground/60 uppercase tracking-wider">Membre depuis</div>
                            <div className="text-sm font-semibold text-muted-foreground">
                                {new Date(adherent.dateNaissance).getFullYear()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Notifications */}
            {error && (
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-destructive/10 to-destructive/10 backdrop-blur-sm border border-destructive/30 p-4 animate-in slide-in-from-top-2 duration-300">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-destructive/20 rounded-full blur-2xl" />
                    <div className="relative flex items-start gap-3">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center">
                                <AlertCircle className="w-4 h-4 text-destructive" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-destructive font-medium">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {success && (
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/10 to-primary/10 backdrop-blur-sm border border-primary/30 p-4 animate-in slide-in-from-top-2 duration-300">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-primary/20 rounded-full blur-2xl" />
                    <div className="relative flex items-start gap-3">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                                <CheckCircle className="w-4 h-4 text-primary" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-primary font-medium">
                                Modifications enregistrées avec succès ! Redirection en cours...
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Enhanced Form Sections */}
            {sections.map((section) => (
                <div
                    key={section.id}
                    className="group relative overflow-hidden rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-border/50 transition-all duration-300"
                    onMouseEnter={() => setActiveSection(section.id)}
                    onMouseLeave={() => setActiveSection(null)}
                >
                    <div className={`absolute inset-0 bg-gradient-to-r ${section.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                    <div className="relative">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-card/30">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${section.gradient} opacity-20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                    <section.icon className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-semibold text-foreground">{section.title}</h2>
                                    <p className="text-xs text-muted-foreground/60 mt-0.5">
                                        {section.id === "identity" && "Informations personnelles"}
                                        {section.id === "contact" && "Coordonnées et adresse"}
                                        {section.id === "organisation" && "Affiliation et statut"}
                                        {section.id === "security" && "Sécurité du compte"}
                                    </p>
                                </div>
                            </div>
                            {activeSection === section.id && (
                                <ChevronRight className="w-4 h-4 text-muted-foreground/60 animate-pulse" />
                            )}
                        </div>

                        <div className="p-6">
                            {section.id === "identity" && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className={labelClass}>Prénom *</label>
                                        <input
                                            name="prenom"
                                            value={form.prenom}
                                            onChange={handleChange}
                                            required
                                            className={inputClass}
                                            placeholder="Prénom"
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Nom *</label>
                                        <input
                                            name="nom"
                                            value={form.nom}
                                            onChange={handleChange}
                                            required
                                            className={inputClass}
                                            placeholder="Nom de famille"
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>
                                            <span className="flex items-center gap-2">
                                                <Calendar className="w-3 h-3" /> Date de naissance *
                                            </span>
                                        </label>
                                        <input
                                            type="date"
                                            name="dateNaissance"
                                            value={form.dateNaissance}
                                            onChange={handleChange}
                                            required
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>
                                            <span className="flex items-center gap-2">
                                                <Award className="w-3 h-3" /> Sexe *
                                            </span>
                                        </label>
                                        <select name="sexe" value={form.sexe} onChange={handleChange} className={inputClass}>
                                            <option value="M">Masculin</option>
                                            <option value="F">Féminin</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClass}>
                                            <span className="flex items-center gap-2">
                                                <Hash className="w-3 h-3" /> N° Matricule
                                            </span>
                                        </label>
                                        <input
                                            name="numeroMatricule"
                                            value={form.numeroMatricule}
                                            onChange={handleChange}
                                            className={inputClass}
                                            placeholder="Optionnel"
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Statut</label>
                                        <select name="actif" value={form.actif} onChange={handleChange} className={inputClass}>
                                            <option value="1" className="flex items-center gap-2">✓ Actif</option>
                                            <option value="0" className="flex items-center gap-2">✗ Inactif</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {section.id === "contact" && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className={labelClass}>
                                            <span className="flex items-center gap-2">
                                                <AtSign className="w-3 h-3" /> Email
                                            </span>
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            className={inputClass}
                                            placeholder="email@exemple.com"
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>
                                            <span className="flex items-center gap-2">
                                                <Phone className="w-3 h-3" /> Téléphone
                                            </span>
                                        </label>
                                        <input
                                            name="telephone"
                                            value={form.telephone}
                                            onChange={handleChange}
                                            className={inputClass}
                                            placeholder="+213 ..."
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className={labelClass}>
                                            <span className="flex items-center gap-2">
                                                <MapPin className="w-3 h-3" /> Adresse
                                            </span>
                                        </label>
                                        <textarea
                                            name="adresse"
                                            value={form.adresse}
                                            onChange={handleChange}
                                            rows={3}
                                            className={inputClass + " resize-none"}
                                            placeholder="Adresse complète (optionnel)"
                                        />
                                    </div>
                                </div>
                            )}

                            {section.id === "organisation" && (
                                <div>
                                    <label className={labelClass}>Organisation *</label>
                                    <select
                                        name="organisationId"
                                        value={form.organisationId}
                                        onChange={handleChange}
                                        required
                                        className={inputClass}
                                    >
                                        {organisations.map((org) => (
                                            <option key={org.id} value={org.id} className="py-2">
                                                [{org.code}] {org.designation}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-muted-foreground/60 mt-2">
                                        Sélectionnez l'organisation à laquelle cet adhérent est rattaché
                                    </p>
                                </div>
                            )}

                            {section.id === "security" && (
                                <div>
                                    <label className={labelClass}>Nouveau mot de passe</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={form.password}
                                            onChange={handleChange}
                                            className={inputClass + " pr-12"}
                                            placeholder="Laisser vide pour ne pas modifier"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((v) => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-muted-foreground/60 mt-2 flex items-center gap-1">
                                        <ShieldCheck className="w-3 h-3" />
                                        Laissez vide pour conserver le mot de passe actuel
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}

            {/* Enhanced Action Buttons */}
            <div className="sticky bottom-6 flex justify-end gap-3 pt-4 pb-2">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="group relative px-6 py-2.5 rounded-xl bg-card/50 hover:bg-muted/50 border border-border text-muted-foreground hover:text-foreground text-sm font-medium transition-all duration-200 overflow-hidden cursor-pointer"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-destructive/0 via-destructive/0 to-destructive/0 group-hover:from-destructive/10 group-hover:via-destructive/5 group-hover:to-destructive/0 transition-all duration-500" />
                    <span className="relative flex items-center gap-2">
                        <XCircle className="w-4 h-4" />
                        Annuler
                    </span>
                </button>

                <button
                    type="submit"
                    disabled={loading || success}
                    className="group relative px-8 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground text-sm font-semibold shadow-lg shadow-primary/30 hover:shadow-primary/40 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-primary/30 overflow-hidden cursor-pointer"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 cursor-pointer" />
                    <span className="relative flex items-center gap-2">
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        {loading ? "Enregistrement..." : "Enregistrer les modifications"}
                    </span>
                </button>
            </div>
        </form>
    );
}