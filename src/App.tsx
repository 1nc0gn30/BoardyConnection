import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
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
  getStoredConnections,
  loadSampleData,
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

import { BackupRestoreModal } from './components/BackupRestoreModal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { ConnectionCard } from './components/ConnectionCard';
import { ConnectionDetailModal } from './components/ConnectionDetailModal';
import { ConnectionFormModal } from './components/ConnectionFormModal';
import { DashboardStats } from './components/DashboardStats';
import { DeepLinkBanner } from './components/DeepLinkBanner';
import { DeepLinkGeneratorModal } from './components/DeepLinkGeneratorModal';
import { EmptyState } from './components/EmptyState';
import { Header } from './components/Header';

export default function App() {
  const [connections, setConnections] = useState<ConnectionRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ConnectionStatus | 'all' | 'needs_update'>('all');
  const [sortBy, setSortBy] = useState<'updatedAt' | 'meetingDateTime' | 'personName' | 'rating'>('updatedAt');

  // Deep link banner state
  const [incomingPayload, setIncomingPayload] = useState<ReturnType<typeof decodePayload> | null>(null);

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

  // Parse deep link payload from URL location on load or url change
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const parseUrlPayload = () => {
      const searchParams = new URLSearchParams(window.location.search);
      let rawPayload = searchParams.get('payload');

      // Also support hash route / update path payloads
      if (!rawPayload && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#\/?/, '?'));
        rawPayload = hashParams.get('payload');
      }

      if (rawPayload) {
        const result = decodePayload(rawPayload);
        setIncomingPayload(result);
      }
    };

    parseUrlPayload();
    window.addEventListener('popstate', parseUrlPayload);
    return () => window.removeEventListener('popstate', parseUrlPayload);
  }, []);

  // Trigger import from deep link banner
  const handleImportIncomingDeepLink = () => {
    if (incomingPayload && incomingPayload.success) {
      const { allRecords } = upsertFromDeepLink(incomingPayload.data);
      setConnections(allRecords);
      setIncomingPayload(null);

      // Clean up URL parameter without full page reload
      if (typeof window !== 'undefined' && window.history) {
        const url = new URL(window.location.href);
        url.searchParams.delete('payload');
        window.history.replaceState({}, '', url.pathname);
      }
    }
  };

  // Trigger Demo Link for testing
  const handleTriggerDemoLink = () => {
    const samplePayload = createSamplePayload();
    const demoUrl = generateDeepLinkUrl(samplePayload);

    // Set URL search param & parse payload
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', demoUrl);
      const result = decodePayload(encodeURIComponent(JSON.stringify(samplePayload)));
      setIncomingPayload(result);
    }
  };

  // Test opening link from generator modal
  const handleTestGeneratedLink = (urlStr: string) => {
    try {
      const parsedUrl = new URL(urlStr);
      const rawPayload = parsedUrl.searchParams.get('payload');
      if (rawPayload) {
        window.history.pushState({}, '', urlStr);
        const result = decodePayload(rawPayload);
        setIncomingPayload(result);
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
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* App Header */}
      <Header
        onOpenAddModal={() => {
          setEditingConn(null);
          setFormModalOpen(true);
        }}
        onOpenBackupModal={() => setBackupModalOpen(true)}
        onOpenLinkGenerator={() => setGeneratorModalOpen(true)}
        onTriggerDemoLink={handleTriggerDemoLink}
        onClearData={handleClearAllData}
        onLoadSampleData={handleLoadSampleData}
        totalConnections={connections.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Incoming Deep Link Notification Banner */}
        <DeepLinkBanner
          payload={incomingPayload?.success ? incomingPayload.data : null}
          error={!incomingPayload?.success ? incomingPayload?.error || null : null}
          onImport={handleImportIncomingDeepLink}
          onDismiss={() => setIncomingPayload(null)}
        />

        {/* Dashboard Statistics Bar */}
        {connections.length > 0 && (
          <DashboardStats
            connections={connections}
            onSelectActionNeededFilter={() => setStatusFilter('needs_update')}
          />
        )}

        {/* Search & Filter Bar */}
        {connections.length > 0 && (
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs mb-6 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search Box */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, intro notes, or reference ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-2 shrink-0 text-xs">
                <span className="text-slate-500 font-medium">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 font-medium text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="updatedAt">Recently Updated</option>
                  <option value="meetingDateTime">Meeting Date</option>
                  <option value="personName">Person Name (A-Z)</option>
                  <option value="rating">Rating (Highest)</option>
                </select>
              </div>
            </div>

            {/* Status Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 text-xs no-scrollbar">
              <span className="text-slate-400 font-medium text-[11px] shrink-0 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                Filter:
              </span>

              {/* All */}
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer shrink-0 ${
                  statusFilter === 'all'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                All ({connections.length})
              </button>

              {/* Action Needed */}
              {connections.some((c) => c.needsUpdate) && (
                <button
                  type="button"
                  onClick={() => setStatusFilter('needs_update')}
                  className={`px-3 py-1.5 rounded-full font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1 ${
                    statusFilter === 'needs_update'
                      ? 'bg-amber-500 text-slate-950 font-extrabold shadow-xs'
                      : 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 hover:bg-amber-200'
                  }`}
                >
                  <AlertCircle className="w-3.5 h-3.5 text-amber-700 dark:text-amber-300" />
                  <span>Needs Update ({connections.filter((c) => c.needsUpdate).length})</span>
                </button>
              )}

              {/* Status config pills */}
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
                    className={`px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer shrink-0 ${
                      isActive
                        ? 'bg-indigo-600 text-white font-bold shadow-xs'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {conf.label} ({count})
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
      <footer className="mt-auto py-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            Connection Dashboard • Private local-first MVP. All data stored in browser localStorage.
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleTriggerDemoLink}
              className="hover:underline text-indigo-600 dark:text-indigo-400 font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              Simulate Boardy Deep Link
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setGeneratorModalOpen(true)}
              className="hover:underline text-slate-600 dark:text-slate-300 font-medium cursor-pointer"
            >
              Deep Link Generator
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
            setBackupModalOpen(false);
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
  );
}
