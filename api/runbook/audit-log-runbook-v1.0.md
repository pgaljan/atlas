# Audit Log Operations Runbook

> **Audience:** Console Administrators  
> **Scope:** CLI-only operations (not exposed in GUI or public API)

This runbook provides step-by-step instructions for managing audit logs in the system. It covers **retention adjustment**, **exporting audit logs**, and **understanding the audit log structure**, ensuring administrators can operate independently.

---

## Overview

Audit logs capture key actions performed on the platform to support **troubleshooting**, **root cause analysis**, and **compliance tracking**.

| Operation | Purpose |
|------------|---------|
| **Retention Adjustment** | Prevents the audit log table from growing indefinitely by deleting old records. |
| **Audit Log Export** | Provides CSV or JSON exports of logs for analysis and reporting. |
| **Schema Documentation** | Describes the structure and meaning of each field in the audit log table. |

---

## Prerequisites

Before performing any operations, ensure the following:

- You are running all commands from the `api/` directory of the monorepo.
- Required setup:
  - `Node.js` and `npm` installed
  - `ts-node` available (`npx ts-node` works without global install)
  - Database connectivity configured via `DATABASE_URL` in `.env`
- Scripts must be present in `api/package.json`:

```json
{
  "scripts": {
    "audit:export": "ts-node scripts/export-audit-log.ts",
    "audit:cleanup": "ts-node scripts/cleanup-audit-logs.ts"
  }
}
```

Exported files will be generated in the folder:

```bash
api/exports
```

---

## 1. Adjustment of Audit Log Retention

Retention prevents the audit log table from growing indefinitely by automatically deleting records older than a specified number of days.

### A. Dry Run (Preview)

Run a dry run to preview deletions without actually removing anything:

```bash
npm run audit:cleanup -- --retain-days=90 --dry-run=true
```

This shows the cutoff date and how many rows would be deleted.

### B. One-Time Cleanup

Permanently delete logs older than 90 days:

```bash
npm run audit:cleanup -- --retain-days=90
```

### C. Chunked Deletion for Large Tables

For very large datasets, delete logs in batches to reduce database locking:

```bash
npm run audit:cleanup -- --retain-days=365 --batch-size=1000
```

### D. Schedule Automated Cleanup

Automate daily cleanup using cron (Linux).

Example: Run every day at 2:15 AM

```cron
15 2 * * * cd /path/to/repo/api && npm run audit:cleanup -- --retain-days=90 >> /var/log/audit-cleanup.log 2>&1
```

### E. Verification

Output will display counts, e.g.,

```
Deleted 1234 audit log rows.
```

Optional: Export logs for a date range before and after cleanup to verify results.

**Safety Tip:** Always run a dry run first before running actual cleanup in production.

---

## 2. Audit Log Export

The export script allows you to extract logs for troubleshooting, compliance, or reporting.

### A. Choose Output Format

- `--format=json` → Pretty-printed, machine-readable JSON
- `--format=csv` → Spreadsheet-friendly format (details stored as JSON string)

### B. Export Logs for a Date Range

```bash
# Export logs between Sept 4 and Sept 5 (inclusive) as JSON
npm run audit:export -- --from=2025-09-04 --to=2025-09-05T23:59:59Z --format=json --out=./exports/audit.json
```

**Note:** The `--to` parameter is exclusive. Use `T23:59:59Z` to include the entire day.

### C. CSV Export Example

```bash
npm run audit:export -- --from=2025-09-04 --to=2025-09-05T23:59:59Z --format=csv --out=./exports/audit.csv
```

### D. Filter by User or Action

```bash
# Filter by user
npm run audit:export -- --userId=123e4567-e89b-12d3-a456-426614174000 --format=json --out=./exports/user-logs.json

# Filter by action
npm run audit:export -- --action=UPDATE --format=csv --out=./exports/update-logs.csv
```

### E. Quick Exports for Today & Yesterday

**Today (UTC):**

```bash
npm run audit:export -- --from=$(date -u +%F) --to=$(date -u +%F)T23:59:59Z --format=json --out=./exports/audit-today.json
```

