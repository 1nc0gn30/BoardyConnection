import { describe, expect, it } from 'vitest';
import {
  createSamplePayload,
  decodePayload,
  encodePayload,
  generateDeepLinkUrl,
} from '../deepLinkParser';

describe('deepLinkParser', () => {
  it('should correctly encode and decode a valid payload v:1', () => {
    const payload = createSamplePayload('conn_test_99');
    const encoded = encodePayload(payload);
    expect(encoded).toBeTypeOf('string');
    expect(encoded.length).toBeGreaterThan(0);

    const result = decodePayload(encoded);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.v).toBe(1);
      expect(result.data.id).toBe('conn_test_99');
      expect(result.data.personName).toBe('Alex Rivera');
      expect(result.data.linkedInUrl).toBe('https://www.linkedin.com/in/alexrivera-tech');
    }
  });

  it('should support decoding URI encoded raw JSON strings', () => {
    const rawJson = JSON.stringify({
      v: 1,
      id: 'conn_raw_123',
      personName: 'Jordan Smith',
      status: 'scheduled',
    });
    const encodedUri = encodeURIComponent(rawJson);

    const result = decodePayload(encodedUri);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe('conn_raw_123');
      expect(result.data.personName).toBe('Jordan Smith');
    }
  });

  it('should reject malformed or non-v1 payloads cleanly without throwing', () => {
    // Unsupported version v:2
    const badVersionJson = JSON.stringify({ v: 2, id: '123', personName: 'Test' });
    const encodedBad = encodeURIComponent(badVersionJson);
    const resultVersion = decodePayload(encodedBad);
    expect(resultVersion.success).toBe(false);
    if (resultVersion.success === false) {
      expect(resultVersion.error).toContain('Unsupported payload version');
    }

    // Missing required field "personName"
    const missingNameJson = JSON.stringify({ v: 1, id: '123' });
    const resultMissing = decodePayload(encodeURIComponent(missingNameJson));
    expect(resultMissing.success).toBe(false);

    // Completely garbage string
    const resultGarbage = decodePayload('!!!NotBase64AndNotJSON!!!');
    expect(resultGarbage.success).toBe(false);
  });

  it('should generate a valid deep link URL', () => {
    const payload = createSamplePayload('conn_url_1');
    const url = generateDeepLinkUrl(payload, 'https://app.example.com');
    expect(url).toContain('https://app.example.com/update?payload=');
  });
});
