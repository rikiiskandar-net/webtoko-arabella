import { useEffect, useState } from 'react';
import styles from './Toast.module.css';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function Toast({ message, isVisible, type = "success", onClose }) {
  const [shouldRender, setShouldRender] = useState(isVisible);
  const [prevIsVisible, setPrevIsVisible] = useState(isVisible);

  if (isVisible !== prevIsVisible) {
    setPrevIsVisible(isVisible);
    if (isVisible) {
      setShouldRender(true);
    }
  }

  useEffect(() => {
    if (!isVisible) {
      const timer = setTimeout(() => setShouldRender(false), 300); // Wait for exit animation
      return () => clearTimeout(timer);
    } else {
      setShouldRender(true);
    }
  }, [isVisible]);

  if (!shouldRender) return null;

  const isError = type === "error";

  return (
    <div className={`${styles.toast} ${isVisible ? styles.show : styles.hide} ${isError ? styles.error : ""}`} style={isError ? { borderLeft: '4px solid var(--red)' } : {}}>
      <div className={styles.icon}>
        {isError ? (
          <XCircle size={18} strokeWidth={2.5} color="var(--red)" />
        ) : (
          <CheckCircle2 size={18} strokeWidth={2.5} color="var(--green)" />
        )}
      </div>
      <div className={styles.content}>
        <p className={styles.message} style={isError ? { color: 'var(--red)' } : {}}>{message}</p>
      </div>
      <button className={styles.closeBtn} onClick={onClose}>&times;</button>
    </div>
  );
}
