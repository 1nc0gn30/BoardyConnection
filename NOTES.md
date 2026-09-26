# Handoff — 13 Aug 2026

Pick up here. Latest work is on `main` (`78403ec`), already pushed to `origin/main`.

## What this app is

Boardy Connection is a **local-first** desk for intros Boardy sends. People, notes, and stars live in this browser’s `localStorage`. No account is required.

## What’s done

**UI**
- Boardy mark/hero, kraft + navy palette, quieter header (Add + More).
- Empty desk: Intro → Meet → Note, then sample intro / examples / add someone.
- Cards are name + status + one intro line. Status labels: New intro, Talking, Meeting set, Met, Connected, Didn’t connect, New time.

**Deep links**
- `/update?payload=…` **saves automatically** in this browser (same `id` updates, no duplicate).
- Banner says “Saved to this browser” / “Updated” with Open.
- Notes and ratings are never in the link.

**Backup / import**
- More → Backup: export JSON, import file, or paste JSON.
- Schema + example: expand **JSON shape this app accepts**, or open `/backup-schema.json`.
- Required per person: `id`, `personName`. Merge keeps existing notes/stars.

**Optional cloud (not required locally)**
- Netlify Identity signup/signin + function + Netlify Blobs.
- Same JSON as the file. Explicit **Save to cloud** / **Restore from cloud** only.
- Identity widget does **not** auto-open on localhost.

## How to run

```bash
npm install
npm run dev          # http://localhost:3000/
npm test
```

Cloud locally needs `netlify dev` **and** a site with Identity enabled. Plain `npm run dev` is enough for everything else.

## Turn on cloud later

1. Deploy this repo to Netlify (`netlify.toml` is ready: build `npm run build`, publish `dist`).
2. Site settings → **Identity** → enable, open signup.
3. Confirm `/.netlify/functions/backup` is live.
4. Sign in from More or Backup, then save/restore.

Function: `netlify/functions/backup.ts`  
Client: `src/lib/identity.ts`, `src/lib/cloudBackup.ts`  
Store name: `boardy-backups` (one blob per Identity user id).

## Files that matter

| Area | Path |
|---|---|
| Desk / auto-save | `src/App.tsx` |
| Backup UI | `src/components/BackupRestoreModal.tsx` |
| Schema + parse | `src/lib/backupSchema.ts`, `public/backup-schema.json` |
| Local storage | `src/lib/storage.ts`, `src/lib/connectionService.ts` |
| Deep links | `src/lib/deepLinkParser.ts` |
| Brand mark | `src/components/BoardyMark.tsx`, `public/boardy-*.jpg` |

## Known caveats

- Local-first warning is still true: clearing site data wipes the desk unless they exported or saved to cloud.
- Identity on localhost will ask for the Netlify site URL if you click Sign in. That’s expected.
- `boardy-logo.png` is a large original (~1.3MB). UI uses the smaller mark/hero/favicon set.
- Do not add auto-sync on every edit unless you decide that’s worth the extra moving parts.

## Sensible next steps

- Deploy to Netlify and smoke-test Identity + cloud save/restore.
- If the first-use backup banner still feels loud after you’ve used the desk, shrink or delay it.
- Detail / form modals still have some older slate styling vs the new desk. Visual-only if you want them to match.
- Optional: document the deep-link payload next to the backup schema for Boardy senders.

## Don’t redo

Local save, merge-by-id, deep-link auto-save, and “cloud is opt-in” are intentional. Keep those unless the product decision changes.
