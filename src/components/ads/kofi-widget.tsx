'use client';

import dynamic from 'next/dynamic';
import type { ComponentProps } from 'react';

// Dynamically import react-kofi-overlay with SSR disabled
const Donate = dynamic(
  () => import('react-kofi-overlay').then((mod) => mod.Donate),
  { ssr: false }
);

interface KofiWidgetProps {
  children: React.ReactNode;
  variant?: 'default' | 'subtle';
}

export function KofiWidget({ children, variant = 'default' }: KofiWidgetProps) {
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

  return (
    <Donate username="askpurin" styles={styles}>
      {children}
    </Donate>
  );
}
