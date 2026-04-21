/**
 * Yearly and Monthly Cycles (Liu Yue / 流年/流月)
 * 
 * Liu Yue represents yearly and monthly fortune cycles.
 * Each year and month has its own Gan-Zhi pair that interacts with the birth chart.
 * 
 * Algorithm:
 * 1. Determine current/target year's Gan-Zhi (60-cycle repeats)
 * 2. Compare against birth chart's day master
 * 3. Analyze 12 monthly cycles within that year
 * 4. Identify auspicious/inauspicious periods
 */

export interface YearlyFortune {
  year: number;
  ganZhi: string;
  quality: 'very-favorable' | 'favorable' | 'neutral' | 'unfavorable' | 'very-unfavorable';
  monthlyForecasts: MonthlyFortune[];
  yearlyAnalysis: string;
}

export interface MonthlyFortune {
  month: number;
  ganZhi: string;
  quality: 'very-favorable' | 'favorable' | 'neutral' | 'unfavorable' | 'very-unfavorable';
  description: string;
}

const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/**
 * Gets the Gan-Zhi for a specific year
 * Reference: 1900 is 庚子 year (start of 60-cycle)
 */
export function getYearGanZhi(year: number): string {
  const ganIndex = (year - 1900) % 10;
  const zhiIndex = (year - 1900) % 12;
  return TIAN_GAN[ganIndex] + DI_ZHI[zhiIndex];
}

/**
 * Gets the Gan-Zhi for a specific month in a given year
 * Month Zhi is fixed (Jan=寅, Feb=卯, etc.)
 * Month Gan depends on year Gan
 */
export function getMonthGanZhi(year: number, month: number): string {
  if (month < 1 || month > 12) return '';
  
  // Month Zhi mapping (fixed)
  const monthZhiMap = [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1]; // 0-indexed
  const zhiIndex = monthZhiMap[month];
  if (zhiIndex === undefined) return '';
  
  // Month Gan (depends on year)
  const yearGanIndex = (year - 1900) % 10;
  const monthStartGan = (yearGanIndex % 5) * 2;
  const monthGanIndex = (monthStartGan + month - 1) % 10;
  
  return TIAN_GAN[monthGanIndex] + DI_ZHI[zhiIndex];
}

/**
 * Analyzes yearly fortune by comparing year Gan-Zhi with birth chart
 */
export function analyzeYearlyFortune(
  year: number,
  dayMasterGan: string,
  dayMasterZhi: string,
  monthGanZhiBirth: string
): YearlyFortune {
  const yearGanZhi = getYearGanZhi(year);
  
  // Analyze year quality
  const quality = analyzeFortuneQuality(dayMasterGan, dayMasterZhi, yearGanZhi);
  
  // Generate monthly forecasts
  const monthlyForecasts: MonthlyFortune[] = [];
  for (let month = 1; month <= 12; month++) {
    const monthGanZhi = getMonthGanZhi(year, month);
    const monthQuality = analyzeFortuneQuality(dayMasterGan, dayMasterZhi, monthGanZhi);
    
    monthlyForecasts.push({
      month,
      ganZhi: monthGanZhi,
      quality: monthQuality,
      description: generateMonthDescription(month, monthGanZhi, monthQuality)
    });
  }
  
  // Generate yearly analysis
  const yearlyAnalysis = generateYearlyAnalysis(year, yearGanZhi, quality, monthlyForecasts);
  
  return {
    year,
    ganZhi: yearGanZhi,
    quality,
    monthlyForecasts,
    yearlyAnalysis
  };
}

/**
 * Analyzes fortune quality by comparing two Gan-Zhi pairs
 */
function analyzeFortuneQuality(
  masterGan: string,
  masterZhi: string,
  periodGanZhi: string
): 'very-favorable' | 'favorable' | 'neutral' | 'unfavorable' | 'very-unfavorable' {
  if (periodGanZhi.length < 2) return 'neutral';
  
  const periodGan = periodGanZhi[0];
  const periodZhi = periodGanZhi[1];
  
  if (!periodGan || !periodZhi) return 'neutral';
  
  // Get elements
  const masterGanElem = getGanElement(masterGan);
  const masterZhiElem = getZhiElement(masterZhi);
  const periodGanElem = getGanElement(periodGan);
  const periodZhiElem = getZhiElement(periodZhi);
  
  let score = 0;
  
  // Matching elements (very favorable)
  if (masterGanElem === periodGanElem) score += 3;
  if (masterZhiElem === periodZhiElem) score += 3;
  
  // Supportive relationships
  if (elementCreates(periodGanElem, masterGanElem)) score += 2;
  if (elementCreates(periodZhiElem, masterZhiElem)) score += 2;
  if (elementConquers(masterGanElem, periodGanElem)) score += 2;
  if (elementConquers(masterZhiElem, periodZhiElem)) score += 2;
  
  // Conflicting relationships
  if (elementConquers(periodGanElem, masterGanElem)) score -= 3;
  if (elementConquers(periodZhiElem, masterZhiElem)) score -= 3;
  
  // Convert score to quality
  if (score >= 6) return 'very-favorable';
  if (score >= 2) return 'favorable';
  if (score <= -6) return 'very-unfavorable';
  if (score <= -2) return 'unfavorable';
  return 'neutral';
}

/**
 * Generates human-readable description for monthly fortune
 */
function generateMonthDescription(month: number, ganZhi: string, quality: string): string {
  const monthNames = ['', '正月', '二月', '三月', '四月', '五月', '六月',
                      '七月', '八月', '九月', '十月', '冬月', '腊月'];
  
  const qualityDescriptions: Record<string, string> = {
    'very-favorable': '运势大吉，宜积极进取',
    'favorable': '运势顺畅，可推进计划',
    'neutral': '运势平稳，保持现状',
    'unfavorable': '运势不佳，宜谨慎保守',
    'very-unfavorable': '运势大凶，应低调待时'
  };
  
  return `${monthNames[month]}: ${ganZhi} - ${qualityDescriptions[quality]}`;
}

/**
 * Generates comprehensive yearly analysis
 */
function generateYearlyAnalysis(
  year: number,
  yearGanZhi: string,
  quality: string,
  monthlyForecasts: MonthlyFortune[]
): string {
  const favorableMonths = monthlyForecasts.filter(m => m.quality === 'very-favorable' || m.quality === 'favorable').length;
  const unfavorableMonths = monthlyForecasts.filter(m => m.quality === 'unfavorable' || m.quality === 'very-unfavorable').length;
  
  const qualityTexts: Record<string, string> = {
    'very-favorable': `${year}年是运势大吉的一年，全年共有${favorableMonths}个月份运势顺畅。`,
    'favorable': `${year}年总体运势良好，全年共有${favorableMonths}个月份运势顺畅。`,
    'neutral': `${year}年运势平稳，全年运势波动不大。`,
    'unfavorable': `${year}年需要谨慎行动，全年共有${unfavorableMonths}个月份运势不佳。`,
    'very-unfavorable': `${year}年运势不理想，全年共有${unfavorableMonths}个月份运势大凶，需要特别谨慎。`
  };
  
  return qualityTexts[quality] || '无法分析年度运势';
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
