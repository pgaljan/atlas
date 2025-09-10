# 📊 Telemetry Metrics Runbook

> **Audience:** Console Administrators  
> **Scope:** CLI-only operations for telemetry metrics (system monitoring data)

This runbook provides step-by-step instructions for **exporting telemetry data**, **automatic retention cleanup**, and operational guidance for monitoring CPU, memory, disk, and network usage.

## Overview

Telemetry captures system-level metrics such as **CPU usage**, **memory usage**, **disk space**, and **network activity**.  
This data is stored in the database for **14 days**.

Operation | Purpose
--------- | -------
**Retention Cleanup** | Automatically deletes telemetry records older than 14 days.
**Telemetry Export** | Allows CSV/JSON export of metrics for troubleshooting or reporting.
**View Metrics** | View current or historical telemetry via API endpoints.

## Prerequisites

- Run all commands from the **`api/` directory** of the monorepo.
- Ensure database connectivity is configured (`DATABASE_URL` in `.env`).
- The following script must exist in `api/package.json`:

``` json
{
  "scripts": {
    "telemetry:metrics": "ts-node scripts/telemetry-metrics-script.ts"
  }
}
```

- Exported files will be saved under:

``` bash
api/export-telemetry-metrics
```

## 1. Automatic Retention Cleanup

Telemetry data older than **14 days** is automatically deleted by a scheduled cron job.

Schedule | Action
-------- | ------
**03:00 AM daily** | Deletes all telemetry rows older than 14 days

### Verify Cleanup Logs

Check application logs for cleanup results:

``` bash
# Example log output
Telemetry retention: deleted 125 old metric rows older than 2025-09-01T03:00:00Z
```

## 2. Manual Export of Telemetry Metrics

Export telemetry data for a specific date range in **JSON** or **CSV**.

### A. Export Current Snapshot (Latest Only)

``` bash
npm run telemetry:metrics -- --current
```

> Shows the most recent telemetry snapshot directly in the console.  
> No files are exported.

### B. Export for Today

``` bash
npm run telemetry:metrics
```

> Exports **today's metrics** in both JSON and CSV formats.

### C. Export Between Two Dates

``` bash
npm run telemetry:metrics -- --from=2025-09-05 --to=2025-09-06
```

- `--from` → Start date (inclusive)  
- `--to` → End date (inclusive, end of day automatically applied)

Example result:

```
export-telemetry-metrics/
├── metrics_2025-09-05T00-00-00Z_2025-09-06T23-59-59Z.json
├── metrics_2025-09-05T00-00-00Z_2025-09-06T23-59-59Z.csv
```

### D. Export in JSON Only

``` bash
npm run telemetry:metrics -- --from=2025-09-05 --to=2025-09-06 --format=json
```

### E. Export in CSV Only

``` bash
npm run telemetry:metrics -- --from=2025-09-05 --to=2025-09-06 --format=csv
```

## 3. API Endpoints for Monitoring

These endpoints allow quick access to current and historical telemetry data.

Endpoint | Method | Description
-------- | ------ | -----------
`/api/v1/telemetry/current` | GET | Returns the most recent metrics snapshot
`/api/v1/telemetry/history?from=2025-09-05&to=2025-09-06` | GET | Returns all telemetry metrics between two dates
`/api/v1/telemetry/average?days=14` | GET | Returns **average metrics** (CPU %, memory GiB, disk GiB, I/O KiB, network KiB)

### Example curl requests:

``` bash
# Get historical data
curl "http://localhost:4001/api/v1/telemetry/history?from=2025-09-05&to=2025-09-06"

# Get current snapshot
curl "http://localhost:4001/api/v1/telemetry/current"

# Get average utilization (14 days)
curl "http://localhost:4001/api/v1/telemetry/average"

# Get average utilization (last 7 days)
curl "http://localhost:4001/api/v1/telemetry/average?days=7"
```

## 4. Exported Data Structure

Each row in the export contains a snapshot of system metrics.

Field | Description
----- | -----------
`timestamp` | When the snapshot was recorded (ISO date)
`cpu_util_pct` | CPU utilization percentage
`mem_used_gib` | Memory used (GiB)
`mem_total_gib` | Total memory (GiB)
`disk_used_gib` | Disk space used (GiB)
`disk_total_gib` | Total disk space (GiB)
`net_rx_kib` | Network data received (KiB)
`net_tx_kib` | Network data transmitted (KiB)
`disk_read_kib` | Disk read I/O (KiB)
`disk_write_kib` | Disk write I/O (KiB)

## 5. Operational Checklist

**Before running exports:**

- Confirm current directory is `repo-root/api`.
- Verify `.env` file contains correct database URL.
- Ensure no other process is running retention cleanup at the same time.

**After running exports:**

- Verify output folder `api/export-telemetry-metrics` contains JSON and/or CSV files.
- Confirm exported data matches the date range provided.

## 6. Quick Commands Reference

Command | Purpose
------- | -------
`npm run telemetry:metrics -- --current` | View the most recent telemetry snapshot in console
`npm run telemetry:metrics` | Export today's telemetry data in both JSON and CSV
`npm run telemetry:metrics -- --from=2025-09-05 --to=2025-09-06` | Export metrics between two dates
`npm run telemetry:metrics -- --from=2025-09-05 --to=2025-09-06 --format=json` | Export metrics as JSON only
`npm run telemetry:metrics -- --from=2025-09-05 --to=2025-09-06 --format=csv` | Export metrics as CSV only

## 7. Troubleshooting

Symptom | Possible Cause | Resolution
------- | --------------- | ----------
Exported file is empty | No metrics in given date range | Verify `--from` and `--to` values
Cron cleanup not working | App not running at 03:00 AM | Ensure app is running during scheduled cleanup
`DATABASE_URL` error | Missing or incorrect database configuration | Check `.env` file and correct value
Script not found | `package.json` missing script | Add `telemetry:metrics` script to `api/package.json`

## Change History

Version | Date | Author | Notes
------- | ---- | ------ | -----
v1.0 | 2025-09-10 | Admin Team | initial version of telemetry runbook
