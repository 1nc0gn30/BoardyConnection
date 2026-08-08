import {
  BackupData,
  ConnectionRecord,
  ConnectionStatus,
  DeepLinkPayload,
  StatusHistoryItem,
} from '../types/connection';
import { clearStoredConnections, getStoredConnections, saveStoredConnections } from './storage';

export { clearStoredConnections, getStoredConnections };

/**
 * Helper to update user notes on a connection.
 */
export function updateConnectionNotes(id: string, notes: string): ConnectionRecord | null {
  return updateConnectionRecord({ id, userNotes: notes });
}

/**
 * Helper to update rating on a connection.
 */
export function updateConnectionRating(id: string, rating: number): ConnectionRecord | null {
  return updateConnectionRecord({ id, rating });
}

/**
 * Generates a unique history entry ID
 */
function createHistoryId(): string {
  return `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

/**
 * Upserts a connection record from a deep link payload.
 * If record exists with matching stable id, updates details and sets needsUpdate = true.
 * Preserves existing user notes, rating, and status history.
 */
export function upsertFromDeepLink(payload: DeepLinkPayload): {
  record: ConnectionRecord;
  isNew: boolean;
  allRecords: ConnectionRecord[];
} {
  const records = getStoredConnections();
  const existingIndex = records.findIndex((r) => r.id === payload.id);
  const now = new Date().toISOString();

  const newStatus: ConnectionStatus = payload.status || 'not_started';

  if (existingIndex >= 0) {
    // Record already exists -> update it without duplicating!
    const existing = records[existingIndex];
    const statusChanged = existing.status !== newStatus;

    const updatedHistory: StatusHistoryItem[] = statusChanged
      ? [
          {
            id: createHistoryId(),
            status: newStatus,
            timestamp: now,
            source: 'deep_link',
            note: 'Updated via incoming deep link',
          },
          ...existing.statusHistory,
        ]
      : existing.statusHistory;

    const updatedRecord: ConnectionRecord = {
      ...existing,
      personName: payload.personName || existing.personName,
      personRef: payload.personRef !== undefined ? payload.personRef : existing.personRef,
      linkedInUrl: payload.linkedInUrl !== undefined ? payload.linkedInUrl : existing.linkedInUrl,
      introContext: payload.introContext !== undefined ? payload.introContext : existing.introContext,
      status: newStatus,
      meetingDateTime:
        payload.meetingDateTime !== undefined ? payload.meetingDateTime : existing.meetingDateTime,
      meetingUrl: payload.meetingUrl !== undefined ? payload.meetingUrl : existing.meetingUrl,
      updatedAt: now,
      needsUpdate: true, // Mark prominent for user action
      statusHistory: updatedHistory,
    };

    records[existingIndex] = updatedRecord;
    saveStoredConnections(records);

    return { record: updatedRecord, isNew: false, allRecords: records };
  } else {
    // New connection record
    const initialHistory: StatusHistoryItem[] = [
      {
        id: createHistoryId(),
        status: newStatus,
        timestamp: now,
        source: 'deep_link',
        note: 'Imported via deep link',
      },
    ];

    const newRecord: ConnectionRecord = {
      id: payload.id,
      personName: payload.personName,
      personRef: payload.personRef,
      linkedInUrl: payload.linkedInUrl,
      introContext: payload.introContext || 'Introduced via deep link',
      status: newStatus,
      meetingDateTime: payload.meetingDateTime,
      meetingUrl: payload.meetingUrl,
      createdAt: now,
      updatedAt: now,
      userNotes: '',
      rating: undefined,
      needsUpdate: true, // Mark as requiring user update
      statusHistory: initialHistory,
    };

    const updatedRecords = [newRecord, ...records];
    saveStoredConnections(updatedRecords);

    return { record: newRecord, isNew: true, allRecords: updatedRecords };
  }
}

/**
 * Updates status, optional note, and optional rating for a connection.
 */
export function updateConnectionStatus(
  id: string,
  newStatus: ConnectionStatus,
  note?: string,
  rating?: number
): ConnectionRecord | null {
  const records = getStoredConnections();
  const index = records.findIndex((r) => r.id === id);
  if (index === -1) return null;

  const existing = records[index];
  const now = new Date().toISOString();

  const historyItem: StatusHistoryItem = {
    id: createHistoryId(),
    status: newStatus,
    timestamp: now,
    source: 'user_action',
    note: note || `Status changed to ${newStatus}`,
  };

  let newNotes = existing.userNotes;
  if (note && note.trim().length > 0) {
    const timestampHeader = `[${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}]`;
    newNotes = existing.userNotes
      ? `${existing.userNotes}\n${timestampHeader}: ${note.trim()}`
      : `${timestampHeader}: ${note.trim()}`;
  }

  const updatedRecord: ConnectionRecord = {
    ...existing,
    status: newStatus,
    userNotes: newNotes,
    rating: rating !== undefined ? rating : existing.rating,
    updatedAt: now,
    needsUpdate: false, // User updated it!
    statusHistory: [historyItem, ...existing.statusHistory],
  };

  records[index] = updatedRecord;
  saveStoredConnections(records);
  return updatedRecord;
}

/**
 * Updates arbitrary fields on a connection record (notes, meeting info, details).
 */
export function updateConnectionRecord(
  updated: Partial<ConnectionRecord> & { id: string }
): ConnectionRecord | null {
  const records = getStoredConnections();
  const index = records.findIndex((r) => r.id === updated.id);
  if (index === -1) return null;

  const existing = records[index];
  const now = new Date().toISOString();

  const mergedRecord: ConnectionRecord = {
    ...existing,
    ...updated,
    updatedAt: now,
  };

  records[index] = mergedRecord;
  saveStoredConnections(records);
  return mergedRecord;
}

/**
 * Removes the 'needsUpdate' visual highlight tag.
 */
export function clearNeedsUpdateFlag(id: string): ConnectionRecord | null {
  const records = getStoredConnections();
  const index = records.findIndex((r) => r.id === id);
  if (index === -1) return null;

  records[index] = {
    ...records[index],
    needsUpdate: false,
  };

  saveStoredConnections(records);
  return records[index];
}

/**
 * Deletes a connection record.
 */
export function deleteConnection(id: string): ConnectionRecord[] {
  const records = getStoredConnections();
  const filtered = records.filter((r) => r.id !== id);
  saveStoredConnections(filtered);
  return filtered;
}

/**
 * Creates a brand new connection manually from form data.
 */
export function createManualConnection(data: {
  personName: string;
  personRef?: string;
  linkedInUrl?: string;
  introContext: string;
  status: ConnectionStatus;
  meetingDateTime?: string;
  meetingUrl?: string;
  userNotes?: string;
  rating?: number;
}): ConnectionRecord {
  const records = getStoredConnections();
  const now = new Date().toISOString();
  const newId = `conn_manual_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const newRecord: ConnectionRecord = {
    id: newId,
    personName: data.personName,
    personRef: data.personRef,
    linkedInUrl: data.linkedInUrl,
    introContext: data.introContext,
    status: data.status,
    meetingDateTime: data.meetingDateTime,
    meetingUrl: data.meetingUrl,
    createdAt: now,
    updatedAt: now,
    userNotes: data.userNotes || '',
    rating: data.rating,
    needsUpdate: false,
    statusHistory: [
      {
        id: createHistoryId(),
        status: data.status,
        timestamp: now,
        source: 'user_action',
        note: 'Manually created connection',
      },
    ],
  };

  const updatedRecords = [newRecord, ...records];
  saveStoredConnections(updatedRecords);
  return newRecord;
}

