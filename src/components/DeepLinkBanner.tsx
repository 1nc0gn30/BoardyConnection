import { AlertTriangle, Calendar, Check, ExternalLink, X } from 'lucide-react';
import { DeepLinkPayload, STATUS_CONFIG } from '../types/connection';
import { BoardyMark } from './BoardyMark';

interface DeepLinkBannerProps {
  payload: DeepLinkPayload | null;
  error: string | null;
  saved?: boolean;
  isNew?: boolean;
  onOpen?: () => void;
  onDismiss: () => void;
}

export function DeepLinkBanner({
  payload,
  error,
  saved = false,
  isNew = false,
  onOpen,
  onDismiss,
}: DeepLinkBannerProps) {
  if (!payload && !error) return null;

  return (
    <div id="deep-link-banner" className="mb-5 rounded-2xl surface relative">
      {error ? (
        <div className="p-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-paper">This intro link didn’t work</h3>
              <p className="text-xs text-paper/60 mt-1">{error}</p>
              <p className="text-xs text-paper/45 mt-1">Your people are unchanged.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="text-paper/40 hover:text-paper p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : payload ? (
        <div className="p-4 sm:p-5">
          <button
            type="button"
            onClick={onDismiss}
            className="absolute top-3 right-3 text-paper/40 hover:text-paper p-1.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Close intro preview"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5 mb-3">
            <BoardyMark size="sm" alt="Boardy" className="rounded-lg mark-ring" />
            <p className="text-xs font-semibold text-kraft">
              {saved
                ? isNew
                  ? 'Saved to this browser'
                  : 'Updated in this browser'
                : 'Boardy introduced you to'}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div className="space-y-2 max-w-2xl pr-6">
              <h2 className="text-xl font-bold text-paper">{payload.personName}</h2>

              {payload.introContext && (
                <p className="text-sm text-paper/70 leading-relaxed">
                  {payload.introContext}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2.5 text-xs pt-0.5 text-paper/55">
                {payload.status && STATUS_CONFIG[payload.status] && (
                  <span className="font-semibold text-paper/80">
                    {STATUS_CONFIG[payload.status].label}
                  </span>
                )}

                {payload.meetingDateTime && (
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-kraft" />
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
                    className="inline-flex items-center gap-1 text-kraft hover:text-kraft-bright font-medium"
                  >
                    LinkedIn <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {saved && onOpen && (
              <button
                type="button"
                onClick={onOpen}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-kraft hover:bg-kraft-bright text-ink font-bold text-sm transition-colors cursor-pointer shrink-0"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Open {payload.personName.split(' ')[0]}</span>
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
