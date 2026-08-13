import { getStore } from '@netlify/blobs';
import type { Handler } from '@netlify/functions';
import { parseBackupJson } from '../../src/lib/backupSchema';

const STORE = 'boardy-backups';
const MAX_BYTES = 512_000;

function json(statusCode: number, payload: unknown) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  };
}

export const handler: Handler = async (event, context) => {
  const user = context.clientContext?.user as { sub?: string; email?: string } | undefined;
  if (!user?.sub) {
    return json(401, { error: 'Sign in to use cloud backup.' });
  }

  const store = getStore(STORE);
  const key = user.sub;

  if (event.httpMethod === 'GET') {
    const stored = await store.get(key, { type: 'text' });
    if (!stored) {
      return json(404, { error: 'No cloud backup yet.' });
    }
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: stored,
    };
  }

  if (event.httpMethod === 'PUT') {
    const raw = event.body || '';
    if (raw.length > MAX_BYTES) {
      return json(413, { error: 'Backup is too large to store in the cloud.' });
    }
    const parsed = parseBackupJson(raw);
    if (parsed.success === false) {
      return json(400, { error: parsed.error });
    }
    const backup = {
      ...parsed.backup,
      exportedAt: new Date().toISOString(),
    };
    await store.setJSON(key, backup, {
      metadata: {
        email: user.email || '',
        count: String(backup.connections.length),
      },
    });
    return json(200, backup);
  }

  return json(405, { error: 'Use GET or PUT.' });
};
