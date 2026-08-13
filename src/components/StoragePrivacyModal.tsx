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
      className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="privacy-modal-content"
        className="surface rounded-3xl glow-subtle w-full max-w-lg max-h-[90vh] overflow-y-auto my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 sticky top-0 z-10 backdrop-blur-xl">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-extrabold text-white">
              Data Storage &amp; Privacy Notice
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm text-slate-300">
          <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl space-y-1.5">
            <div className="flex items-center gap-2 font-extrabold text-emerald-300">
              <HardDrive className="w-4 h-4 text-emerald-400" />
              <span>100% Local-First Storage</span>
            </div>
            <p className="text-xs text-emerald-200/90 leading-relaxed">
              This application operates without any external server or backend database.
              All connection records, notes, star ratings, and history logs live exclusively in your browser&apos;s <code className="font-mono bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">localStorage</code>.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-extrabold text-white text-sm">
              Important Data Loss Prevention Rules:
            </h3>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-300 leading-relaxed">
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

          <div className="space-y-2 pt-2 border-t border-slate-800">
            <h3 className="font-extrabold text-white text-sm">
              Deep Link Security &amp; Encoding:
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Deep links (<code className="font-mono bg-slate-950 border border-slate-800 px-1.5 py-0.5 rounded text-indigo-300">/update?payload=...</code>) use Base64 and URL encoding for transport. <strong>Base64 encoding is not encryption</strong> — anyone with access to the link can decode its payload. Private user notes and ratings are strictly excluded from deep links.
            </p>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenBackupModal();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-smile hover:bg-[#4b8cd4] text-white font-extrabold text-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Open Backup &amp; Export</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

