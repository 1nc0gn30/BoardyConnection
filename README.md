# Connection Dashboard (v1 MVP)

A private, local-first web application for tracking personal introductions, meeting notes, and follow-up status updates.

---

## Overview & Core Philosophy

- **Local-First & Private:** No user accounts, login, database, or external tracking servers. 100% of your connection records live exclusively inside your browser's `localStorage`.
- **Deep Link Integration:** Designed to receive prefilled connection updates from external senders (such as Boardy) via URL-safe deep links (`/update?payload=...`).
- **Data Deduplication:** Opening a deep link with an existing connection ID updates the existing record rather than creating duplicate entries, preserving your personal notes and rating.
- **Export & Backup:** Full JSON backup export and restore capabilities allow you to move data between browsers seamlessly.

---

## Quick Start & Local Development

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation & Running Locally
```bash
# Install dependencies
npm install

# Start local dev server (default port 3000)
npm run dev
```

### Running Unit Tests
```bash
# Run unit tests with Vitest (covers parser, storage, and service logic)
npm test
```

### Building for Production
```bash
# Typecheck and build static asset bundle into dist/
npm run build
```

---

## Deployment to Netlify

This project is built as a standard React SPA using Vite, making it ready for instant single-click deployment to Netlify or similar static web hosts.

### Netlify Deployment Steps:

1. **Build Command:** `npm run build`
2. **Publish Directory:** `dist`
3. **SPA Redirect Rule:** For deep-link subpaths (e.g. `/update?payload=...`), ensure a `public/_redirects` file exists with:
   ```
   /*  /index.html  200
   ```

---

## Data Model Specification

Each connection record in `localStorage` adheres to the following TypeScript interface:

```typescript
export type ConnectionStatus =
  | 'not_started'
  | 'ongoing'
  | 'scheduled'
  | 'met'
  | 'connected'
  | 'did_not_connect'
  | 'reschedule';

export interface StatusHistoryItem {
  id: string;
  status: ConnectionStatus;
  timestamp: string; // ISO 8601
  source: 'deep_link' | 'user_action' | 'import';
  note?: string;
}

export interface ConnectionRecord {
  id: string;               // Stable unique identifier
  personName: string;       // Full name of person
  personRef?: string;       // Optional opaque reference ID (e.g. boardy_ref_123)
  linkedInUrl?: string;     // Optional profile link
  introContext: string;     // Intro context/background
  status: ConnectionStatus; // Current status
  meetingDateTime?: string; // Meeting date & time (ISO 8601 or YYYY-MM-DDTHH:mm)
  meetingUrl?: string;      // Video call link
  createdAt: string;        // ISO 8601 timestamp
  updatedAt: string;        // ISO 8601 timestamp
  userNotes: string;        // Private personal notes & reflection
  rating?: number;          // 1 to 5 star rating
  needsUpdate?: boolean;    // Flag marking prominent review callout
  statusHistory: StatusHistoryItem[]; // Audit trail of status transitions
}
```

---

## Deep Link Payload Specification

Deep links deliver connection payloads encoded as URL-safe Base64 strings or raw URL-encoded JSON under the `payload` query parameter:

`https://your-domain.com/update?payload=<URL_SAFE_BASE64_JSON>`

### Payload Schema (`v: 1`)
```json
{
  "v": 1,
  "id": "conn_boardy_9821",
  "personName": "Alex Rivera",
  "personRef": "boardy_p_987",
  "linkedInUrl": "https://www.linkedin.com/in/alexrivera-tech",
  "introContext": "Introduced by Boardy AI to discuss cross-functional product partnership.",
  "status": "scheduled",
  "meetingDateTime": "2026-08-10T15:00",
  "meetingUrl": "https://meet.google.com/abc-defg-hij"
}
```

### Deep Link Safety Rules:
- If a payload is malformed or invalid version (`v !== 1`), the app displays a clear error without altering existing stored data.
- User personal notes and star ratings are never included in deep link URLs to preserve privacy.
- Isolated parser located in `src/lib/deepLinkParser.ts`.

---

## V1 Limitations

1. **Single Browser Storage:** Data is stored locally per browser instance. Clearing browser cache or site data will remove records unless backed up via JSON export.
2. **No Multi-User Sync:** V1 does not sync across devices or offer multi-user network graph sharing by design.
3. **No External Server:** No backend API is required or contacted.
