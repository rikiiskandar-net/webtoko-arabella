import { Landmark, Banknote } from "lucide-react";

export function BCAIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="6" fill="#0066AE" />
      <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="14" fontWeight="900" fontFamily="Arial, sans-serif" fontStyle="italic">BCA</text>
    </svg>
  );
}

export function MandiriIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="6" fill="#0A3967" />
      <path d="M12 28V12h4v16h-4zm6 0V12h3.5l4 9V12h4v16h-3.5l-4-9v9H18z" fill="#F2A900" />
    </svg>
  );
}

export function BIIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="6" fill="#006567" />
      <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#F15A24" fontSize="14" fontWeight="900" fontFamily="Arial, sans-serif">BNI</text>
    </svg>
  );
}

export function BRIIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="6" fill="#00529C" />
      <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="14" fontWeight="900" fontFamily="Arial, sans-serif">BRI</text>
    </svg>
  );
}

export function GoPayIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="6" fill="#00A5CF" />
      <circle cx="20" cy="20" r="10" fill="white" />
      <path d="M14 22c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="#00A5CF" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="20" cy="22" r="2.5" fill="#00A5CF" />
    </svg>
  );
}

export function OVOIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="6" fill="#4C3494" />
      <circle cx="20" cy="20" r="12" fill="white" />
      <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#4C3494" fontSize="11" fontWeight="900" fontFamily="Arial, sans-serif">OVO</text>
    </svg>
  );
}

export function DanaIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="6" fill="#118EEA" />
      <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="11" fontWeight="900" fontFamily="Arial, sans-serif">DANA</text>
    </svg>
  );
}

export function QRISIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="6" fill="#ED2128" />
      <path d="M20 0h20v40H20z" fill="#00529C" />
      <rect x="10" y="10" width="8" height="8" rx="1" fill="white" />
      <rect x="22" y="10" width="8" height="8" rx="1" fill="white" />
      <rect x="10" y="22" width="8" height="8" rx="1" fill="white" />
      <rect x="22" y="22" width="8" height="8" rx="1" fill="white" />
      <rect x="13" y="13" width="2" height="2" fill="#ED2128" />
      <rect x="25" y="13" width="2" height="2" fill="#00529C" />
      <rect x="13" y="25" width="2" height="2" fill="#ED2128" />
      <rect x="25" y="25" width="2" height="2" fill="#00529C" />
    </svg>
  );
}

export function BankTransferIcon({ size = 20 }) {
  return <Landmark size={size} color="var(--primary)" />;
}

export function CashIcon({ size = 20 }) {
  return <Banknote size={size} color="#27AE60" />;
}
