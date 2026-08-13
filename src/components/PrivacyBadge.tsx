import { ShieldCheck } from 'lucide-react';

interface PrivacyBadgeProps {
  onClickInfo?: () => void;
}

export function PrivacyBadge({ onClickInfo }: PrivacyBadgeProps) {
  const className =
    'mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300/85 hover:text-emerald-200 transition-colors';

  if (onClickInfo) {
    return (
      <button
        type="button"
        id="privacy-badge"
        onClick={onClickInfo}
        className={`${className} cursor-pointer`}
        title="How your data stays private"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>Private · this browser</span>
      </button>
    );
  }

  return (
    <div id="privacy-badge" className={className}>
      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
      <span>Private · this browser</span>
    </div>
  );
}
