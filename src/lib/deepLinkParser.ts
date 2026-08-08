import { ConnectionStatus, DeepLinkPayload } from '../types/connection';

const VALID_STATUSES: ConnectionStatus[] = [
  'not_started',
  'ongoing',
  'scheduled',
  'met',
  'connected',
  'did_not_connect',
  'reschedule',
];

/**
 * Encodes a deep link payload into a URL-safe Base64 string.
 */
export function encodePayload(payload: DeepLinkPayload): string {
  const jsonStr = JSON.stringify(payload);
  // Convert UTF-8 to base64
  const bytes = new TextEncoder().encode(jsonStr);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  // Make URL safe: replace + with -, / with _, and remove trailing =
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Decodes and validates a deep link payload string.
 * Supports URL-safe base64, standard base64, and URI-encoded JSON string.
 */
export function decodePayload(
  rawPayloadStr: string
): { success: true; data: DeepLinkPayload } | { success: false; error: string } {
  if (!rawPayloadStr || typeof rawPayloadStr !== 'string') {
    return { success: false, error: 'Empty or missing payload parameter.' };
  }

  let jsonString = '';

  try {
    // Trim whitespace and potential quotes
    const trimmed = rawPayloadStr.trim();

    // 1. Try URI component decoding if it looks like raw URL-encoded JSON
    if (trimmed.startsWith('{') || trimmed.startsWith('%7B')) {
      jsonString = decodeURIComponent(trimmed);
    } else {
      // 2. Decode Base64 (convert URL-safe back to standard base64)
      let base64 = trimmed.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) {
        base64 += '=';
      }

      const binaryStr = atob(base64);
      const bytes = Uint8Array.from(binaryStr, (c) => c.charCodeAt(0));
      jsonString = new TextDecoder().decode(bytes);
    }
  } catch {
    return {
      success: false,
      error: 'Invalid URL encoding or Base64 format. Unable to parse payload.',
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    return { success: false, error: 'Payload is not valid JSON.' };
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { success: false, error: 'Payload must be a JSON object.' };
  }

  const obj = parsed as Record<string, unknown>;

  // Check version
  const versionNum = Number(obj.v);
  if (versionNum !== 1) {
    return {
      success: false,
      error: `Unsupported payload version: "${String(obj.v)}". Expected version 1.`,
    };
  }

  // Check required fields
  if (!obj.id || typeof obj.id !== 'string' || obj.id.trim() === '') {
    return { success: false, error: 'Payload is missing a valid string "id".' };
  }

  if (!obj.personName || typeof obj.personName !== 'string' || obj.personName.trim() === '') {
    return { success: false, error: 'Payload is missing a valid "personName".' };
  }

  // Optional status validation
  let validatedStatus: ConnectionStatus | undefined = undefined;
  if (obj.status) {
    if (typeof obj.status === 'string' && VALID_STATUSES.includes(obj.status as ConnectionStatus)) {
      validatedStatus = obj.status as ConnectionStatus;
    } else {
      return {
        success: false,
        error: `Invalid connection status "${String(obj.status)}" in payload.`,
      };
    }
  }

  const validatedPayload: DeepLinkPayload = {
    v: 1,
    id: obj.id.trim(),
    personName: obj.personName.trim(),
    personRef: typeof obj.personRef === 'string' ? obj.personRef.trim() : undefined,
    linkedInUrl: typeof obj.linkedInUrl === 'string' ? obj.linkedInUrl.trim() : undefined,
    introContext: typeof obj.introContext === 'string' ? obj.introContext.trim() : undefined,
    status: validatedStatus,
    meetingDateTime: typeof obj.meetingDateTime === 'string' ? obj.meetingDateTime.trim() : undefined,
    meetingUrl: typeof obj.meetingUrl === 'string' ? obj.meetingUrl.trim() : undefined,
  };

  return { success: true, data: validatedPayload };
}

/**
 * Constructs a full deep link URL given a payload object.
 */
export function generateDeepLinkUrl(payload: DeepLinkPayload, originUrl?: string): string {
  const encoded = encodePayload(payload);
  const base = originUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  return `${base}/update?payload=${encoded}`;
}

/**
 * Generates a sample payload for testing / demo purposes.
 */
export function createSamplePayload(customId?: string): DeepLinkPayload {
  const sampleId = customId || `conn_boardy_${Math.floor(1000 + Math.random() * 9000)}`;
  const dateInFuture = new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16); // 2 days from now, YYYY-MM-THH:mm

  return {
    v: 1,
    id: sampleId,
    personName: 'Alex Rivera',
    personRef: 'boardy_ref_8921',
    linkedInUrl: 'https://www.linkedin.com/in/alexrivera-tech',
    introContext: 'Introduced by Boardy AI to discuss cross-functional product partnership and advisor position.',
    status: 'scheduled',
    meetingDateTime: dateInFuture,
    meetingUrl: 'https://meet.google.com/abc-defg-hij',
  };
}
