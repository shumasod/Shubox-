import React, { useEffect, useRef, useState } from 'react';

interface Props {
  message:   string;
  politeness?: 'polite' | 'assertive';
  clearAfter?: number;
}

export const LiveRegion: React.FC<Props> = ({
  message,
  politeness = 'polite',
  clearAfter  = 3000,
}) => {
  const [announced, setAnnounced] = useState('');
  const timer                     = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!message) return;

    // Briefly clear then re-set so screen readers always announce a new message
    setAnnounced('');
    const set = setTimeout(() => {
      setAnnounced(message);
      if (clearAfter > 0) {
        timer.current = setTimeout(() => setAnnounced(''), clearAfter);
      }
    }, 50);

    return () => {
      clearTimeout(set);
      clearTimeout(timer.current);
    };
  }, [message, clearAfter]);

  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {announced}
    </div>
  );
};

// Hook-based usage for imperative announcements
export const useAnnounce = () => {
  const [message, setMessage] = useState('');
  const announce = (msg: string) => setMessage(msg);
  return { message, announce };
};
