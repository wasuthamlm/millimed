# Supabase → local Postgres backup/sync

`npm run db:backup` runs `scripts/backup-sync.ts`, which dumps the Supabase
database (`BACKUP_SOURCE_URL`) with `pg_dump` and restores it into the local
Postgres instance (`BACKUP_TARGET_URL`) with `pg_restore`. This is one-way
(Supabase → local) and is only for keeping a local copy for testing/backup —
the app itself always reads/writes Supabase directly via `DATABASE_URL`.

## Prerequisites (Windows)

- PostgreSQL client tools (`pg_dump`, `pg_restore`) installed and on `PATH`.
  Install via the official PostgreSQL installer (https://www.postgresql.org/download/windows/)
  or a package manager (e.g. `scoop install postgresql`).
- The client tools' major version should be >= the Supabase project's Postgres
  version (check the Supabase dashboard, Database settings). Run
  `pg_dump --version` to confirm. A too-old client can silently fail or
  truncate the dump.
- Conversely, if the client tools are *newer* than the local target server,
  `pg_restore` can emit warnings like
  `unrecognized configuration parameter "transaction_timeout"` (a GUC added
  in Postgres 17) and exit with a non-zero status even though all data
  restored successfully — confirmed while building this script (client 18.4
  against a local Postgres 16.14 server: dump/restore completed and all rows
  landed, restore just printed one ignorable warning). `scripts/backup-sync.ts`
  treats `pg_restore`'s exit code as non-fatal for exactly this reason; if you
  want to be sure, spot-check a row count on the target after running it.
- `BACKUP_SOURCE_URL` and `BACKUP_TARGET_URL` set in `.env` (see `.env.example`).
  These are separate from the app's `DATABASE_URL`/`DIRECT_URL` on purpose —
  the app should never read the local database.

## Running

```
npm run db:backup
```

Dump files are written to `backups/` (gitignored) with a timestamped filename.

## Scheduling

Not wired up automatically. To run it on a schedule on Windows, create a
Task Scheduler task that runs `npm run db:backup` from the repository
directory (Task Scheduler → Create Task → Action: Start a program →
Program: `npm`, Arguments: `run db:backup`, Start in: the repo path).
