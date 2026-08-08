import { ConnectionRecord } from '../types/connection';

const STORAGE_KEY = 'connection_dashboard_records_v1';
const LAST_EXPORT_KEY = 'connection_dashboard_last_exported_at';
const PRIVACY_NOTICE_KEY = 'connection_dashboard_privacy_notice_dismissed';

// In-memory fallback for environments where window.localStorage is not available (e.g. Vitest/SSR)
const inMemoryStore = new Map<string, string>();

/**
 * Checks if localStorage is supported and accessible in the current browser session.
 */
export function isStorageAvailable(): boolean {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const testKey = '__storage_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return true;
    }
  } catch {
    // Fallback to in-memory store
  }
  return true; // We support inMemoryStore fallback
}

/**
 * Retrieves all stored connections from localStorage or memory store.
 */
export function getStoredConnections(): ConnectionRecord[] {
  try {
    let raw: string | null = null;
    if (typeof window !== 'undefined' && window.localStorage) {
      raw = window.localStorage.getItem(STORAGE_KEY);
    } else {
      raw = inMemoryStore.get(STORAGE_KEY) || null;
    }

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.warn('Storage contents corrupted or not an array. Resetting.');
      return [];
    }

    return parsed as ConnectionRecord[];
  } catch (error) {
    console.error('Failed to read connection records from storage:', error);
    return [];
  }
}

/**
 * Saves connection records array into localStorage or memory store.
 * Returns boolean indicating whether save succeeded.
 */
export function saveStoredConnections(records: ConnectionRecord[]): {
  success: boolean;
  error?: string;
} {
  try {
    const jsonStr = JSON.stringify(records);
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, jsonStr);
    } else {
      inMemoryStore.set(STORAGE_KEY, jsonStr);
    }
    return { success: true };
  } catch (error) {
    const errObj = error as Error;
    if (errObj.name === 'QuotaExceededError' || errObj.message?.includes('quota')) {
      return {
        success: false,
        error: 'Browser storage quota exceeded. Please export your data and remove old items.',
      };
    }
    return {
      success: false,
      error: `Failed to save data to storage: ${errObj.message || 'Unknown storage error'}`,
    };
  }
}

/**
 * Completely clears all stored connection records from localStorage or memory store.
 */
export function clearStoredConnections(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    inMemoryStore.delete(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear stored connections:', error);
  }
}

/**
 * Gets the ISO date string of when the user last exported a JSON backup.
 */
export function getLastExportedAt(): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(LAST_EXPORT_KEY);
    }
    return inMemoryStore.get(LAST_EXPORT_KEY) || null;
  } catch {
    return null;
  }
}

/**
 * Updates the last exported timestamp to current time or provided ISO string.
 */
export function setLastExportedAt(isoDateStr: string = new Date().toISOString()): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(LAST_EXPORT_KEY, isoDateStr);
    } else {
      inMemoryStore.set(LAST_EXPORT_KEY, isoDateStr);
    }
  } catch (error) {
    console.error('Failed to save last exported timestamp:', error);
  }
}

/**
 * Checks if the user has dismissed the first-use data loss notice.
 */
export function isFirstUseNoticeDismissed(): boolean {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(PRIVACY_NOTICE_KEY) === 'true';
    }
    return inMemoryStore.get(PRIVACY_NOTICE_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Sets the dismissal state for the first-use data loss notice.
 */
export function setFirstUseNoticeDismissed(dismissed: boolean): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(PRIVACY_NOTICE_KEY, String(dismissed));
    } else {
      inMemoryStore.set(PRIVACY_NOTICE_KEY, String(dismissed));
    }
  } catch (error) {
    console.error('Failed to save privacy notice dismissal state:', error);
  }
}
