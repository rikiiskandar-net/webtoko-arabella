"use client";

import { useState, useCallback } from "react";

export function useNotification() {
  const [notification, setNotification] = useState(null);

  const notify = useCallback((message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const NotificationBar = notification ? (
    <div style={{
      position: "fixed", top: "1rem", right: "1rem", zIndex: 9999,
      padding: "0.75rem 1.25rem", borderRadius: "8px", fontWeight: 600,
      fontSize: "0.875rem", boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      background: notification.type === "success" ? "#10B981" : "#EF4444",
      color: "white", maxWidth: "400px",
    }}>
      {notification.message}
    </div>
  ) : null;

  return { notify, NotificationBar };
}
