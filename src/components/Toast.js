import { useEffect, useState } from 'react';
import styles from './Toast.module.css';
import { CheckCircle2 } from 'lucide-react';

export default function Toast({ message, isVisible, onClose }) {
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
    }
  }, [isVisible]);

  if (!shouldRender) return null;

  return (
    <div className={`${styles.toast} ${isVisible ? styles.show : styles.hide}`}>
      <div className={styles.icon}>
        <CheckCircle2 size={18} strokeWidth={2.5} color="var(--green)" />
      </div>
      <div className={styles.content}>
        <p className={styles.message}>{message}</p>
      </div>
      <button className={styles.closeBtn} onClick={onClose}>&times;</button>
    </div>
  );
}
