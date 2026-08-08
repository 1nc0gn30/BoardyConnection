import { AlertTriangle, Calendar, Check, ExternalLink, Sparkles, X } from 'lucide-react';
import { DeepLinkPayload, STATUS_CONFIG } from '../types/connection';

interface DeepLinkBannerProps {
  payload: DeepLinkPayload | null;
  error: string | null;
  onImport: () => void;
  onDismiss: () => void;
}

export function DeepLinkBanner({
  payload,
  error,
  onImport,
  onDismiss,
}: DeepLinkBannerProps) {
  if (!payload && !error) return null;

  return (
    <div
      id="deep-link-banner"
      className="mb-6 rounded-xl border shadow-md overflow-hidden bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-900 transition-all animate-in fade-in slide-in-from-top-3 duration-300"
    >
      {error ? (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border-l-4 border-rose-500 text-rose-900 dark:text-rose-200 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold">Invalid or Malformed Deep Link</h3>
              <p className="text-xs text-rose-800 dark:text-rose-300 mt-0.5">{error}</p>
              <p className="text-xs text-rose-700 dark:text-rose-400 mt-1 italic">
                Your existing connection data was preserved without changes.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="text-rose-500 hover:text-rose-700 p-1 rounded-md transition-colors cursor-pointer"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : payload ? (
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-4 sm:p-5 relative">
          <button
            type="button"
            onClick={onDismiss}
            className="absolute top-3 right-3 text-indigo-200 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
            aria-label="Close deep link preview"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-300 mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Incoming Deep Link Payload (Version v:{payload.v})</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1 max-w-2xl">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {payload.personName}
                {payload.personRef && (
                  <span className="text-xs font-normal px-2 py-0.5 rounded bg-indigo-700/80 text-indigo-200 border border-indigo-600">
                    Ref: {payload.personRef}
                  </span>
                )}
              </h2>

              {payload.introContext && (
                <p className="text-xs sm:text-sm text-indigo-100/90 line-clamp-2">
                  &ldquo;{payload.introContext}&rdquo;
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
                {payload.status && STATUS_CONFIG[payload.status] && (
                  <span className="px-2 py-0.5 rounded-full font-medium bg-indigo-700 text-indigo-100 border border-indigo-500">
                    Status: {STATUS_CONFIG[payload.status].label}
                  </span>
                )}

                {payload.meetingDateTime && (
                  <span className="inline-flex items-center gap-1 text-indigo-200">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(payload.meetingDateTime).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                )}

                {payload.linkedInUrl && (
                  <a
                    href={payload.linkedInUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-indigo-300 hover:text-white underline"
                  >
                    LinkedIn <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onImport}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Import &amp; Review Connection</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
