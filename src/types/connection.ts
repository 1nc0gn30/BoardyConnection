export type ConnectionStatus =
  | 'not_started'
  | 'ongoing'
  | 'scheduled'
  | 'met'
  | 'connected'
  | 'did_not_connect'
  | 'reschedule';

export interface StatusHistoryItem {
  id: string;
  status: ConnectionStatus;
  timestamp: string;
  source: 'deep_link' | 'user_action' | 'import';
  note?: string;
}

export interface ConnectionRecord {
  id: string;
  personName: string;
  personRef?: string;
  linkedInUrl?: string;
  introContext: string;
  status: ConnectionStatus;
  meetingDateTime?: string;
  meetingUrl?: string;
  createdAt: string;
  updatedAt: string;
  userNotes: string;
  rating?: number; // 1 to 5
  needsUpdate?: boolean;
  statusHistory: StatusHistoryItem[];
}

export interface DeepLinkPayload {
  v: 1;
  id: string;
  personName: string;
  personRef?: string;
  linkedInUrl?: string;
  introContext?: string;
  status?: ConnectionStatus;
  meetingDateTime?: string;
  meetingUrl?: string;
}

export interface BackupData {
  version: 1;
  exportedAt: string;
  connections: ConnectionRecord[];
}

export const STATUS_CONFIG: Record<
  ConnectionStatus,
  {
    label: string;
    description: string;
    colorClass: string;
    badgeBg: string;
    badgeText: string;
    borderColor: string;
  }
> = {
  not_started: {
    label: 'Not started',
    description: 'Introduction made but no meeting scheduled yet',
    colorClass: 'text-slate-700 bg-slate-100 border-slate-300',
    badgeBg: 'bg-slate-100 dark:bg-slate-800',
    badgeText: 'text-slate-700 dark:text-slate-300',
    borderColor: 'border-slate-300 dark:border-slate-700',
  },
  ongoing: {
    label: 'Ongoing',
    description: 'Conversation or interaction actively in progress',
    colorClass: 'text-amber-800 bg-amber-50 border-amber-300',
    badgeBg: 'bg-amber-100 dark:bg-amber-950/50',
    badgeText: 'text-amber-800 dark:text-amber-300',
    borderColor: 'border-amber-300 dark:border-amber-800',
  },
  scheduled: {
    label: 'Scheduled',
    description: 'Meeting date and time set',
    colorClass: 'text-blue-800 bg-blue-50 border-blue-300',
    badgeBg: 'bg-blue-100 dark:bg-blue-950/50',
    badgeText: 'text-blue-800 dark:text-blue-300',
    borderColor: 'border-blue-300 dark:border-blue-800',
  },
  met: {
    label: 'Met',
    description: 'Meeting took place',
    colorClass: 'text-indigo-800 bg-indigo-50 border-indigo-300',
    badgeBg: 'bg-indigo-100 dark:bg-indigo-950/50',
    badgeText: 'text-indigo-800 dark:text-indigo-300',
    borderColor: 'border-indigo-300 dark:border-indigo-800',
  },
  connected: {
    label: 'Connected',
    description: 'Successful connection made and follow-up established',
    colorClass: 'text-emerald-800 bg-emerald-50 border-emerald-300',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/50',
    badgeText: 'text-emerald-800 dark:text-emerald-300',
    borderColor: 'border-emerald-300 dark:border-emerald-800',
  },
  did_not_connect: {
    label: 'Did not connect',
    description: 'Unable to connect or meeting was cancelled',
    colorClass: 'text-rose-800 bg-rose-50 border-rose-300',
    badgeBg: 'bg-rose-100 dark:bg-rose-950/50',
    badgeText: 'text-rose-800 dark:text-rose-300',
    borderColor: 'border-rose-300 dark:border-rose-800',
  },
  reschedule: {
    label: 'Reschedule',
    description: 'Needs a new time scheduled',
    colorClass: 'text-purple-800 bg-purple-50 border-purple-300',
    badgeBg: 'bg-purple-100 dark:bg-purple-950/50',
    badgeText: 'text-purple-800 dark:text-purple-300',
    borderColor: 'border-purple-300 dark:border-purple-800',
  },
};