/**
 * Exports all local connection records as a formatted JSON string.
 */
export function exportToJSON(): string {
  const connections = getStoredConnections();
  const backup: BackupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    connections,
  };
  return JSON.stringify(backup, null, 2);
}

/**
 * Imports connection records from JSON string with safety checks and deduplication.
 */
export function importFromJSON(
  jsonString: string,
  mode: 'merge' | 'replace' = 'merge'
): { success: boolean; importedCount: number; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);

    let rawConnections: unknown[] = [];

    if (parsed && typeof parsed === 'object') {
      if (Array.isArray(parsed.connections)) {
        rawConnections = parsed.connections;
      } else if (Array.isArray(parsed)) {
        rawConnections = parsed;
      } else {
        return {
          success: false,
          importedCount: 0,
          error: 'Invalid JSON format. Expected an array of connections or backup file format.',
        };
      }
    } else {
      return {
        success: false,
        importedCount: 0,
        error: 'Invalid backup file content.',
      };
    }

    // Validate each connection record in the array
    const validRecords: ConnectionRecord[] = [];
    for (const item of rawConnections) {
      if (
        item &&
        typeof item === 'object' &&
        'id' in item &&
        typeof (item as Record<string, unknown>).id === 'string' &&
        'personName' in item &&
        typeof (item as Record<string, unknown>).personName === 'string'
      ) {
        const obj = item as Partial<ConnectionRecord>;
        validRecords.push({
          id: String(obj.id),
          personName: String(obj.personName),
          personRef: obj.personRef ? String(obj.personRef) : undefined,
          linkedInUrl: obj.linkedInUrl ? String(obj.linkedInUrl) : undefined,
          introContext: obj.introContext ? String(obj.introContext) : '',
          status: (obj.status as ConnectionStatus) || 'not_started',
          meetingDateTime: obj.meetingDateTime ? String(obj.meetingDateTime) : undefined,
          meetingUrl: obj.meetingUrl ? String(obj.meetingUrl) : undefined,
          createdAt: obj.createdAt || new Date().toISOString(),
          updatedAt: obj.updatedAt || new Date().toISOString(),
          userNotes: obj.userNotes || '',
          rating: typeof obj.rating === 'number' ? obj.rating : undefined,
          needsUpdate: Boolean(obj.needsUpdate),
          statusHistory: Array.isArray(obj.statusHistory) ? obj.statusHistory : [],
        });
      }
    }

    if (validRecords.length === 0) {
      return {
        success: false,
        importedCount: 0,
        error: 'No valid connection records found in the provided JSON file.',
      };
    }

    if (mode === 'replace') {
      saveStoredConnections(validRecords);
      return { success: true, importedCount: validRecords.length };
    } else {
      // Merge mode (deduplicate by stable id)
      const existing = getStoredConnections();
      const existingMap = new Map(existing.map((r) => [r.id, r]));

      validRecords.forEach((rec) => {
        if (existingMap.has(rec.id)) {
          // Merge: preserve user notes if existing record has notes
          const old = existingMap.get(rec.id)!;
          existingMap.set(rec.id, {
            ...rec,
            userNotes: old.userNotes || rec.userNotes,
            rating: old.rating ?? rec.rating,
            statusHistory:
              old.statusHistory.length > rec.statusHistory.length ? old.statusHistory : rec.statusHistory,
          });
        } else {
          existingMap.set(rec.id, rec);
        }
      });

      const mergedList = Array.from(existingMap.values());
      saveStoredConnections(mergedList);
      return { success: true, importedCount: validRecords.length };
    }
  } catch (err) {
    return {
      success: false,
      importedCount: 0,
      error: `Failed to parse JSON file: ${(err as Error).message}`,
    };
  }
}

