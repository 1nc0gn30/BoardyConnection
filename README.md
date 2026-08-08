# Connection Dashboard (v1 MVP)

A private, local-first web application for tracking personal introductions, meeting notes, and follow-up status updates.

---

## Overview & Core Philosophy

- **Local-First & Private:** No user accounts, login, database, or external tracking servers. 100% of your connection records live exclusively inside your browser's `localStorage`.
- **Deep Link Integration:** Designed to receive prefilled connection updates from external senders (such as Boardy) via URL-safe deep links (`/update?payload=...`).
- **Data Deduplication:** Opening a deep link with an existing connection ID updates the existing record rather than creating duplicate entries, preserving your personal notes and rating.
- **Export & Backup:** Full JSON backup export and restore capabilities allow you to move data between browsers seamlessly.

---

## Data-Loss Protection & Local Storage Notice

> **IMPORTANT NOTICE REGARDING DATA PERSISTENCE:**
>
> 1. **Records Live ONLY in This Browser:** All connection records, meeting notes, star ratings, and history logs are stored exclusively in your current browser's local storage (`localStorage`).
> 2. **Browser Clearing Risk:** Clearing your browser history, deleting site data/cookies, or using automated browser cleanup tools **will permanently delete your records**.
> 3. **No Automatic Sync:** Switching browsers (e.g. from Chrome to Safari) or changing devices will not automatically transfer your records.
> 4. **Backup Protection:** Use the built-in **Backup / Restore** feature to export `.json` backups regularly. The application includes a first-use data notice and persistent backup reminders when new records exist without a recent export.

---

## Deep Link Security & Encryption Disclaimer

> **SECURITY DISCLAIMER:**
>
> - **Base64 / URL Encoding is NOT Encryption:** Deep link payloads (`/update?payload=...`) use Base64 and URL parameter encoding for data transport. Anyone with access to the link URL can decode its contents.
> - **Private Field Protection:** Private user notes (`userNotes`) and star ratings (`rating`) are **strictly excluded** from deep links and are never encoded into outgoing URLs.
> - **Https Protocol Requirement:** External links (`linkedInUrl` and `meetingUrl`) within incoming payloads must start with `https://` to prevent script execution risks.

---

## Backup & Restore Workflow

### Exporting Backups:
Click **Backup / Restore** in the application header and select **Export .JSON Backup**. This generates a formatted file named `connection-dashboard-backup-YYYY-MM-DD.json`.

### Restoring / Importing Backups:
Before restoring data, select your preferred import strategy:

- **Merge Mode (Recommended):** Combines imported connections with your existing local records by ID. If an imported record already exists, its basic details are updated while preserving your private notes, star ratings, and custom status history.
- **Replace Mode (Wipe & Replace):** Completely wipes all existing local records and replaces them with the contents of the imported JSON file.

*Note: The application explicitly prompts and warns before processing imports. Data is never silently overwritten.*

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
  linkedInUrl?: string;     // Optional profile link (https:// only)
  introContext: string;     // Intro context/background
  status: ConnectionStatus; // Current status
  meetingDateTime?: string; // Meeting date & time (ISO 8601 or YYYY-MM-DDTHH:mm)
  meetingUrl?: string;      // Video call link (https:// only)
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

### Deep Link Hardening Rules:
1. **Size Limit:** Payloads exceeding 100 KB are rejected to protect against memory overload.
2. **Strict Version Check:** Rejects payloads where `v !== 1`.
3. **Protocol Sanitization:** Requires `https://` for external links (`linkedInUrl`, `meetingUrl`).
4. **Invalid Date Handling:** Invalid date strings are discarded to ensure date picker compatibility.
5. **Non-destructive Parsing:** If a deep link is invalid, existing stored connections remain untouched and a clear error notification is displayed.

