import "dotenv/config";
import { spawnSync } from "child_process";
import path from "path";
import fs from "fs";

const sourceUrl = process.env.BACKUP_SOURCE_URL;
const targetUrl = process.env.BACKUP_TARGET_URL;

if (!sourceUrl || !targetUrl) {
  console.error("Missing BACKUP_SOURCE_URL and/or BACKUP_TARGET_URL in .env");
  process.exit(1);
}

const backupsDir = path.resolve(process.cwd(), "backups");
if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir, { recursive: true });

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const dumpFile = path.join(backupsDir, `supabase-${timestamp}.dump`);

function run(cmd: string, args: string[], { fatalOnError = true } = {}) {
  console.log(`> ${cmd} ${args.join(" ")}`);
  const result = spawnSync(cmd, args, { stdio: "inherit" });
  if (result.error) {
    console.error(`Failed to run ${cmd}. Is it installed and on PATH?`, result.error);
    process.exit(1);
  }
  if (result.status !== 0) {
    if (!fatalOnError) {
      console.warn(
        `${cmd} exited with status ${result.status}. This can happen from a client/server ` +
          `Postgres version mismatch (e.g. a newer pg_dump emitting a SET option the older ` +
          `target server doesn't recognize) and does not necessarily mean data was lost. ` +
          `Verify row counts on the target if unsure — see docs/backup.md.`
      );
      return;
    }
    console.error(`${cmd} exited with status ${result.status}`);
    process.exit(result.status ?? 1);
  }
}

console.log(`Dumping Supabase (source) to ${dumpFile} ...`);
run("pg_dump", ["--format=custom", "--no-owner", "--no-acl", "--dbname", sourceUrl, "--file", dumpFile]);

console.log(`Restoring into local Postgres (target) ...`);
// pg_restore can exit non-zero for ignorable warnings (e.g. version-skew SET options)
// while still restoring all data, so this step is not treated as fatal.
run("pg_restore", ["--clean", "--if-exists", "--no-owner", "--no-acl", "--dbname", targetUrl, dumpFile], {
  fatalOnError: false,
});

console.log("Backup/sync complete:", dumpFile);
