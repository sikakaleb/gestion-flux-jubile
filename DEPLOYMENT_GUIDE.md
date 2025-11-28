# Guide de Déploiement Multi-Environnements

## 📋 Vue d'Ensemble

Vous avez actuellement **1 base de données en production**. Vous devez créer **2 nouvelles bases de données** :

1. **STAGING** - Pour les tests avant mise en production
2. **PREPROD** - Pour la validation finale avant production
3. **PRODUCTION** (existante) - Environnement actuel (tvawgqhhnfzfqtgoqjus)

---

## 🚀 ÉTAPE 1: Créer les Bases de Données Supabase

### A. Créer la base STAGING

1. Allez sur https://supabase.com/dashboard/projects
2. Cliquez sur **"New Project"**
3. Configuration :
   - **Name**: `passenger-manager-staging`
   - **Database Password**: Choisissez un mot de passe fort
   - **Region**: Sélectionnez la même région que votre prod (pour la cohérence)
4. Cliquez sur **"Create new project"**
5. Attendez ~2 minutes que le projet soit créé

**Récupérer les credentials:**
1. Dans le projet créé, allez dans **Settings** (icône engrenage) > **API**
2. Notez ces 2 valeurs :
   - **Project URL** : `https://[ID-PROJET].supabase.co`
   - **anon public** key : Une longue chaîne commençant par `eyJ...`

### B. Créer la base PREPROD

Répétez exactement les mêmes étapes que pour STAGING, mais nommez le projet :
- **Name**: `passenger-manager-preprod`

---

## 🗄️ ÉTAPE 2: Initialiser les Schémas de Bases de Données

Pour chaque nouvelle base de données (STAGING et PREPROD), vous devez créer les tables.

### Option A : Via SQL Editor (Recommandé)

1. Dans le dashboard Supabase du projet STAGING, allez dans **SQL Editor**
2. Créez une nouvelle query
3. Copiez-collez le script suivant :

```sql
-- Create passengers table
CREATE TABLE IF NOT EXISTS passengers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  flight_date date NOT NULL,
  flight_time text NOT NULL,
  airline text NOT NULL,
  accommodation text NOT NULL,
  direction text NOT NULL CHECK (direction IN ('arrival', 'departure')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'picked_up', 'housed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  host_info text,
  is_urgent boolean DEFAULT false,
  tags text[],
  external_id text,
  phone text,
  location text,
  email text
);

-- Enable Row Level Security
ALTER TABLE passengers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (Allow all for now - adjust based on your needs)
CREATE POLICY "Enable read access for all users"
  ON passengers FOR SELECT
  USING (true);

CREATE POLICY "Enable insert access for all users"
  ON passengers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update access for all users"
  ON passengers FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for all users"
  ON passengers FOR DELETE
  USING (true);

-- Create index for external_id lookups
CREATE INDEX IF NOT EXISTS idx_passengers_external_id ON passengers(external_id);

-- Create index for flight_date queries
CREATE INDEX IF NOT EXISTS idx_passengers_flight_date ON passengers(flight_date);

-- Create index for direction filtering
CREATE INDEX IF NOT EXISTS idx_passengers_direction ON passengers(direction);
```

4. Cliquez sur **"Run"**
5. Répétez pour le projet PREPROD

---

## ⚙️ ÉTAPE 3: Configurer Vercel

### A. Ajouter les Variables d'Environnement STAGING

1. Allez sur https://vercel.com
2. Sélectionnez votre projet
3. Allez dans **Settings** > **Environment Variables**
4. Cliquez sur **"Add New"**

**Variable 1:**
- **Key**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://[STAGING-PROJECT-ID].supabase.co`
- **Environments**: Cochez **Preview** uniquement
- Cliquez sur **Save**

**Variable 2:**
- **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: `[VOTRE-STAGING-ANON-KEY]`
- **Environments**: Cochez **Preview** uniquement
- Cliquez sur **Save**

### B. Ajouter les Variables d'Environnement PREPROD

Pour différencier PREPROD de STAGING dans Vercel, vous avez 2 options :

#### Option 1 : Utiliser une branche Git spécifique (Recommandé)

1. Créez une branche `preprod` dans votre repo Git
2. Dans Vercel **Settings** > **Git**, configurez :
   - **Production Branch**: `main`
   - **Preview Branches**: Tous sauf `preprod`
3. Créez un nouveau projet Vercel spécifiquement pour la branche `preprod`
4. Configurez les variables d'environnement PREPROD dans ce projet

#### Option 2 : Utiliser des sous-domaines

