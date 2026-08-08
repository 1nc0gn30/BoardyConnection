import {
  Download,
  Link as LinkIcon,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  Users,
} from 'lucide-react';
import { PrivacyBadge } from './PrivacyBadge';

interface HeaderProps {
  onOpenAddModal: () => void;
  onOpenBackupModal: () => void;
  onOpenLinkGenerator: () => void;
  onOpenStorageModal: () => void;
  onTriggerDemoLink: () => void;
  onClearData: () => void;
  onLoadSampleData: () => void;
  totalConnections: number;
}

export function Header({
  onOpenAddModal,
  onOpenBackupModal,
  onOpenLinkGenerator,
  onOpenStorageModal,
  onTriggerDemoLink,
  onClearData,
  onLoadSampleData,
  totalConnections,
}: HeaderProps) {
  return (
    <header id="main-header" className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* App Brand & Title */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 font-bold text-lg">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  Connection Dashboard
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    v1 MVP
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  Track personal introductions, meeting notes, and follow-up updates locally.
                </p>
              </div>
            </div>

            <div className="mt-1">
              <PrivacyBadge onClickInfo={onOpenStorageModal} />
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <button
              type="button"
              id="header-btn-demo"
              onClick={onTriggerDemoLink}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:hover:bg-amber-900/80 dark:text-amber-200 dark:border-amber-800 transition-colors shadow-xs cursor-pointer"
              title="Simulate receiving a Boardy deep link update"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Try Demo Deep Link</span>
            </button>

            <button
              type="button"
              id="header-btn-add"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Connection</span>
            </button>

            <button
              type="button"
              id="header-btn-backup"
              onClick={onOpenBackupModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              title="Backup or restore JSON connection records"
            >
              <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Backup / Restore</span>
            </button>

            <button
              type="button"
              id="header-btn-generator"
              onClick={onOpenLinkGenerator}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              title="Generate custom deep link payloads"
            >
              <LinkIcon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Link Generator</span>
            </button>

            {totalConnections === 0 ? (
              <button
                type="button"
                id="header-btn-samples"
                onClick={onLoadSampleData}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Load Sample Data</span>
              </button>
            ) : (
              <button
                type="button"
                id="header-btn-clear"
                onClick={onClearData}
                className="inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium rounded-lg text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer"
                title="Clear all stored local data with confirmation"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear All</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
