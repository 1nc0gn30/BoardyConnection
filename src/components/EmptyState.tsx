import { Plus, RotateCcw, Search, Sparkles } from 'lucide-react';
import { BoardyMark } from './BoardyMark';

interface EmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
  onOpenAddModal: () => void;
  onLoadSampleData: () => void;
  onTriggerDemoLink: () => void;
}

export function EmptyState({
  hasFilters,
  onClearFilters,
  onOpenAddModal,
  onLoadSampleData,
  onTriggerDemoLink,
}: EmptyStateProps) {
  if (hasFilters) {
    return (
      <div
        id="empty-state-filtered"
        className="py-12 text-center max-w-md mx-auto"
      >
        <div className="w-12 h-12 surface-inset rounded-2xl flex items-center justify-center mx-auto text-kraft mb-4">
          <Search className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-paper">No one matches</h3>
        <p className="text-sm text-paper/55 mt-1.5 mb-5">
          Try another name, or show everyone again.
        </p>
        <button
          type="button"
          onClick={onClearFilters}
          className="px-5 py-2.5 bg-smile hover:bg-[#4b8cd4] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
        >
          Show everyone
        </button>
      </div>
    );
  }

  return (
    <div
      id="empty-state-no-records"
      className="text-center max-w-2xl mx-auto py-4 sm:py-8"
    >
      <div className="relative mx-auto mb-6 mark-enter">
        <BoardyMark
          size="hero"
          alt="Boardy, the cardboard-box superconnector"
          className="rounded-[28px] mark-ring mx-auto object-[50%_18%]"
        />
      </div>

      <p className="wordmark-kicker mb-2">Your desk</p>
      <h2 className="wordmark text-3xl sm:text-4xl text-paper">
        Keep Boardy intros here
      </h2>
      <p className="text-sm text-paper/65 mt-3 max-w-md mx-auto leading-relaxed">
        When Boardy introduces you to someone, save them, take the meeting, and leave a private note.
      </p>

      <div className="how-steps mt-8 text-left max-w-xl mx-auto">
        <div>
          <p className="wordmark-kicker mb-1">1 · Intro</p>
          <p className="text-sm text-paper/80 font-medium">Boardy sends a person</p>
        </div>
        <div>
          <p className="wordmark-kicker mb-1">2 · Meet</p>
          <p className="text-sm text-paper/80 font-medium">You take the call</p>
        </div>
        <div>
          <p className="wordmark-kicker mb-1">3 · Note</p>
          <p className="text-sm text-paper/80 font-medium">You jot what mattered</p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
        <button
          type="button"
          onClick={onTriggerDemoLink}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-kraft hover:bg-kraft-bright text-ink font-bold text-xs transition-colors cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>See a sample intro</span>
        </button>

        <button
          type="button"
          onClick={onLoadSampleData}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-line bg-navy-mid/60 hover:bg-navy-mid text-paper font-semibold text-xs transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-kraft" />
          <span>Browse examples</span>
        </button>

        <button
          type="button"
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-smile hover:bg-[#4b8cd4] text-white font-semibold text-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add someone</span>
        </button>
      </div>
    </div>
  );
}
