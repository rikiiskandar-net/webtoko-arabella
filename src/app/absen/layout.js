import "../globals.css";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: "ABSENKU - Absen Online By Riki Iskandar",
  description: "ABSENKU - Aplikasi Absen Online Modern & Presensi Digital oleh Riki Iskandar",
  icons: {
    icon: [
      { url: "/absen-icon.svg", type: "image/svg+xml" }
    ],
    shortcut: "/absen-icon.svg",
    apple: "/absen-icon.svg",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#6366F1",
};

export default function WorkerLayout({ children }) {
  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: 'var(--background)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
    }}>
      {/* Mobile Wrapper */}
      <div style={{
        width: '100%',
        maxWidth: '480px', // Mobile phone width max
        minHeight: '100vh',
        backgroundColor: 'var(--background)',
        boxShadow: '0 0 40px rgba(0,0,0,0.03)',
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
