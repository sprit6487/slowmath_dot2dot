import { useEffect, useState } from 'react';

export default function Toast({ message, onDone }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) return;
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      if (onDone) onDone();
    }, 2000);
    return () => clearTimeout(timer);
  }, [message, onDone]);

  return (
    <div className={`toast${visible ? ' show' : ''}`}>
      {message}
    </div>
  );
}
