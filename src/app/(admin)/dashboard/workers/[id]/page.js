"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Wallet } from "lucide-react";
import styles from "../Workers.module.css";

const formatRp = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

export default function WorkerAttendancePage() {
  const params = useParams();
  const router = useRouter();
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params?.id) {
      fetchWorkerData();
    }
  }, [params]);

  const fetchWorkerData = async () => {
    try {
      // In a real app we'd have a specific endpoint for this, 
      // but for simplicity we can fetch all workers and filter
      const res = await fetch("/api/admin/workers");
      const workers = await res.json();
      const w = workers.find(x => x.id === params.id);
      
      if (w) {
        // Fetch their attendance (we can use a dedicated API, but let's mock the UI first or build the API next)
        setWorker(w);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center' }}><Loader2 className={styles.spinner} size={40} /></div>;
  }

  if (!worker) {
    return <div>Pekerja tidak ditemukan</div>;
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className={styles.title}>Laporan Kehadiran</h2>
            <div style={{ color: 'var(--text-muted)' }}>Pekerja: {worker.name}</div>
          </div>
        </div>
      </div>

      <div className={styles.tableContainer} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Fitur rekapitulasi gaji bulanan pekerja sedang dalam tahap pengembangan.
        <br/><br/>
        Data absensi {worker.name} sudah tersimpan aman di database.
      </div>
    </div>
  );
}
