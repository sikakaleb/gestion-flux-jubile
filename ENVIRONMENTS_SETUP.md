# 🚀 Configuration Multi-Environnements

## 📊 Vue d'Ensemble

Vous avez **1 base de données active** (PRODUCTION) et devez en créer **2 nouvelles** (STAGING et PREPROD).

```
┌─────────────────────────────────────────────────────────────────┐
│                    ARCHITECTURE ACTUELLE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🟢 PRODUCTION (Existante - 50 passagers)                       │
│     └── tvawgqhhnfzfqtgoqjus.supabase.co                        │
│                                                                  │
│  🟡 STAGING (À créer)                                           │
│     └── passenger-manager-staging                               │
│                                                                  │
│  🟠 PREPROD (À créer)                                           │
│     └── passenger-manager-preprod                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## ⚡ ÉTAPES RAPIDES (15 minutes)

### 1️⃣ CRÉER STAGING (5 min)

**Sur Supabase Dashboard:**
1. Nouveau projet → `passenger-manager-staging`
2. Copier URL + Anon Key
3. SQL Editor → Coller contenu de `supabase/init-database.sql`
4. Run

**Sur Vercel:**
1. Settings > Environment Variables
2. Ajouter `NEXT_PUBLIC_SUPABASE_URL` (Preview)
3. Ajouter `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Preview)

### 2️⃣ CRÉER PREPROD (5 min)

Répéter les mêmes étapes avec `passenger-manager-preprod`

### 3️⃣ TESTER (5 min)

Créer une Pull Request → Vercel déploie automatiquement sur STAGING → Tester l'URL preview

---

## 📚 Documentation Disponible

| Fichier | Quand l'utiliser |
|---------|------------------|
| **ENVIRONMENTS_SUMMARY.md** | Vue rapide des 3 environnements |
| **DEPLOYMENT_GUIDE.md** | Guide complet et détaillé (LIRE EN PREMIER) |
| **CREDENTIALS_TEMPLATE.md** | Noter vos credentials pendant la config |
| **supabase/init-database.sql** | Script SQL à exécuter sur chaque nouvelle DB |
| **ADMIN_GUIDE.md** | Comment utiliser le panneau admin |
| **.env.staging** | Template de variables pour STAGING |
| **.env.preprod** | Template de variables pour PREPROD |
| **.env.production** | Variables actuelles de production |

---

## 🎯 Workflow de Déploiement

```
Development (Local)
        ↓
Pull Request → 🟡 STAGING (Auto-deploy Preview)
        ↓
Merge → 🟠 PREPROD (Validation finale)
        ↓
Merge → main → 🟢 PRODUCTION (Auto-deploy)
```

---

## ✅ Checklist Rapide

### STAGING
- [ ] Projet Supabase créé
- [ ] Base de données initialisée
- [ ] Variables Vercel configurées (Preview)
- [ ] Test PR déployée et testée

### PREPROD
- [ ] Projet Supabase créé
- [ ] Base de données initialisée
- [ ] Variables configurées
- [ ] URL testée et fonctionnelle

### PRODUCTION
- [ ] Variables vérifiées
- [ ] Application testée
- [ ] Aucune modification nécessaire ✅

---

## 📞 Pour Plus de Détails

Consultez **DEPLOYMENT_GUIDE.md** pour le guide complet étape par étape avec tous les détails techniques, captures d'écran conceptuelles, et instructions de sécurité.
