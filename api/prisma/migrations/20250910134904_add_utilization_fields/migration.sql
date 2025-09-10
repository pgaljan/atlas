-- CreateTable
CREATE TABLE "public"."Metric" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cpu_util_pct" DOUBLE PRECISION,
    "mem_used_gib" DOUBLE PRECISION,
    "mem_total_gib" DOUBLE PRECISION,
    "mem_util_pct" DOUBLE PRECISION,
    "disk_used_gib" DOUBLE PRECISION,
    "disk_total_gib" DOUBLE PRECISION,
    "disk_util_pct" DOUBLE PRECISION,
    "net_rx_kib" DECIMAL(65,30),
    "net_tx_kib" DECIMAL(65,30),
    "disk_read_kib" DECIMAL(65,30),
    "disk_write_kib" DECIMAL(65,30),

    CONSTRAINT "Metric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Metric_timestamp_idx" ON "public"."Metric"("timestamp");