Utilisez les mêmes variables que STAGING pour Preview, et créez un déploiement manuel pour PREPROD avec ses propres variables.

### C. Variables PRODUCTION (Existantes)

Vérifiez que ces variables existent pour l'environnement **Production** :

**Variable 1:**
- **Key**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://tvawgqhhnfzfqtgoqjus.supabase.co`
- **Environments**: **Production** uniquement

**Variable 2:**
- **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2YXdncWhobmZ6ZnF0Z29xanVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNTcyNDcsImV4cCI6MjA3OTczMzI0N30.mG_bMVqoACCstIOUBF6ZLgHBV1YC4FztLIdbMe_wiWw`
- **Environments**: **Production** uniquement

---

## 🔄 ÉTAPE 4: Workflow de Déploiement

### Développement Local
```bash
# Utilisez STAGING pour le développement local
cp .env.staging .env.local
npm run dev
```

### Déploiement STAGING (Preview)
1. Créez une Pull Request vers `main`
2. Vercel déploiera automatiquement sur une URL de preview
3. Cette preview utilisera les variables STAGING
4. Testez sur `https://[votre-app]-[hash].vercel.app`

### Déploiement PREPROD
1. Mergez votre PR dans la branche `preprod` (si vous utilisez l'Option 1)
2. Ou déployez manuellement avec les variables PREPROD
3. Testez exhaustivement avant de passer en production

### Déploiement PRODUCTION
1. Une fois validé en PREPROD, mergez dans `main`
2. Vercel déploiera automatiquement en production
3. L'environnement utilisera les variables PRODUCTION

---

## 📊 Résumé de la Configuration

| Environnement | Base de Données | Vercel Environment | Branche Git | Utilisation |
|--------------|----------------|-------------------|-------------|-------------|
| **STAGING** | `passenger-manager-staging` | Preview | Toutes les PR | Tests de développement |
| **PREPROD** | `passenger-manager-preprod` | Preview/Custom | `preprod` | Validation finale |
| **PRODUCTION** | `tvawgqhhnfzfqtgoqjus` | Production | `main` | Production actuelle ✅ |

---

## ✅ Checklist de Vérification

### Pour STAGING :
- [ ] Projet Supabase créé
- [ ] Tables créées avec le script SQL
- [ ] URL et clé API notées
- [ ] Variables ajoutées dans Vercel (Preview)
- [ ] Test de déploiement effectué

### Pour PREPROD :
- [ ] Projet Supabase créé
- [ ] Tables créées avec le script SQL
- [ ] URL et clé API notées
- [ ] Stratégie de déploiement choisie (branche ou projet séparé)
- [ ] Variables configurées
- [ ] Test de déploiement effectué

### Pour PRODUCTION :
- [ ] Variables vérifiées dans Vercel
- [ ] Base de données actuelle fonctionne (50 passagers ✅)
- [ ] Aucune modification nécessaire

---

## 🔐 Sécurité

### RLS Policies

Les policies créées ci-dessus permettent un accès complet (`true`). Pour la production, vous devriez :

1. Activer l'authentification Supabase Auth
2. Remplacer les policies par des vérifications authentifiées :

```sql
-- Exemple de policy sécurisée (à adapter selon vos besoins)
CREATE POLICY "Enable read access for authenticated users"
  ON passengers FOR SELECT
  TO authenticated
  USING (true);

-- Pour le public (lecture seule des arrivées/départs du jour)
CREATE POLICY "Enable read access for public on current day"
  ON passengers FOR SELECT
  TO anon
  USING (flight_date = CURRENT_DATE);
```

### Clés API

- ⚠️ **NE JAMAIS** commiter les fichiers `.env` dans Git
- Les clés `anon` sont publiques (côté client), c'est normal
- Les clés `service_role` ne doivent JAMAIS être exposées côté client

---

## 🆘 Dépannage

### "Error establishing database connection"
- Vérifiez que les URL et clés sont correctes
- Vérifiez que le projet Supabase est bien démarré (statut "Active")

### "Table doesn't exist"
- Relancez le script SQL de création des tables
- Vérifiez que vous êtes dans le bon projet Supabase

### "Permission denied"
- Vérifiez que RLS est bien activé
- Vérifiez que les policies sont créées correctement

### Variables d'environnement non appliquées
- Redéployez l'application après avoir modifié les variables
- Vérifiez que vous avez sélectionné le bon environnement (Production/Preview)

---

## 📞 Support

Pour toute question :
1. Supabase: https://supabase.com/docs
2. Vercel: https://vercel.com/docs
3. Documentation du projet : Voir `README.md` et `ADMIN_GUIDE.md`
