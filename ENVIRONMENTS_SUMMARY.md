# 📊 Résumé des Environnements

## Configuration Actuelle

### 🟢 PRODUCTION (Existante - Ne pas toucher)
**Base de données:** `tvawgqhhnfzfqtgoqjus`
- URL: `https://tvawgqhhnfzfqtgoqjus.supabase.co`
- Status: ✅ **Active** avec 50 passagers
- Utilisation: Application en production
- Variables: Déjà configurées dans Vercel (environnement Production)

---

## À Créer

### 🟡 STAGING (À créer)
**Nom du projet Supabase:** `passenger-manager-staging`
- **Objectif:** Tests de développement
- **Utilisation:** Pull Requests et tests de fonctionnalités
- **Vercel:** Environnement Preview
- **Données:** Données de test

**Actions requises:**
1. ✅ Créer le projet sur Supabase
2. ✅ Exécuter `/supabase/init-database.sql`
3. ✅ Ajouter les variables dans Vercel (Preview)
4. ✅ Tester avec un déploiement preview

### 🟠 PREPROD (À créer)
**Nom du projet Supabase:** `passenger-manager-preprod`
- **Objectif:** Validation finale avant production
- **Utilisation:** Tests avec données réalistes
- **Vercel:** Environnement Preview ou projet séparé
- **Données:** Copie des données de production (sanitizées)

**Actions requises:**
1. ✅ Créer le projet sur Supabase
2. ✅ Exécuter `/supabase/init-database.sql`
3. ✅ Configurer dans Vercel (selon stratégie choisie)
4. ✅ Importer des données de test réalistes

---

## 🚀 Checklist Rapide

### Pour créer STAGING et PREPROD:

#### 1️⃣ Sur Supabase (pour chaque environnement)
- [ ] Aller sur https://supabase.com/dashboard/projects
- [ ] Cliquer "New Project"
- [ ] Nom: `passenger-manager-staging` (ou `preprod`)
- [ ] Choisir un mot de passe fort
- [ ] Sélectionner la même région que prod
- [ ] Attendre 2 minutes
- [ ] Aller dans Settings > API
- [ ] Noter l'URL et la clé anon
- [ ] Aller dans SQL Editor
- [ ] Coller le contenu de `/supabase/init-database.sql`
- [ ] Cliquer "Run"

#### 2️⃣ Sur Vercel
- [ ] Aller dans Settings > Environment Variables
- [ ] Ajouter `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Ajouter `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Sélectionner "Preview" comme environnement
- [ ] Sauvegarder

#### 3️⃣ Test
- [ ] Créer une Pull Request
- [ ] Vérifier que le déploiement preview fonctionne
- [ ] Tester l'ajout d'un passager
- [ ] Tester la synchronisation Google Sheets

---

## 📁 Fichiers de Configuration

Fichiers créés dans le projet:

| Fichier | Description |
|---------|-------------|
| `.env.production` | Variables pour la PROD (existante) |
| `.env.staging` | Template pour STAGING |
| `.env.preprod` | Template pour PREPROD |
| `supabase/init-database.sql` | Script d'initialisation DB |
| `DEPLOYMENT_GUIDE.md` | Guide complet (lire en priorité) |
| `ENVIRONMENTS_SUMMARY.md` | Ce fichier (vue rapide) |

⚠️ **Important:** Les fichiers `.env` sont dans `.gitignore` et ne seront pas committés.

---

## 🎯 Workflow Recommandé

```
Développement Local (STAGING)
         ↓
    Pull Request (STAGING Preview)
         ↓
    Merge → Branch Preprod (PREPROD)
         ↓
    Validation PREPROD ✅
         ↓
    Merge → Main (PRODUCTION)
```

---

## 📞 Prochaines Étapes

1. **Lisez** le `DEPLOYMENT_GUIDE.md` pour les instructions détaillées
2. **Créez** les 2 projets Supabase (STAGING et PREPROD)
3. **Initialisez** les bases de données avec le script SQL
4. **Configurez** Vercel avec les nouvelles variables
5. **Testez** un déploiement sur chaque environnement

---

## ⚡ Commandes Utiles

```bash
# Développement local avec STAGING
cp .env.staging .env.local
# Puis éditez .env.local avec vos vraies valeurs
npm run dev

# Build local
npm run build

# Vérifier les types
npm run typecheck
```

---

## 🔒 Sécurité

- ✅ Fichiers `.env` sont dans `.gitignore`
- ⚠️ Les clés `anon` sont publiques (c'est normal)
- ❌ Ne jamais exposer les clés `service_role`
- 🔐 Considérer l'ajout d'authentification pour la production

---

## 💡 Conseil Pro

Pour différencier visuellement les environnements, vous pouvez :
- Ajouter un badge en haut de page indiquant l'environnement
- Utiliser une couleur de fond différente en STAGING/PREPROD
- Afficher un watermark "STAGING" ou "PREPROD"

Exemple d'implémentation rapide dans `app/layout.tsx` :

```tsx
{process.env.NODE_ENV !== 'production' && (
  <div className="fixed top-0 left-0 w-full bg-yellow-500 text-black text-center py-1 text-sm font-bold z-50">
    🚧 ENVIRONNEMENT DE TEST 🚧
  </div>
)}
```
