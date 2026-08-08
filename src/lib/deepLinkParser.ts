import { ConnectionStatus, DeepLinkPayload } from '../types/connection';

const MAX_PAYLOAD_LENGTH = 102400; // 100 KB limit

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
  * Helper to validate that a URL uses secure https:// protocol only.
  */
function isValidHttpsUrl(urlString: string): boolean {
  try {
    const parsed = new URL(urlString);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Encodes a deep link payload into a URL-safe Base64 string.
 * Explicitly sanitizes and excludes private user notes or ratings.
 */
export function encodePayload(payload: DeepLinkPayload): string {
  const sanitized: DeepLinkPayload = {
    v: 1,
    id: String(payload.id).trim(),
    personName: String(payload.personName).trim(),
    personRef: payload.personRef ? String(payload.personRef).trim() : undefined,
    linkedInUrl: payload.linkedInUrl ? String(payload.linkedInUrl).trim() : undefined,
    introContext: payload.introContext ? String(payload.introContext).trim() : undefined,
    status: payload.status,
    meetingDateTime: payload.meetingDateTime ? String(payload.meetingDateTime).trim() : undefined,
    meetingUrl: payload.meetingUrl ? String(payload.meetingUrl).trim() : undefined,
  };

  const jsonStr = JSON.stringify(sanitized);
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

  // Enforce maximum payload length (100 KB)
  if (rawPayloadStr.length > MAX_PAYLOAD_LENGTH) {
    return {
      success: false,
      error: `Payload exceeds maximum allowed length of ${MAX_PAYLOAD_LENGTH / 1024} KB.`,
    };
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

  // Check version (must be integer 1)
  if (obj.v !== 1) {
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

  // URL protocol validations (https only)
  let validatedLinkedInUrl: string | undefined = undefined;
  if (typeof obj.linkedInUrl === 'string' && obj.linkedInUrl.trim() !== '') {
    const trimmedUrl = obj.linkedInUrl.trim();
    if (!isValidHttpsUrl(trimmedUrl)) {
      return {
        success: false,
        error: `Invalid or unsafe LinkedIn URL "${trimmedUrl}". Only https:// URLs are allowed.`,
      };
    }
    validatedLinkedInUrl = trimmedUrl;
  }

  let validatedMeetingUrl: string | undefined = undefined;
  if (typeof obj.meetingUrl === 'string' && obj.meetingUrl.trim() !== '') {
    const trimmedUrl = obj.meetingUrl.trim();
    if (!isValidHttpsUrl(trimmedUrl)) {
      return {
        success: false,
        error: `Invalid or unsafe meeting URL "${trimmedUrl}". Only https:// URLs are allowed.`,
      };
    }
    validatedMeetingUrl = trimmedUrl;
  }

  // Meeting date time check if provided
  let validatedMeetingDateTime: string | undefined = undefined;
  if (typeof obj.meetingDateTime === 'string' && obj.meetingDateTime.trim() !== '') {
    const trimmedDT = obj.meetingDateTime.trim();
    if (isNaN(Date.parse(trimmedDT))) {
      return {
        success: false,
        error: `Invalid meeting date/time format "${trimmedDT}".`,
      };
    }
    validatedMeetingDateTime = trimmedDT;
  }

  const validatedPayload: DeepLinkPayload = {
    v: 1,
    id: obj.id.trim(),
    personName: obj.personName.trim(),
    personRef: typeof obj.personRef === 'string' ? obj.personRef.trim() : undefined,
    linkedInUrl: validatedLinkedInUrl,
    introContext: typeof obj.introContext === 'string' ? obj.introContext.trim() : undefined,
    status: validatedStatus,
    meetingDateTime: validatedMeetingDateTime,
    meetingUrl: validatedMeetingUrl,
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
