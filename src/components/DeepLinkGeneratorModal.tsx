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
      className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="link-generator-modal-content"
        className="surface rounded-3xl glow-subtle w-full max-w-xl max-h-[90vh] overflow-y-auto my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 sticky top-0 z-10 backdrop-blur-xl">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-extrabold text-white">
              Boardy AI Deep Link Generator
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

        <div className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm">
          <p className="text-slate-300 text-xs leading-relaxed">
            Generate a URL-safe encoded deep link (`/update?payload=...`) as would be sent by Boardy AI or an external connector.
          </p>

          <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs leading-relaxed">
            <strong>Security Notice:</strong> Base64 or URL encoding is for deep link payload transport. Anyone with the link can decode its contents. Private user notes and star ratings are strictly omitted from deep links to safeguard privacy.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1.5">
                Stable ID
              </label>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-kraft/50"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1.5">
                Person Name
              </label>
              <input
                type="text"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-kraft/50 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1.5">
                Person Ref (Optional)
              </label>
              <input
                type="text"
                value={personRef}
                onChange={(e) => setPersonRef(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-kraft/50"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1.5">
                LinkedIn URL (Optional)
              </label>
              <input
                type="url"
                value={linkedInUrl}
                onChange={(e) => setLinkedInUrl(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-kraft/50"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1.5">
              Intro Context
            </label>
            <textarea
              rows={2}
              value={introContext}
              onChange={(e) => setIntroContext(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-kraft/50 leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ConnectionStatus)}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-kraft/50 cursor-pointer font-medium"
              >
                {(Object.keys(STATUS_CONFIG) as ConnectionStatus[]).map((st) => (
                  <option key={st} value={st}>
                    {STATUS_CONFIG[st].label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1.5">
                Meeting Date/Time
              </label>
              <input
                type="datetime-local"
                value={meetingDateTime}
                onChange={(e) => setMeetingDateTime(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-kraft/50"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1.5">
                Meeting Link
              </label>
              <input
                type="url"
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-kraft/50"
              />
            </div>
          </div>

          {/* Result Link Codebox */}
          <div className="mt-5 p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2.5">
            <span className="text-[10px] font-mono text-indigo-400 font-extrabold uppercase tracking-wider block">
              Generated Deep Link URL
            </span>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 break-all font-mono text-[11px] text-amber-300 select-all max-h-24 overflow-y-auto leading-relaxed">
              {generatedUrl}
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopy}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                    <span className="text-emerald-400">Copied!</span>
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
                className="px-4 py-2 bg-kraft hover:bg-kraft-bright text-ink rounded-xl text-xs font-black inline-flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 stroke-[3]" />
                <span>Test Link In App</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

