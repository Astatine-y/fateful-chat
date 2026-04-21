/**
 * Lunar Calendar Conversion
 * 
 * Converts between solar (Gregorian) and lunar (Chinese) calendars.
 * Uses lookup tables based on astronomical data.
 * 
 * Reference:
 * - Chinese lunar calendar repeats every 19 years (Metonic cycle)
 * - Contains regular months (29-30 days) and leap months
 * - New Year starts on the 2nd new moon after winter solstice
 */

// Lunar month info: bit 0-3 = leap month (0 = no leap), bits 4-15 = month days
// Each value represents one year, encoding day counts for 12-13 months
const LUNAR_CALENDAR: number[] = [
  0x04bd0, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2, // 1900
  0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977, // 1910
  0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970, // 1920
  0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950, // 1930
  0x0d4a0, 0x0d5a0, 0x16aa0, 0x056d0, 0x04ae0, 0x0a5d0, 0x0502d, 0x0d43a, 0x0d5a0, 0x0d554, // 1940
  0x0b540, 0x0d6a0, 0x0ada0, 0x095b0, 0x14979, 0x04970, 0x0a497, 0x0b4b0, 0x0b5a0, 0x06b50, // 1950
  0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970, 0x06566, 0x0d4a0, 0x0ea50, 0x06e95, // 1960
  0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950, 0x0d4a0, 0x0d5a0, 0x16aa0, 0x056d0, // 1970
  0x04ae0, 0x0a5d0, 0x0502d, 0x0d43a, 0x0d5a0, 0x0d554, 0x0b540, 0x0d6a0, 0x0ada0, 0x095b0, // 1980
  0x14979, 0x04970, 0x0a497, 0x0b4b0, 0x0b5a0, 0x06b50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, // 1990
  0x052f2, 0x04970, 0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, // 2000
  0x1c8d7, 0x0c950, 0x0d4a0, 0x0d5a0, 0x16aa0, 0x056d0, 0x04ae0, 0x0a5d0, 0x0502d, 0x0d43a, // 2010
  0x0d5a0, 0x0d554, 0x0b540, 0x0d6a0, 0x0ada0, 0x095b0, 0x14979, 0x04970, 0x0a497, 0x0b4b0, // 2020
  0x0b5a0, 0x06b50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970, 0x06566, 0x0d4a0, // 2030
  0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950, 0x0d4a0, 0x0d5a0, // 2040
  0x16aa0, 0x056d0, 0x04ae0, 0x0a5d0, 0x0502d, 0x0d43a, 0x0d5a0, 0x0d554, 0x0b540, 0x0d6a0, // 2050
  0x0ada0, 0x095b0, 0x14979, 0x04970, 0x0a497, 0x0b4b0, 0x0b5a0, 0x06b50, 0x06d40, 0x1ab54, // 2060
  0x02b60, 0x09570, 0x052f2, 0x04970, 0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, // 2070
  0x186e3, 0x092e0, 0x1c8d7, 0x0c950, 0x0d4a0, 0x0d5a0, 0x16aa0, 0x056d0, 0x04ae0, 0x0a5d0, // 2080
  0x0502d, 0x0d43a, 0x0d5a0, 0x0d554, 0x0b540, 0x0d6a0, 0x0ada0, 0x095b0, 0x14979, 0x04970, // 2090
  0x0a497, 0x0b4b0, 0x0b5a0, 0x06b50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970, // 2100
];

export interface LunarDate {
  year: number;
  month: number;
  day: number;
  isLeapMonth: boolean;
}

export interface SolarDate {
  year: number;
  month: number;
  day: number;
}

/**
 * Converts solar (Gregorian) date to lunar date
 * @param year Solar year (1900-2100)
 * @param month Solar month (1-12)
 * @param day Solar day (1-31)
 * @returns Lunar date with isLeapMonth flag
 */
