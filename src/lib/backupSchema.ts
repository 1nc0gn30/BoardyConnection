import { BackupData, ConnectionRecord, ConnectionStatus } from '../types/connection';

export const BACKUP_VERSION = 1 as const;

export const VALID_BACKUP_STATUSES: ConnectionStatus[] = [
  'not_started',
  'ongoing',
  'scheduled',
  'met',
  'connected',
  'did_not_connect',
  'reschedule',
];

export const BACKUP_EXAMPLE: BackupData = {
  version: 1,
  exportedAt: '2026-08-13T12:00:00.000Z',
  connections: [
    {
      id: 'conn_boardy_1001',
      personName: 'Alex Rivera',
      personRef: 'boardy_ref_8921',
      linkedInUrl: 'https://www.linkedin.com/in/alexrivera-tech',
      introContext: 'Introduced by Boardy to discuss a product partnership.',
      status: 'scheduled',
      meetingDateTime: '2026-08-15T15:00',
      meetingUrl: 'https://meet.google.com/abc-defg-hij',
      createdAt: '2026-08-10T09:00:00.000Z',
      updatedAt: '2026-08-12T18:30:00.000Z',
      userNotes: 'Ask about their advisor role.',
      rating: 4,
      needsUpdate: false,
      statusHistory: [
        {
          id: 'hist_example_1',
          status: 'scheduled',
          timestamp: '2026-08-12T18:30:00.000Z',
          source: 'deep_link',
          note: 'Imported via Boardy intro link',
        },
      ],
    },
  ],
};

/** JSON Schema (draft-07) for a Boardy Connection backup file. */
export const BACKUP_JSON_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://boardy.local/backup-schema.json',
  title: 'Boardy Connection backup',
  type: 'object',
  required: ['version', 'connections'],
  additionalProperties: true,
  properties: {
    version: { const: 1, description: 'Backup format version. Must be 1.' },
    exportedAt: { type: 'string', description: 'ISO-8601 timestamp of when this file was written.' },
    connections: {
      type: 'array',
      description: 'People saved in this browser.',
      items: {
        type: 'object',
        required: ['id', 'personName'],
        additionalProperties: true,
        properties: {
          id: { type: 'string', minLength: 1, description: 'Stable unique id. Same id updates the same person.' },
          personName: { type: 'string', minLength: 1 },
          personRef: { type: 'string' },
          linkedInUrl: { type: 'string' },
          introContext: { type: 'string' },
          status: { enum: VALID_BACKUP_STATUSES },
          meetingDateTime: { type: 'string' },
          meetingUrl: { type: 'string' },
          createdAt: { type: 'string' },
          updatedAt: { type: 'string' },
          userNotes: { type: 'string' },
          rating: { type: 'number', minimum: 1, maximum: 5 },
          needsUpdate: { type: 'boolean' },
          statusHistory: { type: 'array' },
        },
      },
    },
  },
} as const;

export function normalizeConnection(item: unknown): ConnectionRecord | null {
  if (!item || typeof item !== 'object') return null;
  const obj = item as Record<string, unknown>;
  if (typeof obj.id !== 'string' || obj.id.trim() === '') return null;
  if (typeof obj.personName !== 'string' || obj.personName.trim() === '') return null;

  const status =
    typeof obj.status === 'string' && VALID_BACKUP_STATUSES.includes(obj.status as ConnectionStatus)
      ? (obj.status as ConnectionStatus)
      : 'not_started';

  return {
    id: obj.id.trim(),
    personName: obj.personName.trim(),
    personRef: typeof obj.personRef === 'string' && obj.personRef.trim() ? obj.personRef.trim() : undefined,
    linkedInUrl:
      typeof obj.linkedInUrl === 'string' && obj.linkedInUrl.trim() ? obj.linkedInUrl.trim() : undefined,
    introContext: typeof obj.introContext === 'string' ? obj.introContext : '',
    status,
    meetingDateTime:
      typeof obj.meetingDateTime === 'string' && obj.meetingDateTime.trim()
        ? obj.meetingDateTime.trim()
        : undefined,
    meetingUrl:
      typeof obj.meetingUrl === 'string' && obj.meetingUrl.trim() ? obj.meetingUrl.trim() : undefined,
    createdAt: typeof obj.createdAt === 'string' ? obj.createdAt : new Date().toISOString(),
    updatedAt: typeof obj.updatedAt === 'string' ? obj.updatedAt : new Date().toISOString(),
    userNotes: typeof obj.userNotes === 'string' ? obj.userNotes : '',
    rating: typeof obj.rating === 'number' && obj.rating >= 1 && obj.rating <= 5 ? obj.rating : undefined,
    needsUpdate: Boolean(obj.needsUpdate),
    statusHistory: Array.isArray(obj.statusHistory)
      ? (obj.statusHistory as ConnectionRecord['statusHistory'])
      : [],
  };
}

export function parseBackupJson(
  jsonString: string
): { success: true; backup: BackupData } | { success: false; error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch (err) {
    return { success: false, error: `This is not valid JSON. ${(err as Error).message}` };
  }

  let rawConnections: unknown[] = [];
  let exportedAt = new Date().toISOString();

  if (Array.isArray(parsed)) {
    rawConnections = parsed;
  } else if (parsed && typeof parsed === 'object') {
    const obj = parsed as Record<string, unknown>;
    if (obj.version !== undefined && obj.version !== BACKUP_VERSION) {
      return {
        success: false,
        error: `Unsupported backup version "${String(obj.version)}". This app reads version 1.`,
      };
    }
    if (Array.isArray(obj.connections)) {
      rawConnections = obj.connections;
    } else {
      return {
        success: false,
        error: 'Expected `{ "version": 1, "connections": [ ... ] }` or a JSON array of people.',
      };
    }
    if (typeof obj.exportedAt === 'string') exportedAt = obj.exportedAt;
  } else {
    return { success: false, error: 'Backup must be a JSON object or array.' };
  }

  const connections = rawConnections
    .map(normalizeConnection)
    .filter((row): row is ConnectionRecord => row !== null);

  if (connections.length === 0) {
    return {
      success: false,
      error: 'No valid people found. Each person needs at least `id` and `personName`.',
    };
  }

  return {
    success: true,
    backup: {
      version: 1,
      exportedAt,
      connections,
    },
  };
}