/**
 * Generates sample demo connections for quick app testing.
 */
export function loadSampleData(): ConnectionRecord[] {
  clearStoredConnections();
  const now = Date.now();
  const samples: ConnectionRecord[] = [
    {
      id: 'conn_demo_1',
      personName: 'Elena Rostova',
      personRef: 'boardy_ref_e1',
      linkedInUrl: 'https://www.linkedin.com/in/elena-rostova-design',
      introContext:
        'Introduced by Boardy AI for design lead role at healthtech startup. High experience in accessible mobile apps.',
      status: 'scheduled',
      meetingDateTime: new Date(now + 86400000 * 1.5).toISOString().slice(0, 16),
      meetingUrl: 'https://meet.google.com/sample-elena-meet',
      createdAt: new Date(now - 86400000 * 2).toISOString(),
      updatedAt: new Date(now - 86400000 * 0.5).toISOString(),
      userNotes: 'Prepared questions about UI architecture & accessibility testing.',
      rating: 4,
      needsUpdate: true, // Visual callout for "Needs your update"
      statusHistory: [
        {
          id: createHistoryId(),
          status: 'scheduled',
          timestamp: new Date(now - 86400000 * 0.5).toISOString(),
          source: 'deep_link',
          note: 'Imported intro from Boardy',
        },
      ],
    },
    {
      id: 'conn_demo_2',
      personName: 'Dr. Marcus Vance',
      personRef: 'boardy_ref_m2',
      linkedInUrl: 'https://www.linkedin.com/in/marcusvance-ai',
      introContext: 'Met via AI research forum. Looking to collaborate on local-first LLM applications.',
      status: 'met',
      meetingDateTime: new Date(now - 86400000 * 3).toISOString().slice(0, 16),
      meetingUrl: 'https://zoom.us/j/1234567890',
      createdAt: new Date(now - 86400000 * 5).toISOString(),
      updatedAt: new Date(now - 86400000 * 3).toISOString(),
      userNotes: 'Great discussion on privacy-first client side state! Agreed to send GitHub repo link.',
      rating: 5,
      needsUpdate: false,
      statusHistory: [
        {
          id: createHistoryId(),
          status: 'met',
          timestamp: new Date(now - 86400000 * 3).toISOString(),
          source: 'user_action',
          note: 'Marked as met after 45-min Zoom call',
        },
        {
          id: createHistoryId(),
          status: 'scheduled',
          timestamp: new Date(now - 86400000 * 5).toISOString(),
          source: 'deep_link',
          note: 'Scheduled coffee chat',
        },
      ],
    },
    {
      id: 'conn_demo_3',
      personName: 'Sophia Lin',
      personRef: 'boardy_ref_s3',
      linkedInUrl: 'https://www.linkedin.com/in/sophialin-product',
      introContext: 'Intro by Boardy regarding angel investment and product strategy advice.',
      status: 'connected',
      meetingDateTime: new Date(now - 86400000 * 7).toISOString().slice(0, 16),
      createdAt: new Date(now - 86400000 * 10).toISOString(),
      updatedAt: new Date(now - 86400000 * 6).toISOString(),
      userNotes: 'Followed up over email. Connected on LinkedIn.',
      rating: 5,
      needsUpdate: false,
      statusHistory: [
        {
          id: createHistoryId(),
          status: 'connected',
          timestamp: new Date(now - 86400000 * 6).toISOString(),
          source: 'user_action',
          note: 'Connected via LinkedIn and quarterly updates list',
        },
      ],
    },
    {
      id: 'conn_demo_4',
      personName: 'David K. O’Connor',
      linkedInUrl: 'https://www.linkedin.com/in/davidkoconnor',
      introContext: 'Potential consulting project on privacy auditing.',
      status: 'reschedule',
      meetingDateTime: new Date(now - 86400000 * 1).toISOString().slice(0, 16),
      createdAt: new Date(now - 86400000 * 4).toISOString(),
      updatedAt: new Date(now - 86400000 * 1).toISOString(),
      userNotes: 'David requested to reschedule due to travel conflict. Waiting on new availability.',
      rating: 3,
      needsUpdate: true,
      statusHistory: [
        {
          id: createHistoryId(),
          status: 'reschedule',
          timestamp: new Date(now - 86400000 * 1).toISOString(),
          source: 'user_action',
          note: 'Reschedule requested by attendee',
        },
      ],
    },
  ];

  saveStoredConnections(samples);
  return samples;
}
