// packages/bazi-core/index.ts
import { BaziInput, BaziResult } from './types';

// Simplified Bazi calculation (placeholder for full Python integration)
export function calculateBazi(input: BaziInput): BaziResult {
  // This is a simplified implementation
  // In production, this would interface with the Python calculator.py

  // Simplified Chinese calendar calculation
  const heavenlyStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

  // Simplified calculation based on year (this is not accurate)
  const yearIndex = (input.year - 1984) % 60; // 1984 is Jia Zi year
  const yearStem = heavenlyStems[yearIndex % 10];
  const yearBranch = earthlyBranches[yearIndex % 12];

  // Simplified month calculation
  const monthStem = heavenlyStems[(yearIndex + input.month - 1) % 10];
  const monthBranch = earthlyBranches[(input.month - 1) % 12];

  // Simplified day calculation
  const dayIndex = Math.floor((input.year * 365 + input.month * 30 + input.day) % 60);
  const dayStem = heavenlyStems[dayIndex % 10];
  const dayBranch = earthlyBranches[dayIndex % 12];

  // Simplified hour calculation
  const hourBranch = earthlyBranches[Math.floor(input.hour / 2) % 12];
  const hourStem = heavenlyStems[(dayIndex + Math.floor(input.hour / 2)) % 10];

  return {
    year: `${yearStem}${yearBranch}`,
    month: `${monthStem}${monthBranch}`,
    day: `${dayStem}${dayBranch}`,
    hour: `${hourStem}${hourBranch}`
  };
}

export function getBazi(
  year: number,
  month: number,
  day: number,
  hour: number,
  longitude: number,
  latitude: number
): BaziResult {
  return calculateBazi({ year, month, day, hour, longitude, latitude });
}

export default getBazi;