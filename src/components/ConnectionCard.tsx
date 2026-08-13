import { FormEvent, useState } from 'react';
import {
  Calendar,
  Check,
  ChevronRight,
  ExternalLink,
  MoreVertical,
  Star,
  Trash2,
  Video,
} from 'lucide-react';
import { ConnectionRecord, ConnectionStatus, STATUS_CONFIG } from '../types/connection';

interface ConnectionCardProps {
  key?: string;
  connection: ConnectionRecord;
  onSelect: (connection: ConnectionRecord) => void;
  onUpdateStatus: (
    id: string,
    status: ConnectionStatus,
    note?: string,
    rating?: number
  ) => void;
  onDelete: (id: string) => void;
  onClearNeedsUpdate: (id: string) => void;
}

export function ConnectionCard({
  connection,
  onSelect,
  onUpdateStatus,
  onDelete,
  onClearNeedsUpdate,
}: ConnectionCardProps) {
  const [isQuickUpdating, setIsQuickUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ConnectionStatus>(connection.status);
  const [quickNote, setQuickNote] = useState('');
  const [rating, setRating] = useState<number | undefined>(connection.rating);
  const [showMenu, setShowMenu] = useState(false);

  const statusInfo = STATUS_CONFIG[connection.status];
  const initials = connection.personName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  const handleQuickSubmit = (e: FormEvent) => {
    e.preventDefault();
    onUpdateStatus(connection.id, selectedStatus, quickNote, rating);
    setIsQuickUpdating(false);
    setQuickNote('');
  };

  return (
    <div
      id={`connection-card-${connection.id}`}
      className={`surface rounded-2xl relative flex flex-col justify-between transition-colors ${
        connection.needsUpdate ? 'border-kraft/60' : 'hover:border-kraft/30'
      }`}
    >
      {connection.needsUpdate && (
        <div className="px-5 pt-3.5 flex items-center justify-between text-[11px] font-bold text-kraft">
          <span>Needs a note from you</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClearNeedsUpdate(connection.id);
            }}
            className="font-semibold text-kraft/70 hover:text-paper underline cursor-pointer transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-navy-mid text-kraft-bright font-bold flex items-center justify-center text-sm shrink-0 border border-kraft/20">
                {initials || connection.personName.substring(0, 2).toUpperCase()}
              </div>

              <div className="min-w-0">
                <h3
                  onClick={() => onSelect(connection)}
                  className="text-[15px] font-bold text-paper hover:text-kraft-bright transition-colors cursor-pointer truncate flex items-center gap-1.5"
                >
                  {connection.personName}
                  {connection.linkedInUrl && (
                    <a
                      href={connection.linkedInUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-paper/35 hover:text-smile transition-colors p-0.5"
                      title="Open LinkedIn"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </h3>
                <p className="text-[11px] text-paper/45 truncate mt-0.5">
                  {STATUS_CONFIG[connection.status].description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusInfo.badgeBg} ${statusInfo.badgeText} ${statusInfo.borderColor}`}
              >
                {statusInfo.label}
              </span>

              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  className="p-1.5 rounded-lg text-paper/40 hover:text-paper hover:bg-white/5 transition-colors cursor-pointer"
                  aria-label="Actions"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {showMenu && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 mt-1 w-44 surface rounded-xl glow-subtle z-20 py-1.5 text-xs"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        onSelect(connection);
                      }}
                      className="w-full text-left px-3.5 py-2 text-paper/90 hover:bg-white/5 font-medium"
                    >
                      Open
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        setIsQuickUpdating(true);
                      }}
                      className="w-full text-left px-3.5 py-2 text-paper/90 hover:bg-white/5 font-medium"
                    >
                      Update
                    </button>
                    <hr className="my-1 border-line" />
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        onDelete(connection.id);
                      }}
                      className="w-full text-left px-3.5 py-2 text-rose-400 hover:bg-rose-950/40 flex items-center gap-2 font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <p className="text-sm text-paper/70 line-clamp-2 mt-3.5 leading-relaxed">
            {connection.introContext || 'No intro details yet.'}
          </p>

          {(connection.meetingDateTime || connection.meetingUrl) && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-3 text-xs text-paper/70">
              {connection.meetingDateTime && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-kraft" />
                  {new Date(connection.meetingDateTime).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              )}

              {connection.meetingUrl && (
                <a
                  href={connection.meetingUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 font-semibold text-smile hover:text-kraft-bright transition-colors"
                >
                  <Video className="w-3.5 h-3.5" />
                  Join
                </a>
              )}
            </div>
          )}

          {(connection.userNotes || connection.rating) && (
            <div className="mt-3 space-y-1.5">
              {connection.rating ? (
                <div className="flex items-center gap-0.5 text-kraft">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3.5 h-3.5 ${
                        star <= (connection.rating || 0)
                          ? 'fill-kraft text-kraft'
                          : 'text-line'
                      }`}
                    />
                  ))}
                </div>
              ) : null}

              {connection.userNotes && (
                <p className="text-xs text-paper/55 line-clamp-2 leading-relaxed">
                  {connection.userNotes}
                </p>
              )}
            </div>
          )}
        </div>

        {isQuickUpdating ? (
          <form
            onSubmit={handleQuickSubmit}
            onClick={(e) => e.stopPropagation()}
            className="mt-4 pt-3 border-t border-kraft/15 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-paper">How did it go?</span>
              <button
                type="button"
                onClick={() => setIsQuickUpdating(false)}
                className="text-xs text-paper/45 hover:text-paper"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {(
                [
                  'met',
                  'connected',
                  'reschedule',
                  'did_not_connect',
                  'scheduled',
                  'ongoing',
                ] as ConnectionStatus[]
              ).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setSelectedStatus(st)}
                  className={`px-2 py-1.5 rounded-lg text-[11px] font-bold border text-center transition-colors cursor-pointer ${
                    selectedStatus === st
                      ? 'bg-smile text-white border-smile'
                      : 'bg-transparent text-paper/70 border-line hover:bg-white/5'
                  }`}
                >
                  {STATUS_CONFIG[st].label}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Optional note — great call, sending a follow-up…"
              value={quickNote}
              onChange={(e) => setQuickNote(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl surface-inset text-paper placeholder:text-paper/35 focus:outline-hidden focus:ring-2 focus:ring-kraft/50"
            />

            <div className="flex items-center justify-between text-xs">
              <span className="text-paper/45 font-medium">Stars</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s === rating ? undefined : s)}
                    className="p-1 cursor-pointer"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        rating && s <= rating
                          ? 'fill-kraft text-kraft'
                          : 'text-line hover:text-kraft'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-smile hover:bg-[#4b8cd4] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Save</span>
            </button>
          </form>
        ) : (
          <div className="mt-4 pt-3 border-t border-kraft/10 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsQuickUpdating(true);
              }}
              className="font-bold text-kraft hover:text-kraft-bright transition-colors cursor-pointer"
            >
              Update
            </button>

            <button
              type="button"
              onClick={() => onSelect(connection)}
              className="inline-flex items-center gap-1 text-paper/45 hover:text-paper transition-colors cursor-pointer font-semibold"
            >
              <span>Open</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
