import { beforeEach, describe, expect, it } from 'vitest';
import { DeepLinkPayload } from '../../types/connection';
import {
  exportToJSON,
  importFromJSON,
  updateConnectionStatus,
  upsertFromDeepLink,
} from '../connectionService';
import { clearStoredConnections, getStoredConnections } from '../storage';

describe('connectionService', () => {
  beforeEach(() => {
    clearStoredConnections();
  });

  it('should create a new connection from a deep link payload', () => {
    const payload: DeepLinkPayload = {
      v: 1,
      id: 'conn_deep_100',
      personName: 'Casey Morgan',
      introContext: 'Intro by Boardy',
      status: 'scheduled',
      meetingDateTime: '2026-08-15T10:00',
    };

    const result = upsertFromDeepLink(payload);
    expect(result.isNew).toBe(true);
    expect(result.record.id).toBe('conn_deep_100');
    expect(result.record.needsUpdate).toBe(true);
    expect(result.record.statusHistory.length).toBe(1);

    const stored = getStoredConnections();
    expect(stored.length).toBe(1);
    expect(stored[0].personName).toBe('Casey Morgan');
  });

  it('should update an existing connection when upserted with same stable ID without duplicating', () => {
    const payload1: DeepLinkPayload = {
      v: 1,
      id: 'conn_stable_99',
      personName: 'Taylor Swift',
      introContext: 'First intro version',
      status: 'not_started',
    };

    const firstUpsert = upsertFromDeepLink(payload1);
    expect(firstUpsert.isNew).toBe(true);

    // User updates notes on this connection
    updateConnectionStatus('conn_stable_99', 'ongoing', 'Had brief text chat');

    // Second deep link received with SAME id 'conn_stable_99'
    const payload2: DeepLinkPayload = {
      v: 1,
      id: 'conn_stable_99',
      personName: 'Taylor Swift',
      introContext: 'Updated intro version with meeting link',
      status: 'scheduled',
      meetingUrl: 'https://meet.google.com/xyz',
    };

    const secondUpsert = upsertFromDeepLink(payload2);
    expect(secondUpsert.isNew).toBe(false);

    const stored = getStoredConnections();
    // Must NOT duplicate record!
    expect(stored.length).toBe(1);
    expect(stored[0].meetingUrl).toBe('https://meet.google.com/xyz');
    expect(stored[0].status).toBe('scheduled');
    // User notes should be preserved!
    expect(stored[0].userNotes).toContain('Had brief text chat');
    // Needs update flag set to true to notify user
    expect(stored[0].needsUpdate).toBe(true);
  });

  it('should export and import JSON backup correctly', () => {
    const payload: DeepLinkPayload = {
      v: 1,
      id: 'conn_export_1',
      personName: 'Morgan Freeman',
      introContext: 'Intro for narrating app',
      status: 'connected',
    };
    upsertFromDeepLink(payload);

    const exportedJson = exportToJSON();
    expect(exportedJson).toContain('conn_export_1');
    expect(exportedJson).toContain('Morgan Freeman');

    // Clear and restore
    clearStoredConnections();
    expect(getStoredConnections().length).toBe(0);

    const importResult = importFromJSON(exportedJson, 'replace');
    expect(importResult.success).toBe(true);
    expect(importResult.importedCount).toBe(1);

    const restored = getStoredConnections();
    expect(restored.length).toBe(1);
    expect(restored[0].personName).toBe('Morgan Freeman');
  });

  it('should handle invalid JSON import gracefully', () => {
    const result = importFromJSON('{"invalid": "data"}', 'merge');
    expect(result.success).toBe(false);
    expect(result.importedCount).toBe(0);
    expect(result.error).toBeDefined();
  });
});
