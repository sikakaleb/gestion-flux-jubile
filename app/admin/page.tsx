'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Lock, RefreshCw, AlertCircle, CheckCircle, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { parsePassengerCSV } from '@/utils/csvParser';
import { upsertPassengers } from '@/utils/passengerImport';
import { toast } from 'sonner';
import { clsx } from 'clsx';

const ADMIN_PIN = '23700';

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);

  const [sheetUrl, setSheetUrl] = useState(
    'https://docs.google.com/spreadsheets/d/1eBtzgwsUKQxw5L_-E6q2ncLok_4x3vBV6NLDSe1EMPA/edit?usp=sharing'
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [logs, setLogs] = useState<Array<{ type: 'info' | 'success' | 'error' | 'warning'; message: string }>>([]);

  const addLog = (type: 'info' | 'success' | 'error' | 'warning', message: string) => {
    setLogs((prev) => [...prev, { type, message }]);
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
      toast.error('Code PIN incorrect');
    }
  };

  const convertToCSVUrl = (url: string): string => {
    // Convert Google Sheets URL to CSV export URL
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) {
      throw new Error('URL Google Sheets invalide');
    }
    const spreadsheetId = match[1];

    // Extract gid (sheet ID) from URL if present
    const gidMatch = url.match(/[#&]gid=([0-9]+)/);

    // Default to gid=1 (second tab - "Details_Inscriptions") if no gid found
    // Note: Google Sheets API doesn't support tab selection by name, only by gid
    const gid = gidMatch ? gidMatch[1] : '1';

    return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;
  };

  const handleSync = async () => {
    if (!sheetUrl.trim()) {
      toast.error('Veuillez entrer une URL Google Sheets');
      return;
    }

    setIsSyncing(true);
    setLogs([]);

    try {
      // Convert URL
      addLog('info', '🔄 Préparation de la synchronisation...');
      const csvUrl = convertToCSVUrl(sheetUrl);

      // Extract and display which sheet tab is being used
      const gidMatch = csvUrl.match(/gid=([0-9]+)/);
      const gidNumber = gidMatch ? gidMatch[1] : '1';
      const sheetInfo = gidNumber === '1'
        ? 'Deuxième onglet "Details_Inscriptions" (par défaut)'
        : gidNumber === '0'
        ? 'Premier onglet'
        : `Onglet avec gid=${gidNumber}`;

      addLog('info', `📋 Source: ${sheetInfo}`);

      // Fetch CSV
      addLog('info', '⬇️ Téléchargement du CSV depuis Google Sheets...');
      const response = await fetch(csvUrl);

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Accès refusé. Assurez-vous que le Google Sheet est partagé en "Lecture pour tous ceux qui ont le lien"');
        }
        throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
      }

      const csvContent = await response.text();
      const rowCount = csvContent.split('\n').length - 1;
      addLog('success', `✅ CSV téléchargé avec succès. ${rowCount} lignes trouvées.`);

      // Parse CSV
      addLog('info', '🔍 Analyse du CSV et application des filtres...');
      const parseResult = await parsePassengerCSV(csvContent);

      if (parseResult.errors.length > 0) {
        addLog('warning', `⚠️ ${parseResult.errors.length} erreur(s) de parsing détectée(s):`);
        parseResult.errors.forEach((error) => {
          addLog('error', `   • ${error}`);
        });
      }

      if (parseResult.skipped > 0) {
        addLog('info', `⏭️ ${parseResult.skipped} ligne(s) ignorée(s) (ne correspondent pas au filtre "PRIS EN CHARGE")`);
      }

      if (parseResult.passengers.length === 0) {
        addLog('error', '❌ Aucun passager valide trouvé après filtrage.');
        toast.error('Aucun passager à synchroniser');
        return;
      }

      addLog('success', `✅ ${parseResult.passengers.length} passager(s) valide(s) extrait(s) du CSV.`);

      // Count arrivals and departures
      const arrivals = parseResult.passengers.filter(p => p.direction === 'arrival').length;
      const departures = parseResult.passengers.filter(p => p.direction === 'departure').length;
      addLog('info', `   📥 Arrivées: ${arrivals} | 📤 Départs: ${departures}`);

      // Upsert to database
      addLog('info', '💾 Synchronisation avec la base de données...');
      const importResult = await upsertPassengers(parseResult.passengers);

      if (importResult.errors.length > 0) {
        addLog('warning', `⚠️ ${importResult.errors.length} erreur(s) lors de l'import:`);
        importResult.errors.slice(0, 5).forEach((error) => {
          addLog('error', `   • ${error}`);
        });
        if (importResult.errors.length > 5) {
          addLog('error', `   ... et ${importResult.errors.length - 5} autre(s) erreur(s)`);
        }
      }

      addLog('success', `✅ Synchronisation terminée avec succès!`);
      addLog('info', `   📊 Nouveaux passagers créés: ${importResult.created}`);
      addLog('info', `   🔄 Passagers mis à jour: ${importResult.updated}`);

      toast.success(`Sync réussie: ${importResult.created} créés, ${importResult.updated} mis à jour`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      addLog('error', `❌ Erreur: ${errorMessage}`);
      toast.error(`Échec de la synchronisation: ${errorMessage}`);
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Administration</h1>
            <p className="text-slate-600 dark:text-slate-400">Entrez le code PIN pour continuer</p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Code PIN"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setPinError(false);
                }}
                className={clsx(
                  'text-center text-2xl tracking-widest',
                  pinError && 'border-red-500 focus-visible:ring-red-500'
                )}
                maxLength={5}
                autoFocus
              />
              {pinError && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Code PIN incorrect
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" size="lg">
              Déverrouiller
            </Button>
          </form>

          <Button
            variant="ghost"
            className="w-full"
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <Database className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              Panneau d'Administration
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Synchronisation Google Sheets → Supabase
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </div>

        {/* Configuration Card */}
        <Card className="p-6 space-y-4 shadow-lg">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
              URL de la Google Sheet
            </label>
            <Input
              type="url"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              className="font-mono text-sm"
              disabled={isSyncing}
            />
            <div className="mt-2 space-y-2">
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded p-3">
                <p className="text-xs font-semibold text-amber-900 dark:text-amber-100 mb-1">
                  ⚠️ Important - Sélection de l'onglet
                </p>
                <ol className="text-xs text-amber-800 dark:text-amber-200 space-y-1 list-decimal list-inside">
                  <li>Ouvrez votre Google Sheet</li>
                  <li><strong>Cliquez sur l'onglet contenant les données</strong> (ex: "Details_Inscriptions")</li>
                  <li>Copiez l'URL complète de la barre d'adresse</li>
                  <li>Collez-la ci-dessus (elle doit contenir <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">#gid=...</code>)</li>
                </ol>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Si aucun gid n'est trouvé, le système utilisera le <strong>deuxième onglet</strong> par défaut.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Le Sheet doit être partagé en <strong>"Lecture pour tous ceux qui ont le lien"</strong>
              </p>
            </div>
          </div>

          <Button
            onClick={handleSync}
            disabled={isSyncing || !sheetUrl.trim()}
            className="w-full"
            size="lg"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Synchronisation en cours...
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5 mr-2" />
                🔄 SYNC DATA
              </>
            )}
          </Button>
        </Card>

        {/* Logs Card */}
        {logs.length > 0 && (
          <Card className="p-6 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Journal de Synchronisation
              </h2>
              <Badge variant="outline">{logs.length} entrées</Badge>
            </div>

            <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-4 max-h-96 overflow-y-auto font-mono text-sm">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className={clsx(
                    'py-1 flex items-start gap-2',
                    log.type === 'error' && 'text-red-400',
                    log.type === 'warning' && 'text-yellow-400',
                    log.type === 'success' && 'text-green-400',
                    log.type === 'info' && 'text-blue-300'
                  )}
                >
                  {log.type === 'error' && <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                  {log.type === 'success' && <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                  <span className="break-all">{log.message}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Info Card */}
        <Card className="p-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Règles de Synchronisation
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1.5 list-disc list-inside">
            <li>
              <strong>Filtre STATUT</strong> : Seules les lignes dont le champ <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">STATUT</code> contient "PRIS EN CHARGE" sont importées
              <ul className="ml-6 mt-1 space-y-0.5 list-circle">
                <li>Comparaison insensible à la casse (majuscules/minuscules)</li>
                <li>Exemples acceptés : "PRIS EN CHARGE PAR LA COMMISSION", "ENFANT - PRIS EN CHARGE PAR LA COMMISSION"</li>
                <li>Les autres statuts sont ignorés et comptabilisés</li>
              </ul>
            </li>
            <li>Les champs <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">status</code> et <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">is_urgent</code> existants ne sont jamais écrasés</li>
            <li>Les informations de vol et d'hébergement sont toujours mises à jour</li>
            <li>Un passager peut avoir une arrivée ET un départ (2 enregistrements)</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
