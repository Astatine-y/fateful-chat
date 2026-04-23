// apps/api/src/utils/bazi.ts
// Inlined bazi-core to avoid workspace build issues

export type GanZhi = string;
export type WuXing = '木' | '火' | '土' | '金' | '水';
export type ShiShen = '比肩' | '劫财' | '食神' | '伤官' | '偏财' | '正财' | '七杀' | '正官' | '偏印' | '正印';

export interface BaziInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  gender: 'male' | 'female';
  longitude?: number;
  latitude?: number;
  timezone?: number;
}

export interface BaziOutput {
  gan_zhi: { year: GanZhi; month: GanZhi; day: GanZhi; hour: GanZhi; };
  wu_xing: WuXing[];
  shi_shen: ShiShen[];
  da_yun: { cycles: Array<{ number: number; startAge: number; endAge: number; ganZhi: string; description: string; }>; };
  liu_yue: { currentYear: number; yearlyFortune: string; monthlyForecasts: Array<{ month: number; ganZhi: string; quality: string; description: string; }>; };
}

const TIAN_GAN: GanZhi[] = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DI_ZHI: GanZhi[] = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const WU_XING_MAP: Record<string, string> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
  '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火', '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水',
};

const LUNAR_CALENDAR: number[] = [
  0x04bd0, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
  0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
  0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
  0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
  0x0d4a0, 0x0d5a0, 0x16aa0, 0x056d0, 0x04ae0, 0x0a5d0, 0x0502d, 0x0d43a, 0x0d5a0, 0x0d554,
  0x0b540, 0x0d6a0, 0x0ada0, 0x095b0, 0x14979, 0x04970, 0x0a497, 0x0b4b0, 0x0b5a0, 0x06b50,
  0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970, 0x06566, 0x0d4a0, 0x0ea50, 0x06e95,
  0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950, 0x0d4a0, 0x0d5a0, 0x16aa0, 0x056d0,
  0x04ae0, 0x0a5d0, 0x0502d, 0x0d43a, 0x0d5a0, 0x0d554, 0x0b540, 0x0d6a0, 0x0ada0, 0x095b0,
  0x14979, 0x04970, 0x0a497, 0x0b4b0, 0x0b5a0, 0x06b50, 0x06d40, 0x1ab54, 0x02b60, 0x09570,
  0x052f2, 0x04970, 0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0,
];

export function calculateTimezone(longitude: number): number {
  return Math.max(-12, Math.min(14, Math.round(longitude / 15)));
}

export function getBazi(input: BaziInput): BaziOutput {
  const { year, month, day, hour, gender, longitude = 120 } = input;
  
  const lunarCache = new Map<string, { year: number; month: number; day: number }>();
  const cacheKey = `${year}-${month}-${day}`;
  
  let lunarBirth = lunarCache.get(cacheKey);
  if (!lunarBirth) {
    lunarBirth = solarToLunar(year, month, day);
    if (lunarCache.size >= 1000) lunarCache.clear();
    lunarCache.set(cacheKey, lunarBirth);
  }
  
  const adjustedHour = (hour + (120 - longitude) * 4 / 60 + 24) % 24;
  const realHour = (adjustedHour + (8 - calculateTimezone(longitude)) + 24) % 24;
  
  const ganZhi = {
    year: calcGanZhiYear(year),
    month: calcGanZhiMonth(year, lunarBirth.month),
    day: calcGanZhiDay(year, month, day),
    hour: ''
  };
  
  const dayGan = ganZhi.day[0];
  if (!dayGan) throw new Error('Failed to calculate day Gan');
  
  ganZhi.hour = calcGanZhiHour(realHour, dayGan);
  
  const wu_xing: WuXing[] = [];
  ['year', 'month', 'day', 'hour'].forEach(p => {
    const gz = ganZhi[p as keyof typeof ganZhi];
    if (gz && gz.length === 2) {
      const e1 = WU_XING_MAP[gz[0]] as WuXing;
      const e2 = WU_XING_MAP[gz[1]] as WuXing;
      if (e1) wu_xing.push(e1);
      if (e2) wu_xing.push(e2);
    }
  });
  
  const shishenSet = calculateShiShenSet(
    dayGan, ganZhi.year[0], ganZhi.month[0], ganZhi.hour[0], gender
  );
  
  const shi_shen: ShiShen[] = [
    (shishenSet.yearShen ?? '比肩') as ShiShen,
    (shishenSet.monthShen ?? '食神') as ShiShen,
    (shishenSet.dayShen ?? '正财') as ShiShen,
    (shishenSet.hourShen ?? '七杀') as ShiShen
  ];
  
  const daYunCycles = calculateDaYun(lunarBirth.year, gender);
  
  return {
    gan_zhi: ganZhi,
    wu_xing,
    shi_shen,
    da_yun: { cycles: daYunCycles },
    liu_yue: {
      currentYear: new Date().getFullYear(),
      yearlyFortune: `${new Date().getFullYear()}年运势分析`,
      monthlyForecasts: Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        ganZhi: getMonthGanZhi(new Date().getFullYear(), i + 1),
        quality: 'neutral',
        description: `第${i + 1}月运势平稳`
      }))
    }
  };
}

