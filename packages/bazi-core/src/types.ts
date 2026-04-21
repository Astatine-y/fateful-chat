export type GanZhi = string;
export type WuXing = '木' | '火' | '土' | '金' | '水';
export type ShiShen = '比肩' | '劫财' | '食神' | '伤官' | '偏财' | '正财' | '七杀' | '正官' | '偏印' | '正印' | string;

export interface BaziInput {
  year: number;     // 出生年份
  month: number;    // 出生月份 (1-12)
  day: number;      // 出生日期 (1-31)
  hour: number;     // 出生时辰 (0-23)
  gender: 'male' | 'female';  // 性别
  longitude?: number; // 出生地经度 (用于计算真太阳时)
  latitude?: number;  // 出生地纬度
  timezone?: number; // 时区 (默认8 = UTC+8)
}

export function calculateTimezone(longitude: number): number {
  // Timezone = 经度 / 15 (每15度一个时区)
  // 中国大致在东经73-135度，时区UTC+8
  const tz = Math.round(longitude / 15);
  // Ensure valid timezone range
  return Math.max(-12, Math.min(14, tz));
}

export function longToSolarTime(hour: number, longitude: number, standardLongitude: number = 120): number {
  // 将地方时转换为真太阳时
  // 经度差 = (当地经度 - 标准经度) * 4分钟/度
  const diffMinutes = (longitude - standardLongitude) * 4;
  const solarHour = hour + diffMinutes / 60;
  return Math.max(0, Math.min(23, solarHour));
}

export interface BaziOutput {
  gan_zhi: {
    year: GanZhi;
    month: GanZhi;
    day: GanZhi;
    hour: GanZhi;
  };
  wu_xing: WuXing[];
  shi_shen: ShiShen[];
  da_yun: {
    cycles: Array<{
      number: number;
      startAge: number;
      endAge: number;
      ganZhi: string;
      description: string;
    }>;
  };
  liu_yue: {
    currentYear: number;
    yearlyFortune: string;
    monthlyForecasts: Array<{
      month: number;
      ganZhi: string;
      quality: string;
      description: string;
    }>;
  };
}
