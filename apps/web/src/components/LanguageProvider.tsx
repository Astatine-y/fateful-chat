'use client';

import { ReactNode, useEffect, useState } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from 'i18next';

const resources = {
  'zh-CN': {
    translation: {
      selectYear: '选择年份',
      selectMonth: '选择月份',
      selectDay: '选择日期',
      selectHour: '选择时辰',
      gender: '性别',
      male: '男',
      female: '女',
      reveal: '洞察命运',
      calculating: '计算中...',
      year: '年',
      month: '月',
      day: '日',
      hour: '时',
      dashboard: '控制台',
    }
  },
  'en': {
    translation: {
      selectYear: 'Select Year',
      selectMonth: 'Select Month',
      selectDay: 'Select Day',
      selectHour: 'Select Hour',
      gender: 'Gender',
      male: 'Male',
      female: 'Female',
      reveal: 'Reveal Your Destiny',
      calculating: 'Calculating...',
      year: 'Year',
      month: 'Month',
      day: 'Day',
      hour: 'Hour',
      dashboard: 'Dashboard',
    }
  },
  'ja': {
    translation: {
      selectYear: '年を選択',
      selectMonth: '月を選択',
      selectDay: '日を選択',
      selectHour: '時間を選択',
      gender: '性別',
      male: '男',
      female: '女',
      reveal: '運命を開く',
      calculating: '計算中...',
      year: '年',
      month: '月',
      day: '日',
      hour: '時',
      dashboard: 'ダッシュボード',
    }
  },
  'ko': {
    translation: {
      selectYear: '연도 선택',
      selectMonth: '월 선택',
      selectDay: '일 선택',
      selectHour: '시간 선택',
      gender: '성별',
      male: '남',
      female: '여',
      reveal: '운명 드러내기',
      calculating: '계산 중...',
      year: '년',
      month: '월',
      day: '일',
      hour: '시',
      dashboard: '대시보드',
    }
  },
  'es': {
    translation: {
      selectYear: 'Seleccionar año',
      selectMonth: 'Seleccionar mes',
      selectDay: 'Seleccionar día',
      selectHour: 'Seleccionar hora',
      gender: 'Género',
      male: 'Hombre',
      female: 'Mujer',
      reveal: 'Revela tu destino',
      calculating: 'Calculando...',
      year: 'Año',
      month: 'Mes',
      day: 'Día',
      hour: 'Hora',
      dashboard: 'Panel',
    }
  },
  'fr': {
    translation: {
      selectYear: "Sélectionner l'année",
      selectMonth: 'Sélectionner le mois',
      selectDay: 'Sélectionner le jour',
      selectHour: "Sélectionner l'heure",
      gender: 'Genre',
      male: 'Homme',
      female: 'Femme',
      reveal: 'Révélez votre destin',
      calculating: 'Calcul en cours...',
      year: 'Année',
      month: 'Mois',
      day: 'Jour',
      hour: 'Heure',
      dashboard: 'Tableau de bord',
    }
  },
  'vi': {
    translation: {
      selectYear: 'Chọn năm',
      selectMonth: 'Chọn tháng',
      selectDay: 'Chọn ngày',
      selectHour: 'Chọn giờ',
      gender: 'Giới tính',
      male: 'Nam',
      female: 'Nữ',
      reveal: 'Khám phá vận mệnh',
      calculating: 'Đang tính toán...',
      year: 'Năm',
      month: 'Tháng',
      day: 'Ngày',
      hour: 'Giờ',
      dashboard: 'Bảng điều khiển',
    }
  },
  'th': {
    translation: {
      selectYear: 'เลือกปี',
      selectMonth: 'เลือกเดือน',
      selectDay: 'เลือกวัน',
      selectHour: 'เลือกชั่วโมง',
      gender: 'เพศ',
      male: 'ชาย',
      female: 'หญิง',
      reveal: 'เปิดเผยโชคชะตา',
      calculating: 'กำลังคำนวณ...',
      year: 'ปี',
      month: 'เดือน',
      day: 'วัน',
      hour: 'ชั่วโมง',
      dashboard: 'แดชบอร์ด',
    }
  },
  'id': {
    translation: {
      selectYear: 'Pilih tahun',
      selectMonth: 'Pilih bulan',
      selectDay: 'Pilih hari',
      selectHour: 'Pilih jam',
      gender: 'Jenis Kelamin',
      male: 'Pria',
      female: 'Wanita',
      reveal: 'Buka Nasibmu',
      calculating: 'Menghitung...',
      year: 'Tahun',
      month: 'Bulan',
      day: 'Hari',
      hour: 'Jam',
      dashboard: 'Dasbor',
    }
  },
};

i18n.init({
  resources,
  lng: localStorage.getItem('i18nextLng') || 'zh-CN',
  fallbackLng: 'zh-CN',
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

export { i18n };