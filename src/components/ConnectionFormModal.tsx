import { FormEvent, useState } from 'react';
import { ConnectionRecord, ConnectionStatus, STATUS_CONFIG } from '../types/connection';
import { createManualConnection, updateConnectionRecord } from '../lib/connectionService';
import { X } from 'lucide-react';

interface ConnectionFormModalProps {
  initialRecord?: ConnectionRecord | null;
  onClose: () => void;
  onSaved: (record: ConnectionRecord) => void;
}

export function ConnectionFormModal({
  initialRecord,
  onClose,
  onSaved,
}: ConnectionFormModalProps) {
  const [personName, setPersonName] = useState(initialRecord?.personName || '');
  const [personRef, setPersonRef] = useState(initialRecord?.personRef || '');
  const [linkedInUrl, setLinkedInUrl] = useState(initialRecord?.linkedInUrl || '');
  const [introContext, setIntroContext] = useState(initialRecord?.introContext || '');
  const [status, setStatus] = useState<ConnectionStatus>(initialRecord?.status || 'not_started');
  const [meetingDateTime, setMeetingDateTime] = useState(initialRecord?.meetingDateTime || '');
  const [meetingUrl, setMeetingUrl] = useState(initialRecord?.meetingUrl || '');
  const [userNotes, setUserNotes] = useState(initialRecord?.userNotes || '');
  const [rating, setRating] = useState<number | undefined>(initialRecord?.rating);
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!personName.trim()) {
      setError('Person Name is required.');
      return;
    }

    if (initialRecord) {
      // Edit existing
      const updated = updateConnectionRecord({
        id: initialRecord.id,
        personName: personName.trim(),
        personRef: personRef.trim() || undefined,
        linkedInUrl: linkedInUrl.trim() || undefined,
        introContext: introContext.trim(),
        status,
        meetingDateTime: meetingDateTime.trim() || undefined,
        meetingUrl: meetingUrl.trim() || undefined,
        userNotes: userNotes.trim(),
        rating,
      });
      if (updated) {
        onSaved(updated);
      }
    } else {
      // Create new manual connection
      const newRecord = createManualConnection({
        personName: personName.trim(),
        personRef: personRef.trim() || undefined,
        linkedInUrl: linkedInUrl.trim() || undefined,
        introContext: introContext.trim() || 'Manually added connection',
        status,
        meetingDateTime: meetingDateTime.trim() || undefined,
        meetingUrl: meetingUrl.trim() || undefined,
        userNotes: userNotes.trim(),
        rating,
      });
      onSaved(newRecord);
    }
  };

  return (
    <div
      id="connection-form-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="connection-form-modal-content"
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {initialRecord ? 'Edit Connection Details' : 'Add New Connection'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-800 rounded-lg text-xs font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Person Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sarah Chen"
              value={personName}
              onChange={(e) => {
                setPersonName(e.target.value);
                setError('');
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                LinkedIn URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://linkedin.com/in/username"
                value={linkedInUrl}
                onChange={(e) => setLinkedInUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Reference ID (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. boardy_ref_123"
                value={personRef}
                onChange={(e) => setPersonRef(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ConnectionStatus)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              {(Object.keys(STATUS_CONFIG) as ConnectionStatus[]).map((st) => (
                <option key={st} value={st}>
                  {STATUS_CONFIG[st].label} - {STATUS_CONFIG[st].description}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Intro Context / Background
            </label>
            <textarea
              rows={3}
              placeholder="Why were you introduced? What is the goal of connecting?"
              value={introContext}
              onChange={(e) => setIntroContext(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Meeting Date &amp; Time
              </label>
              <input
                type="datetime-local"
                value={meetingDateTime}
                onChange={(e) => setMeetingDateTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Meeting URL
              </label>
              <input
                type="url"
                placeholder="https://meet.google.com/..."
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Initial Notes
            </label>
            <textarea
              rows={2}
              placeholder="Private notes for yourself..."
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold hover:bg-slate-100 text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer shadow-xs"
            >
              {initialRecord ? 'Save Changes' : 'Create Connection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
