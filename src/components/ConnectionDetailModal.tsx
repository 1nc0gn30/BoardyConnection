import { useState } from 'react';
import {
  Calendar,
  Check,
  Clock,
  Copy,
  ExternalLink,
  FileText,
  History,
  Link,
  MessageSquare,
  Star,
  Trash2,
  Video,
  X,
} from 'lucide-react';
import { ConnectionRecord, ConnectionStatus, STATUS_CONFIG } from '../types/connection';
import { encodePayload, generateDeepLinkUrl } from '../lib/deepLinkParser';

interface ConnectionDetailModalProps {
  connection: ConnectionRecord | null;
  onClose: () => void;
  onUpdateStatus: (
    id: string,
    status: ConnectionStatus,
    note?: string,
    rating?: number
  ) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onUpdateRating: (id: string, rating: number) => void;
  onEdit: (connection: ConnectionRecord) => void;
  onDelete: (id: string) => void;
}

export function ConnectionDetailModal({
  connection,
  onClose,
  onUpdateStatus,
  onUpdateNotes,
  onUpdateRating,
  onEdit,
  onDelete,
}: ConnectionDetailModalProps) {
  if (!connection) return null;

  const [notesText, setNotesText] = useState(connection.userNotes || '');
  const [newStatusNote, setNewStatusNote] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<ConnectionStatus>(connection.status);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const currentStatusInfo = STATUS_CONFIG[connection.status];

  const handleStatusChange = (status: ConnectionStatus) => {
    setSelectedStatus(status);
    onUpdateStatus(connection.id, status, newStatusNote, connection.rating);
    setNewStatusNote('');
  };

  const handleSaveNotes = () => {
    setIsSavingNotes(true);
    onUpdateNotes(connection.id, notesText);
    setTimeout(() => setIsSavingNotes(false), 600);
  };

  const handleCopyDeepLink = () => {
    const payload = {
      v: 1 as const,
      id: connection.id,
      personName: connection.personName,
      personRef: connection.personRef,
      linkedInUrl: connection.linkedInUrl,
      introContext: connection.introContext,
      status: connection.status,
      meetingDateTime: connection.meetingDateTime,
      meetingUrl: connection.meetingUrl,
    };
    const url = generateDeepLinkUrl(payload);
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div
      id="connection-detail-modal-backdrop"
      className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="connection-detail-modal-content"
        className="surface rounded-3xl glow-subtle w-full max-w-2xl max-h-[90vh] overflow-y-auto my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800/80 flex items-start justify-between bg-slate-950/80 sticky top-0 z-10 backdrop-blur-xl">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-bold border ${currentStatusInfo.badgeBg} ${currentStatusInfo.badgeText} ${currentStatusInfo.borderColor}`}
              >
                {currentStatusInfo.label}
              </span>
              {connection.needsUpdate && (
                <span className="text-[11px] font-bold text-amber-300 bg-amber-950/80 border border-amber-800/80 px-2.5 py-0.5 rounded-full">
                  Needs Update
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5 flex items-center gap-2">
              {connection.personName}
              {connection.linkedInUrl && (
                <a
                  href={connection.linkedInUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 text-xs font-semibold bg-blue-950/80 px-2.5 py-1 rounded-lg border border-blue-800/80"
                >
                  LinkedIn <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </h2>

            {connection.personRef && (
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Reference ID: {connection.personRef}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* Quick Info & Meeting details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block mb-1">Meeting Date &amp; Time</span>
              {connection.meetingDateTime ? (
                <span className="text-slate-100 font-bold flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  {new Date(connection.meetingDateTime).toLocaleString([], {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              ) : (
                <span className="text-slate-500 italic">Not set</span>
              )}
            </div>

            <div>
              <span className="text-slate-400 font-semibold block mb-1">Meeting Link</span>
              {connection.meetingUrl ? (
                <a
                  href={connection.meetingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 font-bold text-indigo-400 hover:text-indigo-300 hover:underline"
                >
                  <Video className="w-4 h-4 text-indigo-400" />
                  <span>Join Meeting Room</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-slate-500 italic">No link provided</span>
              )}
            </div>
          </div>

          {/* Intro Context */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              Intro Context
            </h3>
            <p className="text-sm text-slate-200 bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 leading-relaxed whitespace-pre-wrap">
              {connection.introContext || 'No intro context available.'}
            </p>
          </div>

          {/* Status Changer Buttons */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              Update Status State
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              {(
                [
                  'not_started',
                  'scheduled',
                  'ongoing',
                  'met',
                  'connected',
                  'reschedule',
                  'did_not_connect',
                ] as ConnectionStatus[]
              ).map((st) => {
                const conf = STATUS_CONFIG[st];
                const isActive = connection.status === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleStatusChange(st)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-between ${
                      isActive
                        ? 'bg-smile text-white border-smile shadow-md'
                        : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <span>{conf.label}</span>
                    {isActive && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                );
              })}
            </div>

            <input
              type="text"
              placeholder="Add an optional note to this status update..."
              value={newStatusNote}
              onChange={(e) => setNewStatusNote(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-800 bg-slate-950 text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-kraft/50"
            />
          </div>

          {/* Star Rating */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-400" />
              Connection Rating (1 - 5 Stars)
            </h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => onUpdateRating(connection.id, star)}
                    className="p-1.5 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        connection.rating && star <= connection.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-700 hover:text-amber-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {connection.rating && (
                <span className="text-xs font-bold text-slate-300">
                  {connection.rating} / 5 Stars
                </span>
              )}
            </div>
          </div>

          {/* User Notes Editor */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                Personal Notes &amp; Reflections
              </h3>
              <button
                type="button"
                onClick={handleSaveNotes}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer flex items-center gap-1"
              >
                {isSavingNotes ? (
                  <span className="text-emerald-400 font-bold">Saved!</span>
                ) : (
                  <span>Save Notes</span>
                )}
              </button>
            </div>
            <textarea
              rows={4}
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="Record your thoughts, follow-up promises, action items, or discussion summary..."
              className="w-full px-3.5 py-3 text-xs sm:text-sm rounded-2xl border border-slate-800 bg-slate-950 text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-kraft/50 font-mono leading-relaxed"
            />
          </div>

          {/* Status Audit / History Timeline */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-indigo-400" />
              Status History Timeline ({connection.statusHistory.length})
            </h3>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {connection.statusHistory.map((item) => {
                const conf = STATUS_CONFIG[item.status];
                return (
                  <div key={item.id} className="relative text-xs">
                    <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-slate-900 shadow-md" />
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-extrabold text-slate-100">
                        {conf.label}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(item.timestamp).toLocaleString([], {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono text-[10px]">
                        Source: {item.source}
                      </span>
                      {item.note && <span className="italic text-slate-300">&ldquo;{item.note}&rdquo;</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-950/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 sticky bottom-0 z-10">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyDeepLink}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Deep Link</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(connection);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-800/80 transition-colors cursor-pointer"
            >
              Edit Connection
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onDelete(connection.id);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/80 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

