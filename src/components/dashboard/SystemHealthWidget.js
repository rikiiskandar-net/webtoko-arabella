import prisma from "@/lib/prisma";
import styles from "./SystemHealthWidget.module.css";
import { Activity, Database, HardDrive, Wifi, WifiOff } from "lucide-react";

export default async function SystemHealthWidget() {
  // Supabase Free Tier Limits
  const DB_LIMIT_MB = 500;
  const STORAGE_LIMIT_MB = 1024; // 1 GB

  let latency = 0;
  let dbSizeMB = 0;
  let storageSizeMB = 0;
  let isConnected = false;
  let connectionError = null;
  let storageError = null;

  try {
    // 1. Connection Ping & Latency
    const start = Date.now();
    await prisma.$queryRawUnsafe('SELECT 1');
    latency = Date.now() - start;
    isConnected = true;

    // 2. Database Size
    const dbSizeResult = await prisma.$queryRawUnsafe(`
      SELECT pg_database_size(current_database()) as size_bytes;
    `);
    const dbSizeBytes = Number(dbSizeResult[0].size_bytes);
    dbSizeMB = dbSizeBytes / 1024 / 1024;

    // 3. Storage Size (Supabase specific)
    try {
      const storageResult = await prisma.$queryRawUnsafe(`
        SELECT sum(metadata->>'size')::bigint as total_bytes FROM storage.objects;
      `);
      const storageBytes = Number(storageResult[0].total_bytes || 0);
      storageSizeMB = storageBytes / 1024 / 1024;
    } catch (err) {
      // Postgres user might not have access to storage schema in some setups
      storageError = "Error: " + err.message;
    }

  } catch (err) {
    isConnected = false;
    connectionError = err.message;
  }

  // Calculate percentages
  const dbPercent = Math.min(100, Math.round((dbSizeMB / DB_LIMIT_MB) * 100));
  const storagePercent = Math.min(100, Math.round((storageSizeMB / STORAGE_LIMIT_MB) * 100));

  // Determine status colors
  const getStatusClass = (percent) => {
    if (percent > 85) return styles.danger;
    if (percent > 70) return styles.warning;
    return styles.success;
  };

  const getStatusText = (percent) => {
    if (percent > 85) return "Kritis";
    if (percent > 70) return "Peringatan";
    return "Aman";
  };

  return (
    <div className={styles.widgetContainer}>
      <div className={styles.widgetHeader}>
        <h3 className={styles.widgetTitle}>
          <Activity size={20} className={styles.titleIcon} />
          Kesehatan Server & Supabase
        </h3>
        <div className={`${styles.statusBadge} ${isConnected ? styles.badgeSuccess : styles.badgeDanger}`}>
          <span className={styles.pulseIndicator}></span>
          {isConnected ? `Online (${latency}ms)` : "Terputus"}
        </div>
      </div>

      <div className={styles.metricsGrid}>
        
        {/* Database Metric */}
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <div className={styles.metricTitleGroup}>
              <Database size={18} className={styles.metricIcon} />
              <span className={styles.metricTitle}>PostgreSQL Database</span>
            </div>
            <span className={`${styles.metricStatusText} ${getStatusClass(dbPercent)}`}>
              {isConnected ? getStatusText(dbPercent) : "-"}
            </span>
          </div>
          
          <div className={styles.metricBody}>
            <div className={styles.metricNumbers}>
              <span className={styles.metricCurrent}>{dbSizeMB.toFixed(2)} MB</span>
              <span className={styles.metricDivider}>/</span>
              <span className={styles.metricLimit}>{DB_LIMIT_MB} MB</span>
            </div>
            
            <div className={styles.progressBarContainer}>
              <div 
                className={`${styles.progressBarFill} ${getStatusClass(dbPercent)}`}
                style={{ width: `${dbPercent}%` }}
              ></div>
            </div>
            <div className={styles.metricFooter}>
              <span>{dbPercent}% Terpakai</span>
              <span>Batas Free Tier</span>
            </div>
          </div>
        </div>

        {/* Storage Metric */}
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <div className={styles.metricTitleGroup}>
              <HardDrive size={18} className={styles.metricIcon} />
              <span className={styles.metricTitle}>Penyimpanan File (Storage)</span>
            </div>
            {!storageError && (
              <span className={`${styles.metricStatusText} ${getStatusClass(storagePercent)}`}>
                {isConnected ? getStatusText(storagePercent) : "-"}
              </span>
            )}
          </div>
          
          <div className={styles.metricBody}>
            {storageError ? (
              <div className={styles.errorBox}>{storageError}</div>
            ) : (
              <>
                <div className={styles.metricNumbers}>
                  <span className={styles.metricCurrent}>{storageSizeMB.toFixed(2)} MB</span>
                  <span className={styles.metricDivider}>/</span>
                  <span className={styles.metricLimit}>{STORAGE_LIMIT_MB} MB (1 GB)</span>
                </div>
                
                <div className={styles.progressBarContainer}>
                  <div 
                    className={`${styles.progressBarFill} ${getStatusClass(storagePercent)}`}
                    style={{ width: `${storagePercent}%` }}
                  ></div>
                </div>
                <div className={styles.metricFooter}>
                  <span>{storagePercent}% Terpakai</span>
                  <span>Batas Free Tier</span>
                </div>
              </>
            )}
          </div>
        </div>

      </div>

      {!isConnected && (
        <div className={styles.connectionError}>
          <WifiOff size={16} />
          <span>Gagal terhubung ke Supabase: {connectionError}</span>
        </div>
      )}
    </div>
  );
}
