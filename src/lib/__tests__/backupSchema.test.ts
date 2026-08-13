import { describe, expect, it } from 'vitest';
import { BACKUP_EXAMPLE, parseBackupJson } from '../backupSchema';
import { importFromJSON } from '../connectionService';
import { clearStoredConnections, getStoredConnections } from '../storage';

describe('backupSchema', () => {
  it('parses the documented example backup', () => {
    const result = parseBackupJson(JSON.stringify(BACKUP_EXAMPLE));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.backup.version).toBe(1);
      expect(result.backup.connections[0].personName).toBe('Alex Rivera');
    }
  });

  it('accepts a bare array of people', () => {
    const result = parseBackupJson(
      JSON.stringify([{ id: 'p1', personName: 'Sam Lee' }])
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.backup.connections).toHaveLength(1);
      expect(result.backup.connections[0].status).toBe('not_started');
    }
  });

  it('rejects files without people', () => {
    const result = parseBackupJson('{"version":1,"connections":[]}');
    expect(result.success).toBe(false);
  });

  it('imports the example through the same path as the restore UI', () => {
    clearStoredConnections();
    const imported = importFromJSON(JSON.stringify(BACKUP_EXAMPLE), 'replace');
    expect(imported.success).toBe(true);
    expect(getStoredConnections()[0].id).toBe('conn_boardy_1001');
  });
});
