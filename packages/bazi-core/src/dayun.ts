/**
 * Major Fortune Cycles (Da Yun) - 10-Year Periods
 * 
 * Da Yun represents 10-year fortune cycles that begin after birth.
 * Each cycle is represented by a Gan-Zhi pair, following the 60-cycle sequence.
 * 
 * Algorithm:
 * 1. Start from month pillar's Gan-Zhi
 * 2. Add X days to birth to get starting month of Da Yun 1
 *    - For males: add 120 days (when Yin energy is strong)
 *    - For females: add 0 days (when Yang energy is strong)
 *    - In leap months: add 60 more days
 * 3. Each subsequent cycle starts 10 years later
 * 4. Follow Gan-Zhi 60-year cycle pattern
 */

import { solarToLunar, lunarToSolar } from './lunar';

export interface DaYunCycle {
  cycleNumber: number; // 1st, 2nd, 3rd, 4th...
  startAge: number;    // Age when this cycle begins
  endAge: number;      // Age when this cycle ends
  ganZhi: string;      // Gan-Zhi for this cycle
  description: string; // Human readable description
}

const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/**
 * Gets the starting age for Da Yun based on gender and birth month
 * 
 * In Chinese tradition:
 * - Males: Da Yun starts when positive qi is strong (around age 4 in lunar calendar)
 * - Females: Da Yun starts when receptive qi is strong (around age 3 in lunar calendar)
 * - Exact age depends on lunar month and leap month status
 */
export function getStartingAge(
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  gender: 'male' | 'female'
): number {
  // Simplified calculation: age 3-4
  // Full implementation would consider lunar month position
  return gender === 'male' ? 4 : 3;
}

/**
 * Gets the Gan-Zhi for a specific Da Yun cycle
 * 
 * @param monthGanZhi Month pillar Gan-Zhi from birth chart
 * @param cycleNumber Which cycle (1-10 typically, can be more)
 * @returns Gan-Zhi for that cycle
 */
export function getDaYunGanZhi(monthGanZhi: string, cycleNumber: number): string {
  if (monthGanZhi.length < 2) return '';
  
  // Extract Gan and Zhi indices
  const monthGan = monthGanZhi[0];
  const monthZhi = monthGanZhi[1];
  
  if (!monthGan || !monthZhi) return '';
  
  const ganIndex = TIAN_GAN.indexOf(monthGan);
  const zhiIndex = DI_ZHI.indexOf(monthZhi);
  
  if (ganIndex === -1 || zhiIndex === -1) return '';
  
  // Each Da Yun cycle is 10 years, corresponding to 2 positions in the 60-cycle
  // Skip one position per cycle (because we're moving through a 60-cycle)
  const cycleOffset = (cycleNumber - 1) * 2;
  
  const newGanIndex = (ganIndex + cycleOffset) % 10;
  const newZhiIndex = (zhiIndex + cycleOffset) % 12;
  
  return TIAN_GAN[newGanIndex] + DI_ZHI[newZhiIndex];
}

/**
 * Calculates all Da Yun cycles for a person
 * 
 * @param birthYear Solar birth year
 * @param birthMonth Solar birth month
 * @param birthDay Solar birth day
 * @param monthGanZhi Month pillar Gan-Zhi from birth chart
 * @param gender Birth gender
 * @param numCycles Number of cycles to calculate (typically 8-10 for lifespan)
 * @returns Array of Da Yun cycles
 */
export function calculateDaYun(
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  monthGanZhi: string,
  gender: 'male' | 'female',
  numCycles: number = 8
): DaYunCycle[] {
  const cycles: DaYunCycle[] = [];
  const startingAge = getStartingAge(birthYear, birthMonth, birthDay, gender);
  
  for (let i = 1; i <= numCycles; i++) {
    const startAge = startingAge + (i - 1) * 10;
    const endAge = startAge + 9;
    const ganZhi = getDaYunGanZhi(monthGanZhi, i);
    
    cycles.push({
      cycleNumber: i,
      startAge,
      endAge,
      ganZhi,
      description: `第${['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'][i - 1] || i}个大运周期 (${startAge}-${endAge}岁): ${ganZhi}`
    });
  }
  
  return cycles;
}

