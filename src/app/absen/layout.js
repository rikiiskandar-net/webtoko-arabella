import "../globals.css";

export const metadata = {
  title: "Absensi Proyek",
  description: "Portal Kehadiran Khusus Karyawan Proyek",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2563EB",
};

export default function WorkerLayout({ children }) {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f1f5f9', // A soft gray background for the overall page (visible on desktop)
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
    }}>
      {/* Mobile Wrapper */}
      <div style={{
        width: '100%',
        maxWidth: '480px', // Mobile phone width max
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        boxShadow: '0 0 40px rgba(0,0,0,0.05)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden'
      }}>
        {children}
      </div>
    </div>
  );
}
