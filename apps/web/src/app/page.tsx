'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    textAlign: 'center' as const,
  },
  header: {
    position: 'absolute' as const,
    top: '20px',
    right: '20px',
  },
  hero: {
    maxWidth: '700px',
    background: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '24px',
    padding: '40px',
    boxShadow: '0 24px 60px rgba(0, 0, 0, 0.08)',
  },
  title: {
    fontSize: '3rem',
    marginBottom: '16px',
    color: '#111827',
  },
  description: {
    marginBottom: '28px',
    color: '#4b5563',
    lineHeight: '1.7',
  },
  actions: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    justifyContent: 'center',
    gap: '12px',
  },
  buttonPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '180px',
    padding: '14px 24px',
    borderRadius: '9999px',
    background: '#2563eb',
    color: 'white',
    textDecoration: 'none',
    fontWeight: 600,
  },
  buttonSecondary: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '180px',
    padding: '14px 24px',
    borderRadius: '9999px',
    background: '#e5e7eb',
    color: '#111827',
    textDecoration: 'none',
    fontWeight: 600,
  },
};

export default function HomePage() {
  const { t } = useTranslation('common');
  const { t: tBazi } = useTranslation('bazi');
  const { t: tDashboard } = useTranslation('dashboard');

  return (
    <main style={styles.page}>
      <div style={styles.header}>
        <LanguageSwitcher />
      </div>
      <section style={styles.hero}>
        <h1 style={styles.title}>{t('welcome')}</h1>
        <p style={styles.description}>
          {tDashboard('start_your_first')}
        </p>
        <div style={styles.actions}>
          <Link href="/bazi" style={styles.buttonPrimary}>
            {tBazi('start_calculation')}
          </Link>
          <Link href="/dashboard" style={styles.buttonSecondary}>
            {t('profile')}
          </Link>
        </div>
      </section>
    </main>
  );
}