function solarToLunar(year: number, month: number, day: number): { year: number; month: number; day: number } {
  const daysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const isLeapYear = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  if (isLeapYear(year)) daysInMonth[2] = 29;
  
  let totalDays = 0;
  for (let y = 1900; y < year; y++) totalDays += isLeapYear(y) ? 366 : 365;
  for (let m = 1; m < month; m++) totalDays += daysInMonth[m] ?? 0;
  totalDays += day - 30;
  
  let lunarYear = 1900;
  while (totalDays >= 384 && lunarYear < 2100) {
    totalDays -= getLunarYearDays(lunarYear);
    lunarYear++;
  }
  
  let lunarMonth = 1;
  while (totalDays >= 30 && lunarMonth <= 12) {
    totalDays -= getLunarMonthDays(lunarYear, lunarMonth);
    lunarMonth++;
  }
  
  return { year: lunarYear, month: lunarMonth, day: totalDays + 1 };
}

function getLunarYearDays(lunarYear: number): number {
  if (lunarYear < 1900 || lunarYear > 2100) return 384;
  let days = 0;
  for (let i = 1; i <= 12; i++) days += getLunarMonthDays(lunarYear, i);
  const leapMonth = LUNAR_CALENDAR[lunarYear - 1900] & 0x0f;
  if (leapMonth) days += getLunarMonthDays(lunarYear, leapMonth);
  return days;
}

function getLunarMonthDays(lunarYear: number, month: number): number {
  if (lunarYear < 1900 || lunarYear > 2100 || month < 1 || month > 12) return 30;
  const yearData = LUNAR_CALENDAR[lunarYear - 1900];
  return (yearData >> (16 - month)) & 1 ? 30 : 29;
}

function calcGanZhiYear(y: number): GanZhi {
  const ganIndex = (y - 1900) % 10;
  const zhiIndex = (y - 1900) % 12;
  return TIAN_GAN[ganIndex] + DI_ZHI[zhiIndex];
}

function calcGanZhiMonth(y: number, m: number): GanZhi {
  const monthZhiMap: Record<number, number> = { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9, 9: 10, 10: 11, 11: 0, 12: 1 };
  const zhiIndex = monthZhiMap[m];
  const yearGanIndex = (y - 1900) % 10;
  const ganStartIndex = (yearGanIndex % 5) * 2;
  const monthGanIndex = (ganStartIndex + m - 1) % 10;
  return TIAN_GAN[monthGanIndex] + DI_ZHI[zhiIndex];
}

