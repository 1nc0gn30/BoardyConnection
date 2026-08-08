import { useState } from 'react';
import { Check, Copy, ExternalLink, Sparkles, X } from 'lucide-react';
import { ConnectionStatus, STATUS_CONFIG } from '../types/connection';
import { createSamplePayload, generateDeepLinkUrl } from '../lib/deepLinkParser';

interface DeepLinkGeneratorModalProps {
  onClose: () => void;
  onTestLink: (url: string) => void;
}

export function DeepLinkGeneratorModal({
  onClose,
  onTestLink,
}: DeepLinkGeneratorModalProps) {
  const sample = createSamplePayload();

  const [id, setId] = useState(sample.id);
  const [personName, setPersonName] = useState('Taylor Vance');
  const [personRef, setPersonRef] = useState('boardy_ref_9921');
  const [linkedInUrl, setLinkedInUrl] = useState('https://www.linkedin.com/in/taylorvance-tech');
  const [introContext, setIntroContext] = useState(
    'Introduced by Boardy AI to discuss technical advisor position.'
  );
  const [status, setStatus] = useState<ConnectionStatus>('scheduled');
  const [meetingDateTime, setMeetingDateTime] = useState(sample.meetingDateTime || '');
  const [meetingUrl, setMeetingUrl] = useState('https://meet.google.com/test-deep-link');
  const [copied, setCopied] = useState(false);

  const payloadObj = {
    v: 1 as const,
    id: id.trim() || 'conn_demo_99',
    personName: personName.trim() || 'Jane Doe',
    personRef: personRef.trim() || undefined,
    linkedInUrl: linkedInUrl.trim() || undefined,
    introContext: introContext.trim() || undefined,
    status,
    meetingDateTime: meetingDateTime.trim() || undefined,
    meetingUrl: meetingUrl.trim() || undefined,
  };

  const generatedUrl = generateDeepLinkUrl(payloadObj);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="link-generator-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="link-generator-modal-content"
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Deep Link Generator
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

        <div className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm">
          <p className="text-slate-600 dark:text-slate-400 text-xs">
            Generate a URL-safe encoded deep link (`/update?payload=...`) as would be sent by Boardy or an external sender.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Stable ID
              </label>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Person Name
              </label>
              <input
                type="text"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Person Ref (Optional)
              </label>
              <input
                type="text"
                value={personRef}
                onChange={(e) => setPersonRef(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                LinkedIn URL (Optional)
              </label>
              <input
                type="url"
                value={linkedInUrl}
                onChange={(e) => setLinkedInUrl(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Intro Context
            </label>
            <textarea
              rows={2}
              value={introContext}
              onChange={(e) => setIntroContext(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ConnectionStatus)}
                className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs"
              >
                {(Object.keys(STATUS_CONFIG) as ConnectionStatus[]).map((st) => (
                  <option key={st} value={st}>
                    {STATUS_CONFIG[st].label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Meeting Date/Time
              </label>
              <input
                type="datetime-local"
                value={meetingDateTime}
                onChange={(e) => setMeetingDateTime(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Meeting Link
              </label>
              <input
                type="url"
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
          </div>

          {/* Result Link Codebox */}
          <div className="mt-4 p-3 bg-slate-900 text-slate-100 rounded-xl space-y-2">
            <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider block">
              Generated Deep Link URL
            </span>
            <div className="p-2 bg-slate-950 rounded border border-slate-800 break-all font-mono text-[11px] text-amber-300 select-all max-h-24 overflow-y-auto">
              {generatedUrl}
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy URL</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onTestLink(generatedUrl);
                }}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Test Link In App</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
