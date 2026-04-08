export const STATUT_SAISON = {
  OUV: "Ouverte",
  FER: "Fermee",
  CLO: "Cloturee",
} as const;

export const TYPE_ABONNEMENT = {
  OPN: "Open Saison",
  DUR: "Par Duree",
  SEA: "Par Seances",
} as const;

export const STATUT_ABONNEMENT = {
  CRE: "Brouillon",
  ATP: "En attente d'approbation",
  ACT: "Actif",
  APP: "Approuve & Paye",
  ANL: "Annule",
  EXP: "Expire",
  NPY: "Non Paye",
} as const;

export const MODE_PAIEMENT = {
  CSH: "Cash",
  CRD: "Carte bancaire",
} as const;

export const STATUT_FACTURE = {
  ATT: "En attente",
  PAY: "Paye",
} as const;

export const JOURS_SEMAINE = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];

export const AGENT_ROLES = {
  ADMIN: "Administrateur",
  DIR: "Directeur",
  "RESP-COM": "Responsable Commercial",
  "AG-COM": "Agent Commercial",
  "AG-FIN": "Agent Financier",
} as const;

export const ADMIN_ROLES = ["ADMIN", "DIR", "RESP-COM", "AG-COM", "AG-FIN"];

export const STATUT_ABONNEMENT_STYLES: Record<string, string> = {
  CRE: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
  ATP: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  ACT: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  APP: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  ANL: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  EXP: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  NPY: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

export const STATUT_FACTURE_STYLES: Record<string, string> = {
  ATT: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  PAY: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

export const STATUT_SAISON_STYLES: Record<string, string> = {
  OUV: "bg-green-100 text-green-700",
  FER: "bg-gray-100 text-gray-600",
  CLO: "bg-red-100 text-red-600",
};
