import { BackupData } from '../types/connection';

export type CloudBackupResult =
  | { ok: true; backup: BackupData; empty?: false }
  | { ok: true; backup: null; empty: true }
  | { ok: false; error: string; needsAuth?: boolean; unavailable?: boolean };

async function request(
  method: 'GET' | 'PUT',
  token: string,
  body?: BackupData
): Promise<Response> {
  return fetch('/.netlify/functions/backup', {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

function unavailableError(): CloudBackupResult {
  return {
    ok: false,
    unavailable: true,
    error:
      'Cloud backup needs this site on Netlify with Identity enabled. Local backup still works.',
  };
}

export async function fetchCloudBackup(token: string): Promise<CloudBackupResult> {
  try {
    const res = await request('GET', token);
    if (res.status === 404) {
      const text = await res.text();
      if (text.includes('page not found') || text.includes('Cannot GET')) {
        return unavailableError();
      }
      return { ok: true, backup: null, empty: true };
    }
    if (res.status === 401) {
      return { ok: false, needsAuth: true, error: 'Sign in to use cloud backup.' };
    }
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      return { ok: false, error: data?.error || `Cloud restore failed (${res.status}).` };
    }
    const backup = (await res.json()) as BackupData;
    return { ok: true, backup };
  } catch {
    return unavailableError();
  }
}

export async function saveCloudBackup(
  token: string,
  backup: BackupData
): Promise<CloudBackupResult> {
  try {
    const res = await request('PUT', token, backup);
    if (res.status === 404) return unavailableError();
    if (res.status === 401) {
      return { ok: false, needsAuth: true, error: 'Sign in to use cloud backup.' };
    }
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      return { ok: false, error: data?.error || `Cloud save failed (${res.status}).` };
    }
    const saved = (await res.json()) as BackupData;
    return { ok: true, backup: saved };
  } catch {
    return unavailableError();
  }
}