function calcGanZhiDay(y: number, m: number, d: number): GanZhi {
  const isLeapYear = (year: number) => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const daysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (isLeapYear(y)) daysInMonth[2] = 29;
  
  let totalDays = 0;
  for (let i = 1900; i < y; i++) totalDays += isLeapYear(i) ? 366 : 365;
  for (let i = 1; i < m; i++) totalDays += daysInMonth[i];
  totalDays += d - 30;
  
  const ganIndex = totalDays % 10;
  const zhiIndex = totalDays % 12;
  return TIAN_GAN[ganIndex] + DI_ZHI[zhiIndex];
}

function calcGanZhiHour(h: number, dayGan: string): GanZhi {
  let zhiIndex = h >= 23 || h < 1 ? 0 : Math.floor((h + 1) / 2);
  const dayGanIndex = TIAN_GAN.indexOf(dayGan);
  const ganIndex = ((dayGanIndex * 2) + Math.floor(zhiIndex / 2)) % 10;
  return TIAN_GAN[ganIndex] + DI_ZHI[zhiIndex];
}

function calculateShiShenSet(dayGan: string, yearGan: string, monthGan: string, hourGan: string, gender: string): Record<string, string> {
  const elements: Record<string, string> = { '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水' };
  const getRelation = (a: string, b: string): string => {
    if (a === b) return 'same';
    const e1 = elements[a] || '', e2 = elements[b] || '';
    if (e1 === e2) return 'sameElement';
    const cycle = ['木', '火', '土', '金', '水'];
    const i1 = cycle.indexOf(e1), i2 = cycle.indexOf(e2);
    if (i1 === -1 || i2 === -1) return 'neutral';
    const diff = (i2 - i1 + 5) % 5;
    if (diff === 1) return 'generates';
    if (diff === 2) return 'overcomes';
    return 'neutral';
  };
  
  const dayIsYang = ['甲', '丙', '戊', '庚', '壬'].includes(dayGan);
  const relYear = getRelation(dayGan, yearGan);
  const relMonth = getRelation(dayGan, monthGan);
  const relHour = getRelation(dayGan, hourGan);
  
  const mapToShishen = (rel: string): string => {
    if (rel === 'same') return '比肩';
    if (rel === 'sameElement') return gender === 'male' ? '劫财' : '姐妹';
    if (rel === 'generates') return '食神';
    if (rel === 'overcomes') return dayIsYang ? '七杀' : '正官';
    return '比肩';
  };
  
  return {
    yearShen: mapToShishen(relYear),
    monthShen: mapToShishen(relMonth),
    dayShen: '日干',
    hourShen: mapToShishen(relHour)
  };
}

function calculateDaYun(birthYear: number, gender: string): Array<{ number: number; startAge: number; endAge: number; ganZhi: string; description: string; }> {
  const cycles = [];
  const startAge = gender === 'male' ? 4 : 3;
  
  for (let i = 1; i <= 10; i++) {
    const cycleYear = ((birthYear - 1900) + i * 10) % 60;
    const ganIndex = cycleYear % 10;
    const zhiIndex = cycleYear % 12;
    cycles.push({
      number: i,
      startAge: startAge + (i - 1) * 10,
      endAge: startAge + i * 10 - 1,
      ganZhi: TIAN_GAN[ganIndex] + DI_ZHI[zhiIndex],
      description: `第${['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'][i - 1]}大运 (${startAge + (i - 1) * 10}-${startAge + i * 10 - 1}岁)`
    });
  }
  return cycles;
}

function getMonthGanZhi(year: number, month: number): string {
  const monthZhiMap = [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1];
  const zhiIndex = monthZhiMap[month] ?? 0;
  const yearGanIndex = (year - 1900) % 10;
  const monthStartGan = (yearGanIndex % 5) * 2;
  const monthGanIndex = (monthStartGan + month - 1) % 10;
  return TIAN_GAN[monthGanIndex] + DI_ZHI[zhiIndex];
}