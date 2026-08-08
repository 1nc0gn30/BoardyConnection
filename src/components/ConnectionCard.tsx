import { FormEvent, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  ExternalLink,
  MessageSquare,
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

  const handleQuickSubmit = (e: FormEvent) => {
    e.preventDefault();
    onUpdateStatus(connection.id, selectedStatus, quickNote, rating);
    setIsQuickUpdating(false);
    setQuickNote('');
  };

  return (
    <div
      id={`connection-card-${connection.id}`}
      className={`bg-white dark:bg-slate-900 rounded-xl border transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
        connection.needsUpdate
          ? 'border-amber-400 dark:border-amber-600 ring-2 ring-amber-400/20 shadow-md'
          : 'border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      {/* "Needs your update" Header Bar */}
      {connection.needsUpdate && (
        <div className="bg-amber-100 dark:bg-amber-950/80 px-4 py-2 border-b border-amber-300 dark:border-amber-800 flex items-center justify-between text-xs font-semibold text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-pulse" />
            <span>Needs your update</span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClearNeedsUpdate(connection.id);
            }}
            className="text-amber-800 hover:text-amber-950 dark:text-amber-300 dark:hover:text-amber-100 text-[11px] underline cursor-pointer"
          >
            Dismiss tag
          </button>
        </div>
      )}

      {/* Main Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Top Row: Name, Status Badge, Menu */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <h3
                onClick={() => onSelect(connection)}
                className="text-base font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer flex items-center gap-2"
              >
                {connection.personName}
                {connection.linkedInUrl && (
                  <a
                    href={connection.linkedInUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-0.5"
                    title="Open LinkedIn Profile"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </h3>
              {connection.personRef && (
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                  ID: {connection.personRef}
                </p>
              )}
            </div>

            {/* Status Badge & Dropdown */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusInfo.badgeBg} ${statusInfo.badgeText} ${statusInfo.borderColor}`}
              >
                {statusInfo.label}
              </span>

              {/* Action Dropdown Menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Actions"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {showMenu && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-20 py-1 text-xs"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        onSelect(connection);
                      }}
                      className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                    >
                      View Details &amp; History
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        setIsQuickUpdating(true);
                      }}
                      className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                    >
                      Update Status
                    </button>
                    <hr className="my-1 border-slate-200 dark:border-slate-700" />
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        onDelete(connection.id);
                      }}
                      className="w-full text-left px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center gap-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Connection
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Intro Context */}
          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 my-2.5 leading-relaxed">
            {connection.introContext || 'No intro details provided.'}
          </p>

          {/* Meeting Date/Time & URL if available */}
          {(connection.meetingDateTime || connection.meetingUrl) && (
            <div className="flex flex-wrap items-center gap-3 my-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
              {connection.meetingDateTime && (
                <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  {new Date(connection.meetingDateTime).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
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
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-medium text-[11px] border border-indigo-200 dark:border-indigo-800 transition-colors"
                >
                  <Video className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                  <span>Join Meeting</span>
                </a>
              )}
            </div>
          )}

          {/* Existing Notes Preview & Rating Stars */}
          {(connection.userNotes || connection.rating) && (
            <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 space-y-1">
              {connection.rating && (
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-slate-400 font-medium">Rating:</span>
                  <div className="flex items-center text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= (connection.rating || 0)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300 dark:text-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {connection.userNotes && (
                <div className="flex items-start gap-1.5 italic text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-2 rounded border border-slate-100 dark:border-slate-800">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <p className="line-clamp-2 text-[11px]">{connection.userNotes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Status Update Drawer/Form */}
        {isQuickUpdating ? (
          <form
            onSubmit={handleQuickSubmit}
            onClick={(e) => e.stopPropagation()}
            className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-lg space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Update Status
              </span>
              <button
                type="button"
                onClick={() => setIsQuickUpdating(false)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Cancel
              </button>
            </div>

            {/* Status Select Buttons */}
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
                  className={`px-2 py-1.5 rounded text-[11px] font-medium border text-center transition-colors cursor-pointer ${
                    selectedStatus === st
                      ? 'bg-indigo-600 text-white border-indigo-600 font-semibold shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {STATUS_CONFIG[st].label}
                </button>
              ))}
            </div>

            {/* Optional Short Note */}
            <div>
              <input
                type="text"
                placeholder="Optional short note (e.g. Great call, sending email)..."
                value={quickNote}
                onChange={(e) => setQuickNote(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Optional Star Rating */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Rating:</span>
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
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300 dark:text-slate-700 hover:text-amber-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Status Update</span>
            </button>
          </form>
        ) : (
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsQuickUpdating(true);
              }}
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors cursor-pointer"
            >
              + Update Status
            </button>

            <button
              type="button"
              onClick={() => onSelect(connection)}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer font-medium"
            >
              <span>View Details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Footer Timestamp */}
      <div className="px-4 py-1.5 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-400" />
          Updated {new Date(connection.updatedAt).toLocaleDateString()}
        </span>
        <span>{connection.statusHistory.length} status logs</span>
      </div>
    </div>
  );
}
