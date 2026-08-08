import { ChangeEvent, useState } from 'react';
import { Download, FileJson, Upload, X } from 'lucide-react';
import { exportToJSON, importFromJSON } from '../lib/connectionService';

interface BackupRestoreModalProps {
  onClose: () => void;
  onDataImported: () => void;
}

export function BackupRestoreModal({
  onClose,
  onDataImported,
}: BackupRestoreModalProps) {
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [importStatus, setImportStatus] = useState<{
    success?: boolean;
    message?: string;
  }>({});

  const handleExport = () => {
    const jsonStr = exportToJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().slice(0, 10);
    const a = document.createElement('a');
    a.href = url;
    a.download = `connection-dashboard-backup-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const result = importFromJSON(content, importMode);
      if (result.success) {
        setImportStatus({
          success: true,
          message: `Successfully imported ${result.importedCount} record(s) (${importMode} mode).`,
        });
        onDataImported();
      } else {
        setImportStatus({
          success: false,
          message: result.error || 'Failed to import backup file.',
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      id="backup-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="backup-modal-content"
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileJson className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Backup &amp; Restore Local Data
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6 text-xs sm:text-sm">
          {/* Section 1: Export */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Download className="w-4 h-4 text-indigo-500" />
              1. Download JSON Backup
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Save your local connection records as a JSON file. Use this file to migrate data to another browser or back up your notes.
            </p>
            <button
              type="button"
              onClick={handleExport}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Export .JSON Backup
            </button>
          </div>

          {/* Section 2: Import */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Upload className="w-4 h-4 text-indigo-500" />
              2. Restore / Import JSON Backup
            </h3>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-900 dark:text-amber-200">
              <strong>Import Safety Warning:</strong> Importing will merge or replace your local records depending on the mode selected below. Local data is never silently overwritten.
            </div>

            {/* Mode selector */}
            <div className="space-y-2 text-xs">
              <label className="flex items-start gap-2 cursor-pointer p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-300 transition-colors">
                <input
                  type="radio"
                  name="importMode"
                  value="merge"
                  checked={importMode === 'merge'}
                  onChange={() => setImportMode('merge')}
                  className="mt-0.5 text-indigo-600 focus:ring-indigo-500 shrink-0"
                />
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    Merge Mode (Recommended)
                  </span>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                    Combines imported items with your current records by ID. Preserves your existing private notes, ratings, and history.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-2 cursor-pointer p-2.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-900 hover:border-rose-300 transition-colors">
                <input
                  type="radio"
                  name="importMode"
                  value="replace"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                  className="mt-0.5 text-rose-600 focus:ring-rose-500 shrink-0"
                />
                <div>
                  <span className="font-bold text-rose-900 dark:text-rose-300">
                    Replace Mode (Wipe &amp; Replace)
                  </span>
                  <p className="text-rose-700 dark:text-rose-400/80 text-[11px] mt-0.5">
                    Completely replaces all current local records with the contents of the imported JSON file.
                  </p>
                </div>
              </label>
            </div>

            <div className="relative pt-1">
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200 dark:file:bg-indigo-950 dark:file:text-indigo-300 cursor-pointer"
              />
            </div>

            {importStatus.message && (
              <div
                className={`p-3 rounded-lg text-xs font-semibold ${
                  importStatus.success
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200'
                }`}
              >
                {importStatus.message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
