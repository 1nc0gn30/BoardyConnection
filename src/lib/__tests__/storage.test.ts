import { beforeEach, describe, expect, it } from 'vitest';
import { ConnectionRecord } from '../../types/connection';
import {
  clearStoredConnections,
  getStoredConnections,
  saveStoredConnections,
} from '../storage';

describe('storage module', () => {
  beforeEach(() => {
    clearStoredConnections();
  });

  it('should return an empty array when no connections exist', () => {
    const records = getStoredConnections();
    expect(records).toEqual([]);
  });

  it('should save and retrieve connections correctly', () => {
    const mockConnection: ConnectionRecord = {
      id: 'conn_test_storage_1',
      personName: 'Sam Taylor',
      introContext: 'Intro via research group',
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userNotes: 'Notes for Sam',
      statusHistory: [],
    };

    const saveResult = saveStoredConnections([mockConnection]);
    expect(saveResult.success).toBe(true);

    const retrieved = getStoredConnections();
    expect(retrieved.length).toBe(1);
    expect(retrieved[0].id).toBe('conn_test_storage_1');
    expect(retrieved[0].personName).toBe('Sam Taylor');
  });

  it('should clear stored connections cleanly', () => {
    const mockConnection: ConnectionRecord = {
      id: 'conn_test_storage_2',
      personName: 'Pat Lee',
      introContext: 'Intro via community',
      status: 'not_started',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userNotes: '',
      statusHistory: [],
    };

    saveStoredConnections([mockConnection]);
    expect(getStoredConnections().length).toBe(1);

    clearStoredConnections();
    expect(getStoredConnections().length).toBe(0);
  });
});
