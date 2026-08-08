import { Download, HardDriveDownload, X } from 'lucide-react';
import { exportToJSON } from '../lib/connectionService';

interface BackupReminderBannerProps {
  recordCount: number;
  lastExportedAt: string | null;
  onExported: () => void;
  onDismiss: () => void;
}

export function BackupReminderBanner({
  recordCount,
  lastExportedAt,
  onExported,
  onDismiss,
}: BackupReminderBannerProps) {
  const handleQuickExport = () => {
    const jsonStr = exportToJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `connection-dashboard-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onExported();
  };

  const timeAgoText = lastExportedAt
    ? `Last exported on ${new Date(lastExportedAt).toLocaleDateString()}`
    : 'No recent JSON backup found';

  return (
    <div
      id="backup-reminder-banner"
      className="bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-xl p-3 sm:p-4 mb-6 text-xs sm:text-sm text-indigo-900 dark:text-indigo-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
    >
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/80 rounded-lg text-indigo-700 dark:text-indigo-300 shrink-0">
          <HardDriveDownload className="w-4 h-4" />
        </div>
        <div>
          <span className="font-bold text-indigo-950 dark:text-indigo-100">
            Backup Reminder ({recordCount} {recordCount === 1 ? 'record' : 'records'})
          </span>
          <p className="text-xs text-indigo-700 dark:text-indigo-300/80">
            {timeAgoText}. Protect your data against browser cache clears.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
        <button
          type="button"
          onClick={handleQuickExport}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Backup</span>
        </button>

        <button
          type="button"
          onClick={onDismiss}
          className="p-1 rounded-lg text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors cursor-pointer"
          title="Dismiss reminder"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
