import { useState } from 'react';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface AdminImportProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

interface ImportResult {
  success: number;
  errors: string[];
}

export function AdminImport({ isOpen, onClose, onImportComplete }: AdminImportProps) {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setResult(null);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter((line) => line.trim());
      const headers = lines[0].split(',').map((h) => h.trim());

      const errors: string[] = [];
      let success = 0;

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v) => v.trim());

        if (values.length !== headers.length) {
          errors.push(`Ligne ${i + 1}: nombre de colonnes incorrect`);
          continue;
        }

        const passenger: any = {};
        headers.forEach((header, index) => {
          passenger[header] = values[index];
        });

        const { error } = await supabase.from('passengers').insert({
          first_name: passenger.first_name,
          last_name: passenger.last_name,
          flight_date: passenger.flight_date,
          flight_time: passenger.flight_time,
          airline: passenger.airline,
          accommodation: passenger.accommodation,
          direction: passenger.direction,
          status: 'pending',
        });

        if (error) {
          errors.push(`Ligne ${i + 1}: ${error.message}`);
        } else {
          success++;
        }
      }

      setResult({ success, errors });
      if (success > 0) {
        onImportComplete();
      }
    } catch (error) {
      setResult({ success: 0, errors: ['Erreur de lecture du fichier CSV'] });
    } finally {
      setImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">Importer des passagers</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {!result ? (
          <div>
            <p className="text-slate-600 mb-4 text-sm">
              Téléchargez un fichier CSV avec les colonnes suivantes :
            </p>
            <code className="block bg-slate-50 p-3 rounded-lg text-xs mb-4 overflow-x-auto">
              first_name,last_name,flight_date,flight_time,airline,accommodation,direction
            </code>

            <label className="block">
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-slate-400 transition-colors cursor-pointer">
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">
                  {importing ? 'Importation...' : 'Cliquez pour sélectionner un fichier CSV'}
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  disabled={importing}
                  className="hidden"
                />
              </div>
            </label>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">{result.success} passagers importés</span>
              </div>

              {result.errors.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 text-red-600 mb-2">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-semibold">{result.errors.length} erreurs</span>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3 max-h-40 overflow-y-auto">
                    {result.errors.map((error, index) => (
                      <p key={index} className="text-xs text-red-700 mb-1">
                        {error}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setResult(null);
                onClose();
              }}
              className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors"
            >
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
