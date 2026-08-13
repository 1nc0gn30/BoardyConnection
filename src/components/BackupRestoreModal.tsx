import { ChangeEvent, useState } from 'react';
import { Cloud, Copy, Download, FileJson, LogIn, LogOut, Upload, X } from 'lucide-react';
import { exportToJSON, importFromJSON } from '../lib/connectionService';
import { BACKUP_EXAMPLE } from '../lib/backupSchema';
import { fetchCloudBackup, saveCloudBackup } from '../lib/cloudBackup';
import { useNetlifyIdentity } from '../lib/identity';

interface BackupRestoreModalProps {
  onClose: () => void;
  onDataImported: () => void;
}

export function BackupRestoreModal({
  onClose,
  onDataImported,
}: BackupRestoreModalProps) {
  const { user, email, open, logout, getToken } = useNetlifyIdentity();
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [pasteText, setPasteText] = useState('');
  const [copied, setCopied] = useState(false);
  const [cloudBusy, setCloudBusy] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    success?: boolean;
    message?: string;
  }>({});

  const applyImport = (jsonStr: string) => {
    const result = importFromJSON(jsonStr, importMode);
    if (result.success) {
      setImportStatus({
        success: true,
        message: `Imported ${result.importedCount} ${result.importedCount === 1 ? 'person' : 'people'} (${importMode}).`,
      });
      onDataImported();
    } else {
      setImportStatus({
        success: false,
        message: result.error || 'Could not import that JSON.',
      });
    }
  };

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
    setImportStatus({ success: true, message: 'Downloaded a local JSON backup.' });
    onDataImported();
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) applyImport(content);
    };
    reader.readAsText(file);
  };

  const handleCopyExample = async () => {
    await navigator.clipboard.writeText(JSON.stringify(BACKUP_EXAMPLE, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const handleCloudSave = async () => {
    setCloudBusy(true);
    const token = await getToken();
    if (!token) {
      setImportStatus({ success: false, message: 'Sign in first to save to the cloud.' });
      setCloudBusy(false);
      return;
    }
    const jsonStr = exportToJSON();
    const parsed = JSON.parse(jsonStr);
    const result = await saveCloudBackup(token, parsed);
    setCloudBusy(false);
    if (result.ok === true) {
      setImportStatus({
        success: true,
        message: `Saved ${parsed.connections.length} ${parsed.connections.length === 1 ? 'person' : 'people'} to your Netlify account.`,
      });
      onDataImported();
    } else {
      setImportStatus({ success: false, message: result.error });
    }
  };

  const handleCloudRestore = async () => {
    setCloudBusy(true);
    const token = await getToken();
    if (!token) {
      setImportStatus({ success: false, message: 'Sign in first to restore from the cloud.' });
      setCloudBusy(false);
      return;
    }
    const result = await fetchCloudBackup(token);
    setCloudBusy(false);
    if (result.ok === false) {
      setImportStatus({ success: false, message: result.error });
      return;
    }
    if (result.empty || !result.backup) {
      setImportStatus({ success: false, message: 'No cloud backup yet. Save one first.' });
      return;
    }
    applyImport(JSON.stringify(result.backup));
  };

  return (
    <div
      id="backup-modal-backdrop"
      className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="backup-modal-content"
        className="surface rounded-3xl glow-subtle w-full max-w-lg max-h-[90vh] overflow-y-auto my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 sticky top-0 z-10 backdrop-blur-xl">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-smile/15 text-smile border border-smile/25">
              <FileJson className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-extrabold text-white">Backup &amp; restore</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-6 text-xs sm:text-sm">
          <div className="surface-inset p-4 sm:p-5 rounded-2xl space-y-2.5">
            <h3 className="font-extrabold text-white flex items-center gap-2 text-sm">
              <Download className="w-4 h-4 text-kraft" />
              Download
            </h3>
            <p className="text-xs text-paper/60 leading-relaxed">
              Save everyone in this browser as a JSON file. Use that file on another device, or keep a copy.
            </p>
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-smile hover:bg-[#4b8cd4] text-white font-extrabold text-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Export JSON
            </button>
          </div>

          <div className="surface-inset p-4 sm:p-5 rounded-2xl space-y-3.5">
            <h3 className="font-extrabold text-white flex items-center gap-2 text-sm">
              <Upload className="w-4 h-4 text-kraft" />
              Import
            </h3>
            <p className="text-xs text-paper/60 leading-relaxed">
              Upload an exported file, or paste JSON. Each person needs an <code className="font-mono text-kraft">id</code> and <code className="font-mono text-kraft">personName</code>.
            </p>

            <div className="space-y-2 text-xs">
              <label className="flex items-start gap-2.5 cursor-pointer p-3 rounded-xl border border-line hover:border-kraft/40 transition-colors">
                <input
                  type="radio"
                  name="importMode"
                  value="merge"
                  checked={importMode === 'merge'}
                  onChange={() => setImportMode('merge')}
                  className="mt-0.5 shrink-0"
                />
                <div>
                  <span className="font-extrabold text-white">Merge</span>
                  <p className="text-paper/45 text-[11px] mt-0.5 leading-relaxed">
                    Add or update by id. Keeps your notes and stars if they already exist.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer p-3 rounded-xl border border-rose-900/50 hover:border-rose-700 transition-colors">
                <input
                  type="radio"
                  name="importMode"
                  value="replace"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                  className="mt-0.5 shrink-0"
                />
                <div>
                  <span className="font-extrabold text-rose-300">Replace</span>
                  <p className="text-rose-400/70 text-[11px] mt-0.5 leading-relaxed">
                    Wipe this browser and load only the file.
                  </p>
                </div>
              </label>
            </div>

            <input
              type="file"
              accept=".json,application/json"
              onChange={handleFileUpload}
              className="w-full text-xs text-paper/50 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-navy-mid file:text-kraft hover:file:bg-navy cursor-pointer"
            />

            <div>
              <label className="block font-bold text-paper/70 mb-1.5">Or paste JSON</label>
              <textarea
                id="backup-paste-json"
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder='{ "version": 1, "connections": [ { "id": "…", "personName": "…" } ] }'
                rows={5}
                className="w-full px-3 py-2.5 rounded-xl surface-inset text-xs font-mono text-paper placeholder:text-paper/30 focus:outline-hidden focus:ring-2 focus:ring-kraft/50"
              />
              <button
                type="button"
                onClick={() => applyImport(pasteText)}
                disabled={!pasteText.trim()}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-kraft hover:bg-kraft-bright text-ink font-bold text-xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Import pasted JSON
              </button>
            </div>

            <details className="rounded-xl border border-line px-3 py-2">
              <summary className="cursor-pointer font-bold text-paper/80 text-xs">
                JSON shape this app accepts
              </summary>
              <div className="mt-3 space-y-2">
                <p className="text-[11px] text-paper/50 leading-relaxed">
                  A version-1 object, or a bare array of people. Full schema:{' '}
                  <a href="/backup-schema.json" className="text-kraft hover:text-kraft-bright underline" target="_blank" rel="noreferrer">
                    backup-schema.json
                  </a>
                </p>
                <pre className="text-[10px] leading-relaxed overflow-x-auto p-3 rounded-lg bg-ink text-paper/80 font-mono">
{JSON.stringify(BACKUP_EXAMPLE, null, 2)}
                </pre>
                <button
                  type="button"
                  onClick={handleCopyExample}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-kraft hover:text-kraft-bright cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? 'Copied example' : 'Copy example'}
                </button>
              </div>
            </details>
          </div>

          <div className="surface-inset p-4 sm:p-5 rounded-2xl space-y-3">
            <h3 className="font-extrabold text-white flex items-center gap-2 text-sm">
              <Cloud className="w-4 h-4 text-kraft" />
              Optional cloud backup
            </h3>
            <p className="text-xs text-paper/60 leading-relaxed">
              Sign in with Netlify Identity to keep the same JSON on your account. This browser stays the live desk. Enable Identity on the Netlify site, then use <span className="font-mono">netlify dev</span> or a deployed URL.
            </p>

            {user ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-paper/70">Signed in as {email}</span>
                <button
                  type="button"
                  onClick={handleCloudSave}
                  disabled={cloudBusy}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-smile hover:bg-[#4b8cd4] text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  Save to cloud
                </button>
                <button
                  type="button"
                  onClick={handleCloudRestore}
                  disabled={cloudBusy}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-line text-paper font-semibold text-xs hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Restore from cloud
                </button>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-paper/60 hover:text-paper text-xs font-semibold cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => open('login')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-navy-mid border border-line text-paper font-bold text-xs hover:bg-navy transition-colors cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-kraft" />
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => open('signup')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-kraft font-bold text-xs hover:text-kraft-bright cursor-pointer"
                >
                  Create account
                </button>
              </div>
            )}
          </div>

          {importStatus.message && (
            <div
              className={`p-3.5 rounded-xl text-xs font-bold border ${
                importStatus.success
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                  : 'bg-rose-950/80 text-rose-300 border-rose-800'
              }`}
            >
              {importStatus.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
