import React, { useState, useEffect } from 'react';

export default function ErrorAlert({ message, onDismiss, autoClose = 5000 }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {if (autoClose) {
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onDismiss]);

  if (!visible || !message) return null;

  return (
    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
      <div className="text-red-600 font-bold text-xl">!</div>
      <div className="flex-1">
        <p className="text-red-800 font-medium">{message}</p>
      </div>
      <button
        onClick={() => setVisible(false)}
        className="text-red-600 hover:text-red-800 font-bold"
      >
        ✕
      </button>
    </div>
  );
}