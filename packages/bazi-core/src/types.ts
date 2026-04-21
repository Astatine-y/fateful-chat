export type GanZhi = string;
export type WuXing = '木' | '火' | '土' | '金' | '水';
export type ShiShen = '比肩' | '劫财' | '食神' | '伤官' | '偏财' | '正财' | '七杀' | '正官' | '偏印' | '正印' | string;

export interface BaziInput {
  year: number;     // 出生年份
  month: number;    // 出生月份 (1-12)
  day: number;      // 出生日期 (1-31)
  hour: number;     // 出生时辰 (0-23)
  gender: 'male' | 'female';  // 性别
  timezone?: number; // 时区 (默认8 = UTC+8)
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
