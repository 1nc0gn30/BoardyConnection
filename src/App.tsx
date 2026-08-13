import { useEffect, useMemo, useState } from 'react';
import {
  Filter,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { ConnectionRecord, ConnectionStatus, STATUS_CONFIG } from './types/connection';
import {
  clearNeedsUpdateFlag,
  clearStoredConnections,
  deleteConnection,
  getLastExportedAt,
  getStoredConnections,
  isFirstUseNoticeDismissed,
  loadSampleData,
  setFirstUseNoticeDismissed,
  updateConnectionNotes,
  updateConnectionRating,
  updateConnectionStatus,
  upsertFromDeepLink,
} from './lib/connectionService';
import {
  createSamplePayload,
  decodePayload,
  generateDeepLinkUrl,
} from './lib/deepLinkParser';

import { BoardyMark } from './components/BoardyMark';
import { BackupReminderBanner } from './components/BackupReminderBanner';
import { BackupRestoreModal } from './components/BackupRestoreModal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { ConnectionCard } from './components/ConnectionCard';
import { ConnectionDetailModal } from './components/ConnectionDetailModal';
import { ConnectionFormModal } from './components/ConnectionFormModal';
import { DashboardStats } from './components/DashboardStats';
import { DeepLinkBanner } from './components/DeepLinkBanner';
import { DeepLinkGeneratorModal } from './components/DeepLinkGeneratorModal';
import { EmptyState } from './components/EmptyState';
import { FirstUseNoticeBanner } from './components/FirstUseNoticeBanner';
import { Header } from './components/Header';
import { StoragePrivacyModal } from './components/StoragePrivacyModal';

export default function App() {
  const [connections, setConnections] = useState<ConnectionRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ConnectionStatus | 'all' | 'needs_update'>('all');
  const [sortBy, setSortBy] = useState<'updatedAt' | 'meetingDateTime' | 'personName' | 'rating'>('updatedAt');

  // Privacy & Data-loss Protection State
  const [firstUseNoticeDismissed, setFirstUseNoticeDismissedState] = useState<boolean>(() => isFirstUseNoticeDismissed());
  const [lastExportedAt, setLastExportedAtState] = useState<string | null>(() => getLastExportedAt());
  const [backupReminderDismissed, setBackupReminderDismissed] = useState<boolean>(false);
  const [storageModalOpen, setStorageModalOpen] = useState<boolean>(false);

  const [incomingPayload, setIncomingPayload] = useState<
    | { success: true; data: ReturnType<typeof decodePayload> extends { success: true; data: infer D } ? D : never; isNew: boolean }
    | { success: false; error: string }
    | null
  >(null);
  const [savedLinkRecord, setSavedLinkRecord] = useState<ConnectionRecord | null>(null);

  // Modals state
  const [detailModalConn, setDetailModalConn] = useState<ConnectionRecord | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingConn, setEditingConn] = useState<ConnectionRecord | null>(null);
  const [backupModalOpen, setBackupModalOpen] = useState(false);
  const [generatorModalOpen, setGeneratorModalOpen] = useState(false);

  // Confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Load stored connections on mount
  const refreshConnections = () => {
    const records = getStoredConnections();
    setConnections(records);
  };

  useEffect(() => {
    refreshConnections();
  }, []);

  const readPayloadFromLocation = () => {
    const searchParams = new URLSearchParams(window.location.search);
    let rawPayload = searchParams.get('payload');
    if (!rawPayload && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#\/?/, '?'));
      rawPayload = hashParams.get('payload');
    }
    return rawPayload;
  };

  const clearPayloadFromUrl = () => {
    if (typeof window === 'undefined' || !window.history) return;
    const url = new URL(window.location.href);
    url.searchParams.delete('payload');
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash.split('?')[0] || ''}`);
  };

  const applyDeepLink = (rawPayload: string) => {
    const result = decodePayload(rawPayload);
    if (!result.success) {
      setIncomingPayload(result);
      setSavedLinkRecord(null);
      return;
    }
    const applied = upsertFromDeepLink(result.data);
    setConnections(applied.allRecords);
    setSavedLinkRecord(applied.record);
    setIncomingPayload({ success: true, data: result.data, isNew: applied.isNew });
    clearPayloadFromUrl();
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const parseUrlPayload = () => {
      const rawPayload = readPayloadFromLocation();
      if (rawPayload) applyDeepLink(rawPayload);
    };

    parseUrlPayload();
    window.addEventListener('popstate', parseUrlPayload);
    return () => window.removeEventListener('popstate', parseUrlPayload);
  }, []);

  const handleTriggerDemoLink = () => {
    const samplePayload = createSamplePayload();
    const encoded = encodeURIComponent(JSON.stringify(samplePayload));
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', generateDeepLinkUrl(samplePayload));
    }
    applyDeepLink(encoded);
  };

  const handleTestGeneratedLink = (urlStr: string) => {
    try {
      const parsedUrl = new URL(urlStr);
      const rawPayload = parsedUrl.searchParams.get('payload');
      if (rawPayload) {
        window.history.pushState({}, '', urlStr);
        applyDeepLink(rawPayload);
      }
    } catch {
      console.error('Invalid URL string:', urlStr);
    }
  };

  // Update Status handler
  const handleUpdateStatus = (
    id: string,
    status: ConnectionStatus,
    note?: string,
    rating?: number
  ) => {
    updateConnectionStatus(id, status, note, rating);
    refreshConnections();

    // If detail modal is open for this connection, update it
    if (detailModalConn && detailModalConn.id === id) {
      const updated = getStoredConnections().find((r) => r.id === id);
      if (updated) setDetailModalConn(updated);
    }
  };

  // Update Notes handler
  const handleUpdateNotes = (id: string, notes: string) => {
    updateConnectionNotes(id, notes);
    refreshConnections();
  };

  // Update Rating handler
  const handleUpdateRating = (id: string, rating: number) => {
    updateConnectionRating(id, rating);
    refreshConnections();
    if (detailModalConn && detailModalConn.id === id) {
      const updated = getStoredConnections().find((r) => r.id === id);
      if (updated) setDetailModalConn(updated);
    }
  };

  // Clear "Needs Your Update" flag
  const handleClearNeedsUpdate = (id: string) => {
    clearNeedsUpdateFlag(id);
    refreshConnections();
  };

  // Delete Connection
  const handleDeleteConnection = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Connection Record?',
      message: 'Are you sure you want to remove this connection record? This action cannot be undone.',
      onConfirm: () => {
        deleteConnection(id);
        refreshConnections();
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        if (detailModalConn?.id === id) setDetailModalConn(null);
      },
    });
  };

  // Clear All Local Data
  const handleClearAllData = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Clear All Local Data?',
      message:
        'This will permanently wipe all connection records, notes, and status histories stored in this browser. Make sure you export a backup first if needed!',
      onConfirm: () => {
        clearStoredConnections();
        refreshConnections();
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Load Sample Demo Data
  const handleLoadSampleData = () => {
    const samples = loadSampleData();
    setConnections(samples);
  };

  // Filter & Sort Logic
  const filteredAndSortedConnections = useMemo(() => {
    return connections
      .filter((conn) => {
        // Status filter
        if (statusFilter === 'needs_update') {
          if (!conn.needsUpdate) return false;
        } else if (statusFilter !== 'all') {
          if (conn.status !== statusFilter) return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const nameMatch = conn.personName.toLowerCase().includes(q);
          const introMatch = conn.introContext.toLowerCase().includes(q);
          const notesMatch = conn.userNotes?.toLowerCase().includes(q) || false;
          const refMatch = conn.personRef?.toLowerCase().includes(q) || false;
          return nameMatch || introMatch || notesMatch || refMatch;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'updatedAt') {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        }
        if (sortBy === 'meetingDateTime') {
          const timeA = a.meetingDateTime ? new Date(a.meetingDateTime).getTime() : 0;
          const timeB = b.meetingDateTime ? new Date(b.meetingDateTime).getTime() : 0;
          return timeB - timeA;
        }
        if (sortBy === 'personName') {
          return a.personName.localeCompare(b.personName);
        }
        if (sortBy === 'rating') {
          return (b.rating || 0) - (a.rating || 0);
        }
        return 0;
      });
  }, [connections, searchQuery, statusFilter, sortBy]);

  const hasActiveFilters = searchQuery.trim() !== '' || statusFilter !== 'all';

  return (
    <div className="relative min-h-screen bg-ink text-paper flex flex-col font-sans">
      <div className="app-atmosphere" aria-hidden="true">
        <div className="app-atmosphere__glow" />
        <div className="app-atmosphere__flute" />
        <div className="app-atmosphere__vignette" />
        <div className="app-atmosphere__grain" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
      <Header
        onOpenAddModal={() => {
          setEditingConn(null);
          setFormModalOpen(true);
        }}
        onOpenBackupModal={() => setBackupModalOpen(true)}
        onOpenLinkGenerator={() => setGeneratorModalOpen(true)}
        onOpenStorageModal={() => setStorageModalOpen(true)}
        onTriggerDemoLink={handleTriggerDemoLink}
        onClearData={handleClearAllData}
        onLoadSampleData={handleLoadSampleData}
        totalConnections={connections.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* First Use Data Loss Protection Banner */}
        {!firstUseNoticeDismissed && (
          <FirstUseNoticeBanner
            onDismiss={() => {
              setFirstUseNoticeDismissed(true);
              setFirstUseNoticeDismissedState(true);
            }}
            onOpenBackupModal={() => setBackupModalOpen(true)}
          />
        )}

        {/* Compact Persistent Backup Reminder */}
        {firstUseNoticeDismissed &&
          connections.length > 0 &&
          !backupReminderDismissed &&
          (!lastExportedAt || Date.now() - new Date(lastExportedAt).getTime() > 7 * 86400000) && (
            <BackupReminderBanner
              recordCount={connections.length}
              lastExportedAt={lastExportedAt}
              onExported={() => setLastExportedAtState(getLastExportedAt())}
              onDismiss={() => setBackupReminderDismissed(true)}
            />
          )}

        {/* Incoming Deep Link Notification Banner */}
        <DeepLinkBanner
          payload={incomingPayload?.success ? incomingPayload.data : null}
          error={!incomingPayload?.success ? incomingPayload?.error || null : null}
          saved={Boolean(incomingPayload?.success)}
          isNew={incomingPayload?.success ? incomingPayload.isNew : false}
          onOpen={() => {
            if (savedLinkRecord) setDetailModalConn(savedLinkRecord);
          }}
          onDismiss={() => {
            setIncomingPayload(null);
            setSavedLinkRecord(null);
          }}
        />

        {/* Dashboard Statistics Bar */}
        {connections.length > 0 && (
          <DashboardStats
            connections={connections}
            onSelectActionNeededFilter={() => setStatusFilter('needs_update')}
          />
        )}

        {connections.length > 0 && (
          <div className="mb-5 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-paper/35" />
                <input
                  type="text"
                  placeholder="Search people or notes"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl surface-inset text-sm text-paper placeholder:text-paper/35 focus:outline-hidden focus:ring-2 focus:ring-kraft/50"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-paper/40 hover:text-paper"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <label className="flex items-center gap-2 shrink-0 text-xs text-paper/45 font-semibold">
                <span className="hidden sm:inline">Sort</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="px-3 py-2.5 rounded-xl surface-inset font-semibold text-paper focus:outline-hidden focus:ring-2 focus:ring-kraft/50 cursor-pointer"
                >
                  <option value="updatedAt">Latest</option>
                  <option value="meetingDateTime">Meeting</option>
                  <option value="personName">Name</option>
                  <option value="rating">Stars</option>
                </select>
              </label>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs no-scrollbar">
              <Filter className="w-3.5 h-3.5 text-kraft shrink-0" />

              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-full font-semibold transition-colors cursor-pointer shrink-0 ${
                  statusFilter === 'all'
                    ? 'bg-paper text-ink'
                    : 'text-paper/70 hover:bg-white/5 border border-line'
                }`}
              >
                Everyone
              </button>

              {connections.some((c) => c.needsUpdate) && (
                <button
                  type="button"
                  onClick={() => setStatusFilter('needs_update')}
                  className={`px-3 py-1.5 rounded-full font-semibold transition-colors cursor-pointer shrink-0 ${
                    statusFilter === 'needs_update'
                      ? 'bg-kraft text-ink'
                      : 'text-kraft hover:bg-kraft/10 border border-kraft/30'
                  }`}
                >
                  Need a note ({connections.filter((c) => c.needsUpdate).length})
                </button>
              )}

              {(Object.keys(STATUS_CONFIG) as ConnectionStatus[]).map((st) => {
                const conf = STATUS_CONFIG[st];
                const count = connections.filter((c) => c.status === st).length;
                if (count === 0 && statusFilter !== st) return null;

                const isActive = statusFilter === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-full font-semibold transition-colors cursor-pointer shrink-0 ${
                      isActive
                        ? 'bg-smile text-white'
                        : 'text-paper/70 hover:bg-white/5 border border-line'
                    }`}
                  >
                    {conf.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Connections Grid or Empty State */}
        {filteredAndSortedConnections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredAndSortedConnections.map((conn) => (
              <ConnectionCard
                key={conn.id}
                connection={conn}
                onSelect={(c) => setDetailModalConn(c)}
                onUpdateStatus={handleUpdateStatus}
                onDelete={handleDeleteConnection}
                onClearNeedsUpdate={handleClearNeedsUpdate}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            hasFilters={connections.length > 0 && hasActiveFilters}
            onClearFilters={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
            onOpenAddModal={() => {
              setEditingConn(null);
              setFormModalOpen(true);
            }}
            onLoadSampleData={handleLoadSampleData}
            onTriggerDemoLink={handleTriggerDemoLink}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-kraft/12 text-xs text-paper/50 bg-ink/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BoardyMark size="sm" alt="Boardy" className="rounded-lg mark-ring" />
            <p className="font-medium text-paper/70">
              <span className="font-display text-paper">Boardy</span>
              <span className="text-paper/45"> · your private intro desk</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold">
            <a
              href="https://x.com/boardyai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-paper/50 hover:text-kraft-bright transition-colors"
            >
              Official X (@boardyai)
            </a>
            <span className="text-line">•</span>
            <a
              href="https://www.linkedin.com/company/boardy/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-paper/50 hover:text-kraft-bright transition-colors"
            >
              LinkedIn
            </a>
            <span className="text-line">•</span>
            <button
              type="button"
              onClick={handleTriggerDemoLink}
              className="hover:underline text-kraft font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              Sample intro
            </button>
            <span className="text-line">•</span>
            <button
              type="button"
              onClick={() => setGeneratorModalOpen(true)}
              className="hover:underline text-paper/70 font-bold cursor-pointer"
            >
              Make an intro link
            </button>
          </div>
        </div>
      </footer>


      {/* Modals */}
      {detailModalConn && (
        <ConnectionDetailModal
          connection={detailModalConn}
          onClose={() => setDetailModalConn(null)}
          onUpdateStatus={handleUpdateStatus}
          onUpdateNotes={handleUpdateNotes}
          onUpdateRating={handleUpdateRating}
          onEdit={(c) => {
            setEditingConn(c);
            setFormModalOpen(true);
          }}
          onDelete={handleDeleteConnection}
        />
      )}

      {formModalOpen && (
        <ConnectionFormModal
          initialRecord={editingConn}
          onClose={() => {
            setFormModalOpen(false);
            setEditingConn(null);
          }}
          onSaved={(record) => {
            setFormModalOpen(false);
            setEditingConn(null);
            refreshConnections();
            setDetailModalConn(record);
          }}
        />
      )}

      {backupModalOpen && (
        <BackupRestoreModal
          onClose={() => setBackupModalOpen(false)}
          onDataImported={() => {
            refreshConnections();
            setLastExportedAtState(getLastExportedAt());
          }}
        />
      )}

      {storageModalOpen && (
        <StoragePrivacyModal
          onClose={() => setStorageModalOpen(false)}
          onOpenBackupModal={() => {
            setStorageModalOpen(false);
            setBackupModalOpen(true);
          }}
        />
      )}

      {generatorModalOpen && (
        <DeepLinkGeneratorModal
          onClose={() => setGeneratorModalOpen(false)}
          onTestLink={handleTestGeneratedLink}
        />
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
      </div>
    </div>
  );
}
