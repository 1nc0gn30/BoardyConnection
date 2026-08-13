import {
  ChevronDown,
  Download,
  Link as LinkIcon,
  LogIn,
  LogOut,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useNetlifyIdentity } from '../lib/identity';
import { BoardyMark } from './BoardyMark';
import { PrivacyBadge } from './PrivacyBadge';

interface HeaderProps {
  onOpenAddModal: () => void;
  onOpenBackupModal: () => void;
  onOpenLinkGenerator: () => void;
  onOpenStorageModal: () => void;
  onTriggerDemoLink: () => void;
  onClearData: () => void;
  onLoadSampleData: () => void;
  totalConnections: number;
}

export function Header({
  onOpenAddModal,
  onOpenBackupModal,
  onOpenLinkGenerator,
  onOpenStorageModal,
  onTriggerDemoLink,
  onClearData,
  onLoadSampleData,
  totalConnections,
}: HeaderProps) {
  const { user, email, open, logout } = useNetlifyIdentity();

  const closeTools = (el: HTMLElement) => {
    el.closest('details')?.removeAttribute('open');
  };

  return (
    <header
      id="main-header"
      className="sticky top-0 z-30 border-b border-kraft/15 bg-ink/78 backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <BoardyMark
              size="md"
              alt="Boardy mark"
              className="rounded-2xl mark-ring shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <h1 className="wordmark text-[1.55rem] sm:text-[1.8rem] text-paper leading-none">
                  Boardy
                </h1>
                <span className="wordmark-kicker hidden xs:inline sm:inline">
                  Connection
                </span>
              </div>
              <PrivacyBadge onClickInfo={onOpenStorageModal} />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              id="header-btn-add"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs font-bold rounded-xl bg-smile hover:bg-[#4b8cd4] text-white transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>

            <details className="tools-menu">
              <summary
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl bg-navy-mid/80 hover:bg-navy-mid text-paper/90 border border-line transition-colors"
                aria-label="More tools"
              >
                More
                <ChevronDown className="w-3.5 h-3.5 text-kraft" />
              </summary>
              <div className="tools-menu__panel surface rounded-2xl glow-subtle">
                <button
                  type="button"
                  id="header-btn-demo"
                  onClick={(e) => {
                    closeTools(e.currentTarget);
                    onTriggerDemoLink();
                  }}
                  className="w-full inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl text-kraft-bright hover:bg-kraft/10 transition-colors cursor-pointer"
                  title="See what a Boardy intro looks like"
                >
                  <Sparkles className="w-3.5 h-3.5 text-kraft" />
                  <span>Try a sample intro</span>
                </button>
                <button
                  type="button"
                  id="header-btn-backup"
                  onClick={(e) => {
                    closeTools(e.currentTarget);
                    onOpenBackupModal();
                  }}
                  className="w-full inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl text-paper/90 hover:bg-white/5 transition-colors cursor-pointer"
                  title="Backup or restore your people"
                >
                  <Download className="w-3.5 h-3.5 text-kraft" />
                  <span>Backup</span>
                </button>
                <button
                  type="button"
                  id="header-btn-generator"
                  onClick={(e) => {
                    closeTools(e.currentTarget);
                    onOpenLinkGenerator();
                  }}
                  className="w-full inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl text-paper/90 hover:bg-white/5 transition-colors cursor-pointer"
                  title="Make a shareable intro link"
                >
                  <LinkIcon className="w-3.5 h-3.5 text-kraft" />
                  <span>Make an intro link</span>
                </button>
                {user ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      closeTools(e.currentTarget);
                      logout();
                    }}
                    className="w-full inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl text-paper/80 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-kraft" />
                    <span className="truncate">Sign out {email}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      closeTools(e.currentTarget);
                      open('login');
                    }}
                    className="w-full inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl text-paper/90 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5 text-kraft" />
                    <span>Sign in for cloud backup</span>
                  </button>
                )}
                {totalConnections === 0 ? (
                  <button
                    type="button"
                    id="header-btn-samples"
                    onClick={(e) => {
                      closeTools(e.currentTarget);
                      onLoadSampleData();
                    }}
                    className="w-full inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl text-emerald-300 hover:bg-emerald-950/50 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Load examples</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    id="header-btn-clear"
                    onClick={(e) => {
                      closeTools(e.currentTarget);
                      onClearData();
                    }}
                    className="w-full inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl text-rose-300 hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Clear everyone stored in this browser"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear all</span>
                  </button>
                )}
              </div>
            </details>
          </div>
        </div>
      </div>
    </header>
  );
}
