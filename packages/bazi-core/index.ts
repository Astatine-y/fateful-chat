import { BaziInput, BaziOutput, GanZhi, WuXing, ShiShen } from './src/types';
import { calculateShiShenSet } from './src/shishen';
import { calculateDaYun } from './src/dayun';
import { analyzeYearlyFortune } from './src/liuyue';
import { solarToLunar } from './src/lunar';

const lunarCache = new Map<string, ReturnType<typeof solarToLunar>>();
const CACHE_SIZE_LIMIT = 1000;

export type { BaziInput, BaziOutput, GanZhi, WuXing, ShiShen };

const TIAN_GAN: GanZhi[] = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DI_ZHI: GanZhi[] = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const WU_XING_MAP: Record<GanZhi, WuXing> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
  '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火', '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水',
};

export function getBazi(input: BaziInput): BaziOutput {
  try {
    validateInput(input);

    const { year, month, day, hour, gender, timezone = 8 } = input;

    const cacheKey = `${year}-${month}-${day}`;
    let lunarBirth = lunarCache.get(cacheKey);

    if (!lunarBirth) {
      lunarBirth = solarToLunar(year, month, day);

      if (lunarCache.size >= CACHE_SIZE_LIMIT) {
        const firstKey = lunarCache.keys().next().value;
        if (firstKey !== undefined) {
          lunarCache.delete(firstKey);
        }
      }
      lunarCache.set(cacheKey, lunarBirth);
    }

    const realHour = calcRealHour(hour, lunarBirth.month, lunarBirth.day, timezone);
    const ganZhi = {
      year: calcGanZhiYear(lunarBirth.year),
      month: calcGanZhiMonth(lunarBirth.year, lunarBirth.month),
      day: calcGanZhiDay(year, month, day),
      hour: ''
    };

    const dayGan = ganZhi.day[0];
    if (!dayGan) {
      throw new Error('Failed to calculate day Gan');
    }
    ganZhi.hour = calcGanZhiHour(realHour, dayGan);

    const wu_xing = calcWuXing(ganZhi);

    const yearGan = ganZhi.year[0];
    const monthGan = ganZhi.month[0];
    const hourGan = ganZhi.hour[0];
    
    if (!yearGan || !monthGan || !hourGan) {
      throw new Error('Failed to calculate pillar Gans');
    }
    
    const shishenSet = calculateShiShenSet(
      dayGan,
      yearGan,
      monthGan,
      hourGan,
      gender as 'male' | 'female'
    );

    const shi_shen: ShiShen[] = [
      (shishenSet.yearShen ?? '比肩') as ShiShen,
      (shishenSet.monthShen ?? '食神') as ShiShen,
      (shishenSet.dayShen ?? '正财') as ShiShen,
      (shishenSet.hourShen ?? '七杀') as ShiShen
    ];

    const daYunCycles = calculateDaYun(lunarBirth.year, lunarBirth.month, lunarBirth.day, ganZhi.month, gender as 'male' | 'female');

    const currentYear = new Date().getFullYear();
    const dayGanChar = ganZhi.day[0];
    const dayZhiChar = ganZhi.day[1];
    
    if (!dayGanChar || !dayZhiChar) {
      throw new Error('Failed to extract day pillar characters');
    }
    
    const yearlyFortune = analyzeYearlyFortune(currentYear, dayGanChar, dayZhiChar, ganZhi.month);

    return {
      gan_zhi: ganZhi,
      wu_xing,
      shi_shen,
      da_yun: {
        cycles: daYunCycles.map(c => ({
          number: c.cycleNumber,
          startAge: c.startAge,
          endAge: c.endAge,
          ganZhi: c.ganZhi,
          description: c.description
        }))
      },
      liu_yue: {
        currentYear,
        yearlyFortune: yearlyFortune.yearlyAnalysis,
        monthlyForecasts: yearlyFortune.monthlyForecasts.map(m => ({
          month: m.month,
          ganZhi: m.ganZhi,
          quality: m.quality,
          description: m.description
        }))
      }
    };
  } catch (error) {
    throw new Error(`Bazi calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function validateInput(input: BaziInput): void {
  const { year, month, day, hour } = input;
  if (month < 1 || month > 12) throw new Error('Month must be 1-12');
  if (day < 1 || day > 31) throw new Error('Day must be 1-31');
  if (hour < 0 || hour > 23) throw new Error('Hour must be 0-23');
  if (year < 1900 || year > 2100) throw new Error('Year must be 1900-2100');
}

function calcRealHour(h: number, m: number, d: number, tz: number): number {
  return (h + (8 - tz) + 24) % 24;
}

function calcGanZhiYear(y: number): GanZhi {
  const ganIndex = (y - 1900) % 10;
  const zhiIndex = (y - 1900) % 12;
  return TIAN_GAN[ganIndex] + DI_ZHI[zhiIndex];
}

function calcGanZhiMonth(y: number, m: number): GanZhi {
  const monthZhiMap: { [key: number]: number } = {
    1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7,
    7: 8, 8: 9, 9: 10, 10: 11, 11: 0, 12: 1
  };
  const zhiIndex = monthZhiMap[m];
  
  const yearGanIndex = (y - 1900) % 10;
  const ganStartIndex = (yearGanIndex % 5) * 2;
  const monthGanIndex = (ganStartIndex + m - 1) % 10;
  
  return TIAN_GAN[monthGanIndex] + DI_ZHI[zhiIndex];
}

function calcGanZhiDay(y: number, m: number, d: number): GanZhi {
  const isLeapYear = (year: number) => 
    (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  
  const daysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (isLeapYear(y)) daysInMonth[2] = 29;
  
  let totalDays = 0;
  
  for (let i = 1900; i < y; i++) {
    totalDays += isLeapYear(i) ? 366 : 365;
  }
  
  for (let i = 1; i < m; i++) {
    totalDays += daysInMonth[i];
  }
  
  totalDays += d - 30;
  
  const ganIndex = totalDays % 10;
  const zhiIndex = totalDays % 12;
  
  return TIAN_GAN[ganIndex] + DI_ZHI[zhiIndex];
}

function calcGanZhiHour(h: number, dayGan: string): GanZhi {
  let zhiIndex: number;
  if (h >= 23 || h < 1) {
    zhiIndex = 0;
  } else {
    zhiIndex = Math.floor((h + 1) / 2);
  }
  
  const dayGanIndex = TIAN_GAN.indexOf(dayGan);
  const ganOffset = (dayGanIndex * 2) % 10;
  const ganIndex = (ganOffset + Math.floor(zhiIndex / 2)) % 10;
  
  return TIAN_GAN[ganIndex] + DI_ZHI[zhiIndex];
}

function calcWuXing(gz: Record<string, GanZhi>): WuXing[] {
  const wuXing: WuXing[] = [];
  const pillars: (keyof typeof gz)[] = ['year', 'month', 'day', 'hour'];
  
  for (const pillar of pillars) {
    const ganZhi = gz[pillar];
    if (ganZhi && ganZhi.length === 2) {
      const ganElement = WU_XING_MAP[ganZhi[0]];
      if (ganElement) wuXing.push(ganElement);
      
      const zhiElement = WU_XING_MAP[ganZhi[1]];
      if (zhiElement) wuXing.push(zhiElement);
    }
  }
  
  return wuXing;
}

export default getBazi;

export { solarToLunar } from './src/lunar';
export { calculateShiShenSet, getElementalRelationship } from './src/shishen';
export { calculateDaYun, analyzeDaYunQuality } from './src/dayun';
export { analyzeYearlyFortune, getYearGanZhi, getMonthGanZhi } from './src/liuyue';