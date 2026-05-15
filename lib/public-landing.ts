type PublicLandingFallbackReason = {
  label: string;
  message: string;
};

export async function withPublicLandingFallback<T>(
  label: string,
  read: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await read();
  } catch (error) {
    const reason: PublicLandingFallbackReason = {
      label,
      message: error instanceof Error ? error.message : String(error),
    };

    console.warn("[public-landing] Using fallback data", reason);
    return fallback;
  }
}

export const fallbackLandingSaison = {
  id: 0,
  designation: "Saison 2026 - 2027",
  statut: "OUV",
  dateDebut: "2026-09-01T00:00:00.000Z",
  dateFin: "2027-06-30T00:00:00.000Z",
  creneaux: [
    {
      id: "fallback-natation-lundi",
      jourSemaine: 1,
      heureDebut: "2026-01-01T08:00:00.000Z",
      heureFin: "2026-01-01T09:00:00.000Z",
      groupe: "Adultes",
      discipline: { designation: "Natation" },
    },
    {
      id: "fallback-natation-mercredi",
      jourSemaine: 3,
      heureDebut: "2026-01-01T17:00:00.000Z",
      heureFin: "2026-01-01T18:00:00.000Z",
      groupe: "Jeunes",
      discipline: { designation: "Natation" },
    },
    {
      id: "fallback-aquagym-mardi",
      jourSemaine: 2,
      heureDebut: "2026-01-01T10:00:00.000Z",
      heureFin: "2026-01-01T11:00:00.000Z",
      groupe: "Bien-etre",
      discipline: { designation: "Aquagym" },
    },
    {
      id: "fallback-waterpolo-jeudi",
      jourSemaine: 4,
      heureDebut: "2026-01-01T18:00:00.000Z",
      heureFin: "2026-01-01T19:30:00.000Z",
      groupe: "Competition",
      discipline: { designation: "Water-polo" },
    },
  ],
};

export const fallbackLandingEspaces = [
  {
    id: 0,
    code: "NAU",
    designation: "Espace Nautique",
    description: "Activites aquatiques encadrees pour tous les niveaux.",
    disciplines: [
      { id: 1, code: "NAT", designation: "Natation" },
      { id: 2, code: "AQU", designation: "Aquagym" },
      { id: 3, code: "WPO", designation: "Water-polo" },
    ],
  },
  {
    id: 1,
    code: "FOR",
    designation: "Espace Forme",
    description: "Cours de remise en forme et preparation physique.",
    disciplines: [
      { id: 4, code: "FIT", designation: "Fitness" },
      { id: 5, code: "STR", designation: "Stretching" },
      { id: 6, code: "CAR", designation: "Cardio" },
    ],
  },
];

export const fallbackLandingParametres = {
  emailCentre: "contact@centre-nautique.dz",
  telephoneCentre: "+213 21 00 00 00",
  adresseCentre: "Centre Nautique SONATRACH, Alger",
};
