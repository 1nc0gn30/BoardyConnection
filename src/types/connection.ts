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
    label: 'New intro',
    description: 'Intro made — no meeting yet',
    colorClass: 'text-paper/80 bg-navy-mid border-line',
    badgeBg: 'bg-navy-mid',
    badgeText: 'text-paper/80',
    borderColor: 'border-line',
  },
  ongoing: {
    label: 'Talking',
    description: 'Conversation is underway',
    colorClass: 'text-kraft-bright bg-kraft/10 border-kraft/30',
    badgeBg: 'bg-kraft/10',
    badgeText: 'text-kraft-bright',
    borderColor: 'border-kraft/30',
  },
  scheduled: {
    label: 'Meeting set',
    description: 'A time is on the calendar',
    colorClass: 'text-sky-200 bg-smile/15 border-smile/30',
    badgeBg: 'bg-smile/15',
    badgeText: 'text-sky-100',
    borderColor: 'border-smile/30',
  },
  met: {
    label: 'Met',
    description: 'You already met',
    colorClass: 'text-paper bg-navy-mid border-line',
    badgeBg: 'bg-navy-mid',
    badgeText: 'text-paper',
    borderColor: 'border-line',
  },
  connected: {
    label: 'Connected',
    description: 'Follow-up is in motion',
    colorClass: 'text-emerald-300 bg-emerald-950/50 border-emerald-800/70',
    badgeBg: 'bg-emerald-950/50',
    badgeText: 'text-emerald-300',
    borderColor: 'border-emerald-800/70',
  },
  did_not_connect: {
    label: "Didn't connect",
    description: 'No meeting, or it fell through',
    colorClass: 'text-rose-300 bg-rose-950/40 border-rose-900/60',
    badgeBg: 'bg-rose-950/40',
    badgeText: 'text-rose-300',
    borderColor: 'border-rose-900/60',
  },
  reschedule: {
    label: 'New time',
    description: 'Needs a new meeting time',
    colorClass: 'text-kraft-bright bg-kraft/10 border-kraft/30',
    badgeBg: 'bg-kraft/10',
    badgeText: 'text-kraft-bright',
    borderColor: 'border-kraft/30',
  },
};