export function solarToLunar(year: number, month: number, day: number): LunarDate {
  // Calculate days since 1900-01-31 (lunar calendar reference)
  const daysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
  // Check leap year
  const isLeapYear = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  if (isLeapYear(year)) daysInMonth[2] = 29;
  
  let totalDays = 0;
  for (let y = 1900; y < year; y++) {
    totalDays += isLeapYear(y) ? 366 : 365;
  }
  for (let m = 1; m < month; m++) {
    totalDays += daysInMonth[m] ?? 0;
  }
  totalDays += day - 30; // Adjust for 1900-01-31 reference
  
  // Find lunar year and day within that year
  let lunarYear = 1900;
  let lunarYearDays = 384; // Days in lunar year 1900 (leap year with 13 months)
  
  while (totalDays >= lunarYearDays) {
    totalDays -= lunarYearDays;
    lunarYear++;
    
    if (lunarYear > 2100) {
      return { year: lunarYear - 1, month: 12, day: 30, isLeapMonth: false };
    }
    
    lunarYearDays = getLunarYearDays(lunarYear);
  }
  
  // Find lunar month and day
  let lunarMonth = 1;
  let isLeapMonth = false;
  let monthDays: number;
  
  while (true) {
    monthDays = getLunarMonthDays(lunarYear, lunarMonth);
    
    if (totalDays < monthDays) break;
    
    totalDays -= monthDays;
    lunarMonth++;
    
    // Check for leap month
    if (lunarMonth > 12) {
      lunarMonth = 1;
      isLeapMonth = !isLeapMonth;
    }
  }
  
  const lunarDay = totalDays + 1;
  
  return {
    year: lunarYear,
    month: lunarMonth,
    day: lunarDay,
    isLeapMonth: hasLeapMonth(lunarYear) && isLeapMonth && lunarMonth === getLeapMonth(lunarYear)
  };
}

/**
 * Gets total days in a lunar year (353-385 days)
 */
function getLunarYearDays(lunarYear: number): number {
  let days = 0;
  for (let i = 1; i <= 12; i++) {
    days += getLunarMonthDays(lunarYear, i);
  }
  if (hasLeapMonth(lunarYear)) {
    days += getLunarMonthDays(lunarYear, getLeapMonth(lunarYear));
  }
  return days;
}

/**
 * Gets days in a specific lunar month (29 or 30)
 */
function getLunarMonthDays(lunarYear: number, month: number): number {
  if (lunarYear < 1900 || lunarYear > 2100) return 0;
  
  const yearData = LUNAR_CALENDAR[lunarYear - 1900];
  if (!yearData) return 0;
  // Bits 4-15 contain month day info (0 = 29 days, 1 = 30 days)
  const monthBit = (yearData >> (16 - month)) & 1;
  return monthBit === 1 ? 30 : 29;
}

/**
 * Checks if lunar year has a leap month
 */
function hasLeapMonth(lunarYear: number): boolean {
  if (lunarYear < 1900 || lunarYear > 2100) return false;
  const yearData = LUNAR_CALENDAR[lunarYear - 1900];
  if (!yearData) return false;
  return (yearData & 0x0f) !== 0;
}

/**
 * Gets the leap month number (1-12), or 0 if no leap month
 */
function getLeapMonth(lunarYear: number): number {
  if (lunarYear < 1900 || lunarYear > 2100) return 0;
  const yearData = LUNAR_CALENDAR[lunarYear - 1900];
  if (!yearData) return 0;
  return yearData & 0x0f;
}

/**
 * Converts lunar date to solar date
 * @param lunarYear Lunar year
 * @param lunarMonth Lunar month
 * @param lunarDay Lunar day
 * @param isLeapMonth Is this a leap month?
 * @returns Solar date
 */
export function lunarToSolar(lunarYear: number, lunarMonth: number, lunarDay: number, isLeapMonth: boolean = false): SolarDate {
  // Calculate days from lunar year 1900 to target date
  let totalDays = 0;
  
  for (let y = 1900; y < lunarYear; y++) {
    totalDays += getLunarYearDays(y);
  }
  
  for (let m = 1; m < lunarMonth; m++) {
    totalDays += getLunarMonthDays(lunarYear, m);
  }
  
  if (isLeapMonth && hasLeapMonth(lunarYear)) {
    const leapMonth = getLeapMonth(lunarYear);
    totalDays += getLunarMonthDays(lunarYear, leapMonth);
  }
  
  totalDays += lunarDay - 1;
  
  // Convert to solar date starting from 1900-01-31
  let solarYear = 1900;
  let solarMonth = 1;
  let solarDay = 31;
  
  const daysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const isLeapYear = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  
  while (totalDays > 0) {
    if (isLeapYear(solarYear)) daysInMonth[2] = 29;
    else daysInMonth[2] = 28;
    
    const daysLeftInMonth = (daysInMonth[solarMonth] ?? 0) - solarDay;
    
    if (totalDays > daysLeftInMonth) {
      totalDays -= daysLeftInMonth + 1;
      solarDay = 1;
      solarMonth++;
      if (solarMonth > 12) {
        solarMonth = 1;
        solarYear++;
      }
    } else {
      solarDay += totalDays;
      totalDays = 0;
    }
  }
  
  return { year: solarYear, month: solarMonth, day: solarDay };
}
