# Centre Nautique SONATRACH

Système de gestion des adhésions, abonnements, plannings, paiements et contrôle d'accès pour le Centre Nautique SONATRACH.

## Stack Technique

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI**: React 19, Tailwind CSS v4
- **Database**: PostgreSQL + Prisma ORM 6
- **Auth**: JWT avec jose (Edge-compatible)
- **i18n**: next-intl (Français, English, العربية)
- **Theme**: next-themes (Clair/Sombre)
- **Icons**: lucide-react
- **Charts**: recharts

## Structure du Projet

```
centre-nautique/
├── app/[locale]/           # Routes avec internationalisation
│   ├── page.tsx            # Page d'accueil
│   ├── auth/               # Authentification
│   ├── espace/             # Espace adhérent
│   └── admin/              # Espace administration
├── components/
│   ├── ui/                 # Composants UI (Button, Input, Card...)
│   ├── landing/            # Composants page d'accueil
│   ├── auth/               # Composants authentification
│   ├── espace/             # Composants espace adhérent
│   └── admin/              # Composants administration
├── lib/
│   ├── auth/               # JWT et session
│   ├── db/                 # Prisma client
│   ├── validators/         # Schémas Zod
│   ├── actions/            # Server Actions
│   └── constants.ts        # Constantes et enums
├── i18n/                   # Configuration i18n
├── prisma/
│   ├── schema.prisma       # Schéma de base de données
│   └── seed.ts             # Données de test
└── middleware.ts           # Auth guard + i18n routing
```

## Installation

1. **Cloner le projet**
```bash
cd centre-nautique
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer l'environnement**
```bash
cp .env.example .env
# Éditer .env avec vos paramètres
```

4. **Initialiser la base de données**
```bash
npx prisma db push
npx prisma db seed
```

5. **Lancer le serveur de développement**
```bash
npm run dev
```

## Comptes de Test

### Agents (Staff)
| Login | Mot de passe | Rôle |
|-------|--------------|------|
| admin | Admin@2026 | Administrateur |
| commercial | Com@2026 | Agent Commercial |
| financier | Fin@2026 | Agent Financier |

### Adhérents
| Email | Mot de passe |
|-------|--------------|
| ahmed@test.dz | Test@2026 |

## Fonctionnalités

### Espace Public
- Page d'accueil avec présentation des disciplines
- Visualisation des créneaux de la saison active
- Formulaire d'inscription adhérent

### Espace Adhérent
- Tableau de bord personnel
- Gestion des abonnements
- Création de nouveaux abonnements (3 étapes)
- Profil et paramètres
- Historique d'accès

### Espace Administration
- Tableau de bord avec statistiques
- Gestion des adhérents (CRUD)
- Gestion des abonnements et statuts
- Gestion des saisons et créneaux
- Gestion des disciplines et espaces
- Gestion des moniteurs
- Gestion des agents (ADMIN/DIR)
- Caisse et validation des paiements
- Contrôle d'accès
- Paramètres globaux

## Rôles et Permissions

| Section | ADMIN | DIR | RESP-COM | AG-COM | AG-FIN |
|---------|:-----:|:---:|:--------:|:------:|:------:|
| Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ |
| Adhérents | ✓ | ✓ | ✓ | ✓ | - |
| Abonnements | ✓ | ✓ | ✓ | ✓ | ✓ |
| Saisons | ✓ | ✓ | ✓ | - | - |
| Créneaux | ✓ | ✓ | ✓ | ✓ | - |
| Disciplines | ✓ | ✓ | ✓ | - | - |
| Moniteurs | ✓ | ✓ | ✓ | ✓ | - |
| Agents | ✓ | ✓ | - | - | - |
| Caisse | ✓ | ✓ | - | - | ✓ |
| Accès | ✓ | ✓ | ✓ | ✓ | ✓ |
| Paramètres | ✓ | - | - | - | - |

## Statuts des Abonnements

```
CRE (Créé) → ATP (Att. Paiement) → APP (Approuvé) → ACT (Actif) → EXP (Expiré)
                                              ↓
                                             NPY (Non Payé)
```

## License

Propriétaire - SONATRACH
