import { Download, HardDrive, ShieldCheck, X } from 'lucide-react';

interface StoragePrivacyModalProps {
  onClose: () => void;
  onOpenBackupModal: () => void;
}

export function StoragePrivacyModal({
  onClose,
  onOpenBackupModal,
}: StoragePrivacyModalProps) {
  return (
    <div
      id="privacy-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="privacy-modal-content"
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Data Storage &amp; Privacy Notice
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

        <div className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-1">
            <div className="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-200">
              <HardDrive className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>100% Local-First Storage</span>
            </div>
            <p className="text-xs text-emerald-800 dark:text-emerald-300/90 leading-relaxed">
              This application operates without any external server or backend database.
              All connection records, notes, star ratings, and history logs live exclusively in your browser&apos;s <code className="font-mono bg-emerald-100 dark:bg-emerald-900/80 px-1 rounded">localStorage</code>.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              Important Data Loss Prevention Rules:
            </h3>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <strong>Browser Cache Clears:</strong> Clearing your browser history, site cookies, or website data will wipe all stored connections.
              </li>
              <li>
                <strong>Different Devices / Browsers:</strong> Records created in Chrome on your laptop will not automatically appear in Safari or on your phone.
              </li>
              <li>
                <strong>Regular JSON Exports:</strong> Always export a JSON backup before clearing site data or when switching devices.
              </li>
            </ul>
          </div>

          <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              Deep Link Security &amp; Encoding:
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Deep links (<code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">/update?payload=...</code>) use Base64 and URL encoding for transport. <strong>Base64 encoding is not encryption</strong> — anyone with access to the link can decode its payload. Private user notes and ratings are strictly excluded from deep links.
            </p>
          </div>

          <div className="pt-3 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenBackupModal();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Open Backup &amp; Export</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