**Yesterday (UTC):**

```bash
npm run audit:export -- --from=$(date -u -d "yesterday" +%F) --to=$(date -u -d "yesterday 23:59:59" +%FT%T)Z --format=csv --out=./exports/audit-yesterday.csv
```

### F. Output Directory

Exported files will be saved in `api/exports`.

The script automatically creates the folder if it does not exist.

---

## 3. Audit Log Structure Documentation

Each record in the audit log table follows this structure:

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier of the log entry. |
| action | string | Action performed (e.g., User Login, UPDATE). |
| element | string | Entity affected (e.g., User, Structure). |
| elementId | UUID | ID of the affected entity. |
| createdAt | ISO Date | Timestamp of when the action occurred (UTC). |
| userId | UUID | ID of the actor performing the action (nullable for system events). |
| username | string | Username of the actor. |
| email | string | Email address of the actor. |
| details | JSON | Metadata related to the action, formatted as JSON. |

### Example: User Login

```json
{
  "id": "789720e4-0014-451a-b765-118c37d929bd",
  "action": "User Login",
  "element": "User",
  "elementId": "123e4567-e89b-12d3-a456-426614174000",
  "createdAt": "2025-09-04T08:20:42.815Z",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "username": "John Doe",
  "email": "example@gmail.com",
  "details": {
    "email": "example@gmail.com"
  }
}
```

### Example: Structure Update

```json
{
  "id": "c722b007-1c3c-474b-99eb-404db0b964bb",
  "action": "UPDATE",
  "element": "Structure",
  "elementId": "37982444-c877-4639-889f-42bc8fc5341c",
  "createdAt": "2025-09-04T08:20:55.382Z",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "username": "John Doe",
  "email": "example@gmail.com",
  "details": {
    "elements": [],
    "imageUrl": "http://localhost:4001/api/public/sample.png"
  }
}
```

---

## 4. Operational Checklist

- Confirm current directory is `repo-root/api`.
- Verify database connectivity (`DATABASE_URL` in `.env`).

**For cleanup:**

- Run dry run first.
- Review cutoff date and row count.
- Execute real cleanup or schedule via cron.

**For export:**

- Choose correct output format (JSON or CSV).
- Verify date range (`--to` must include full end day).
- Apply filters like `--userId` or `--action` if needed.
- Confirm files saved to `api/exports`.

---

## 5. Troubleshooting

| Symptom | Possible Cause | Resolution |
|--------|----------------|------------|
| No audit logs found | Wrong date range or filter applied | Adjust filters and verify `--to` includes full day. |
| Cannot find module 'ts-node' | `ts-node` not installed | Run with `npx ts-node` or install: `npm i -D ts-node`. |
| Cannot find module './scripts/export-audit-log.ts' | File missing or misnamed | Verify script name matches `package.json`. |
| Permission denied error | Missing write permissions | Ensure `api/exports` directory is writable. |
| Cleanup hangs on large tables | Table locks | Use `--batch-size=1000` for batch cleanup. |

---

## 6. Security & Privacy

Audit logs may contain sensitive data such as email addresses.

Only trusted administrators should run these scripts.

Follow organization privacy policies when exporting or storing logs.

---

## Quick Commands Appendix

| Command | Description |
|--------|-------------|
| `npm run audit:cleanup -- --retain-days=90 --dry-run=true` | Preview cleanup of logs older than 90 days |
| `npm run audit:cleanup -- --retain-days=90` | Delete logs older than 90 days |
| `npm run audit:cleanup -- --retain-days=365 --batch-size=1000` | Cleanup logs older than a year in chunks |
| `npm run audit:export -- --from=$(date -u +%F) --to=$(date -u +%F)T23:59:59Z --format=json --out=./exports/today.json` | Export today's logs to JSON |
| `npm run audit:export -- --from=2025-09-04 --to=2025-09-05T23:59:59Z --format=csv --out=./exports/range.csv` | Export logs between two dates to CSV |

---

## Change History

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| v1.0 | 2025-09-06 | Admin Team | Initial version of audit log runbook |