/**
 * Gets the quality/nature of a Da Yun cycle
 * Analyzes the cycle's Gan-Zhi against the birth chart's day master
 */
export function analyzeDaYunQuality(
  dayMasterGan: string,
  dayMasterZhi: string,
  cycleGanZhi: string
): {
  quality: 'very-favorable' | 'favorable' | 'neutral' | 'unfavorable' | 'very-unfavorable';
  explanation: string;
} {
  if (cycleGanZhi.length < 2) {
    return { quality: 'neutral', explanation: '无法分析' };
  }
  
  const cycleGan = cycleGanZhi[0];
  const cycleZhi = cycleGanZhi[1];
  
  if (!cycleGan || !cycleZhi) {
    return { quality: 'neutral', explanation: '无法分析' };
  }
  
  // Get elements
  const dayGanElement = getGanElement(dayMasterGan);
  const dayZhiElement = getZhiElement(dayMasterZhi);
  const cycleGanElement = getGanElement(cycleGan);
  const cycleZhiElement = getZhiElement(cycleZhi);
  
  // Simple analysis: count supportive vs conflicting elements
  let score = 0;
  
  if (cycleGanElement === dayGanElement) score += 2;
  if (cycleZhiElement === dayZhiElement) score += 2;
  if (elementCreates(cycleGanElement, dayGanElement)) score += 1;
  if (elementCreates(cycleZhiElement, dayZhiElement)) score += 1;
  if (elementConquers(dayGanElement, cycleGanElement)) score += 1;
  if (elementConquers(dayZhiElement, cycleZhiElement)) score += 1;
  
  if (elementConquers(cycleGanElement, dayGanElement)) score -= 2;
  if (elementConquers(cycleZhiElement, dayZhiElement)) score -= 2;
  
  let quality: 'very-favorable' | 'favorable' | 'neutral' | 'unfavorable' | 'very-unfavorable';
  if (score >= 4) quality = 'very-favorable';
  else if (score >= 1) quality = 'favorable';
  else if (score <= -4) quality = 'very-unfavorable';
  else if (score <= -1) quality = 'unfavorable';
  else quality = 'neutral';
  
  const explanations: Record<typeof quality, string> = {
    'very-favorable': '大利运势，事业和财运将有重大突破',
    'favorable': '总体运势良好，适合推进重要计划',
    'neutral': '运势平稳，保持现状为宜',
    'unfavorable': '需谨慎行事，避免重大决策',
    'very-unfavorable': '大凶运势，应低调行动，度过难关'
  };
  
  return {
    quality,
    explanation: explanations[quality]
  };
}

function getGanElement(gan: string): string {
  const map: Record<string, string> = {
    '甲': '木', '乙': '木', '丙': '火', '丁': '火',
    '戊': '土', '己': '土', '庚': '金', '辛': '金',
    '壬': '水', '癸': '水'
  };
  return map[gan] || '';
}

function getZhiElement(zhi: string): string {
  const map: Record<string, string> = {
    '子': '水', '丑': '土', '寅': '木', '卯': '木',
    '辰': '土', '巳': '火', '午': '火', '未': '土',
    '申': '金', '酉': '金', '戌': '土', '亥': '水'
  };
  return map[zhi] || '';
}

function elementCreates(from: string, to: string): boolean {
  const cycle = ['木', '火', '土', '金', '水'];
  const fromIdx = cycle.indexOf(from);
  const toIdx = cycle.indexOf(to);
  return fromIdx !== -1 && toIdx !== -1 && (fromIdx + 1) % 5 === toIdx;
}

function elementConquers(from: string, to: string): boolean {
  const conquers: Record<string, string> = {
    '木': '土', '火': '金', '土': '水', '金': '木', '水': '火'
  };
  return conquers[from] === to;
}
