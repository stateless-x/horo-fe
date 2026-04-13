'use client';

import { useState, useEffect } from 'react';

const KOFI_URL = 'https://ko-fi.com/askpurin';

interface KofiWidgetProps {
  children: React.ReactNode;
  variant?: 'default' | 'subtle';
}

export function KofiWidget({ children, variant = 'default' }: KofiWidgetProps) {
  const [Donate, setDonate] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    import('react-kofi-overlay').then((mod) => {
      setDonate(() => mod.Donate);
    });
  }, []);

  const styles = variant === 'subtle'
    ? {
        donateBtn: {
          background: 'rgba(124, 58, 237, 0.2)',
          color: '#c4b5fd',
          border: '1px solid rgba(124, 58, 237, 0.3)',
          borderRadius: '12px',
          padding: '8px 20px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        },
        panel: {
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        },
      }
    : {
        donateBtn: {
          background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
          color: '#f8f8ff',
          border: 'none',
          borderRadius: '12px',
          padding: '12px 24px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)',
          transition: 'all 0.2s ease',
        },
        panel: {
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        },
      };

  // Fallback to simple link while loading
  if (!Donate) {
    return (
      <a
        href={KOFI_URL}
        target="_blank"
        rel="noopener noreferrer"
        style={styles.donateBtn as React.CSSProperties}
      >
        {children}
      </a>
    );
  }

  return (
    <Donate username="askpurin" styles={styles}>
      {children}
    </Donate>
  );
}
