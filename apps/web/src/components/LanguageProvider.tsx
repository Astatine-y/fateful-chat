'use client';

import { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  'zh-CN': {
    common: {
      title: '宿命',
      subtitle: 'AI决策导航系统',
    },
    bazi: {
      title: '八字命理',
      select: '选择',
      year: '年',
      month: '月',
      day: '日',
      hour: '时',
      gender: '性别',
      male: '男',
      female: '女',
      reveal: '洞察命运',
      calculate: '计算',
    },
  },
  en: {
    common: {
      title: 'FATEFUL',
      subtitle: 'AI Life Navigation OS',
    },
    bazi: {
      title: 'BaZi Fortune',
      select: 'Select',
      year: 'Year',
      month: 'Month',
      day: 'Day',
      hour: 'Hour',
      gender: 'Gender',
      male: 'Male',
      female: 'Female',
      reveal: 'Reveal Your Destiny',
      calculate: 'Calculate',
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'zh-CN',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export function LanguageProvider({ children }: { children: ReactNode }) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}