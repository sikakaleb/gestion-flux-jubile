# 📚 Index de la Documentation

Bienvenue dans la documentation du Passenger Manager. Voici tous les guides disponibles organisés par cas d'usage.

---

## 🚀 DÉMARRAGE RAPIDE

### Premier Démarrage
📄 **[SETUP.md](./SETUP.md)**
- Guide de démarrage rapide
- Comment lancer l'application localement
- Tester les fonctionnalités principales

---

## 🏗️ CONFIGURATION MULTI-ENVIRONNEMENTS

### Vue d'Ensemble Rapide
📄 **[ENVIRONMENTS_SETUP.md](./ENVIRONMENTS_SETUP.md)** ⭐ **COMMENCER ICI**
- Vue rapide de l'architecture
- Checklist de 15 minutes
- Liens vers les guides détaillés

### Guide Complet
📄 **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** 📖 **LE PLUS COMPLET**
- Instructions détaillées étape par étape
- Configuration Supabase + Vercel
- Workflow de déploiement
- Sécurité et RLS
- Dépannage

### Résumé Environnements
📄 **[ENVIRONMENTS_SUMMARY.md](./ENVIRONMENTS_SUMMARY.md)**
- Tableau récapitulatif des 3 environnements
- Checklist de configuration
- Commandes utiles

### Templates de Configuration
📄 **[.env.production](./.env.production)**
- Variables PRODUCTION (actuelles)

📄 **[.env.staging](./.env.staging)**
- Template pour STAGING (à remplir)

📄 **[.env.preprod](./.env.preprod)**
- Template pour PREPROD (à remplir)

### Credentials
📄 **[CREDENTIALS_TEMPLATE.md](./CREDENTIALS_TEMPLATE.md)** 🔐
- Template pour noter vos credentials
- ⚠️ NE PAS COMMITTER une fois rempli

---

## 🗄️ BASE DE DONNÉES

### Script d'Initialisation
📄 **[supabase/init-database.sql](./supabase/init-database.sql)**
- Script SQL complet pour créer les tables
- Policies RLS
- Index de performance
- À exécuter sur STAGING et PREPROD

### Migrations
📄 **[supabase/migrations/](./supabase/migrations/)**
- Migrations existantes de la base PRODUCTION
- Historique des changements de schéma

---

## 👨‍💼 ADMINISTRATION

### Guide Admin
📄 **[ADMIN_GUIDE.md](./ADMIN_GUIDE.md)**
- Accéder au panneau admin (PIN: 23700)
- Synchroniser depuis Google Sheets
- Règles de filtrage et mapping
- Smart tagging
- Résolution de problèmes

### Exemples CSV
📄 **[public/sample-google-sheet.csv](./public/sample-google-sheet.csv)**
- Exemple de structure CSV attendue
- Données de test conformes

---

## 🔧 DÉVELOPPEMENT

### Architecture du Projet
```
📁 project/
├── 📁 app/                  # Pages Next.js
│   ├── page.tsx            # Dashboard principal
│   ├── admin/page.tsx      # Panneau admin
│   └── layout.tsx          # Layout global
├── 📁 components/          # Composants React
│   ├── PassengerCard.tsx   # Carte passager
│   ├── FilterDrawer.tsx    # Filtres
│   └── ui/                 # Composants shadcn/ui
├── 📁 lib/                 # Utilitaires
│   ├── supabaseClient.ts   # Client Supabase + Types
│   └── utils.ts            # Fonctions helpers
├── 📁 utils/               # Logique métier
│   ├── csvParser.ts        # Parser CSV Google Sheets
│   └── passengerImport.ts  # Import et upsert
├── 📁 supabase/            # Configuration DB
│   ├── init-database.sql   # Script d'init
│   └── migrations/         # Migrations
└── 📁 public/              # Assets statiques
```

### Types TypeScript
**Définis dans:** `lib/supabaseClient.ts`

```typescript
type PassengerStatus = 'pending' | 'picked_up' | 'housed';
type PassengerDirection = 'arrival' | 'departure';

interface Passenger {
  id: string;
  first_name: string;
  last_name: string;
  flight_date: string;
  flight_time: string;
  airline: string;
  accommodation: string;
  direction: PassengerDirection;
  status: PassengerStatus;
  host_info?: string;
  is_urgent?: boolean;
  tags?: string[];
  external_id?: string;
  phone?: string;
  location?: string;
  email?: string;
}
```

---

## 📋 RÉCAPITULATIF PAR RÔLE

### 🎯 Je suis Développeur
1. Lire **[SETUP.md](./SETUP.md)** pour démarrer
2. Lire **[ENVIRONMENTS_SETUP.md](./ENVIRONMENTS_SETUP.md)** pour comprendre l'architecture
3. Consulter **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** pour les détails techniques

### 🎯 Je suis DevOps
1. Lire **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** en priorité
2. Suivre **[ENVIRONMENTS_SETUP.md](./ENVIRONMENTS_SETUP.md)** pour la configuration
3. Noter les credentials dans **[CREDENTIALS_TEMPLATE.md](./CREDENTIALS_TEMPLATE.md)**
4. Exécuter **[supabase/init-database.sql](./supabase/init-database.sql)** sur chaque environnement

### 🎯 Je suis Administrateur
1. Lire **[ADMIN_GUIDE.md](./ADMIN_GUIDE.md)**
2. Comprendre le format dans **[public/sample-google-sheet.csv](./public/sample-google-sheet.csv)**
3. Accéder à `/admin` avec le PIN: `23700`

### 🎯 Je veux juste Tester
1. Lire **[SETUP.md](./SETUP.md)**
2. Lancer `npm run dev`
3. Ouvrir http://localhost:3000

---

## 🆘 DÉPANNAGE

### Problèmes de Base de Données
➜ Voir **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** section "Dépannage"

### Problèmes d'Import CSV
➜ Voir **[ADMIN_GUIDE.md](./ADMIN_GUIDE.md)** section "Troubleshooting"

### Variables d'Environnement
➜ Voir **[ENVIRONMENTS_SUMMARY.md](./ENVIRONMENTS_SUMMARY.md)**

---

## 📞 SUPPORT

**Documentation:**
- Supabase: https://supabase.com/docs
- Vercel: https://vercel.com/docs
- Next.js: https://nextjs.org/docs

**Communautés:**
- Supabase Discord: https://discord.supabase.com
- Vercel Support: https://vercel.com/support

---

## 📝 NOTES IMPORTANTES

⚠️ **Sécurité:**
- Les fichiers `.env*` sont dans `.gitignore`
- Ne jamais committer `CREDENTIALS_TEMPLATE.md` une fois rempli
- Les clés `anon` sont publiques (côté client)
- Ne jamais exposer les clés `service_role`

✅ **Best Practices:**
- Toujours tester en STAGING avant PREPROD
- Toujours valider en PREPROD avant PRODUCTION
- Ne jamais modifier directement la base PRODUCTION
- Faire des backups réguliers

🎯 **Workflow:**
```
Feature Branch → PR → STAGING (Preview)
                      ↓ Tests OK
                   PREPROD (Validation)
                      ↓ Validation OK
                   PRODUCTION (Deploy)
```

---

**Dernière mise à jour:** 2025-11-27
**Version:** 1.0.0
