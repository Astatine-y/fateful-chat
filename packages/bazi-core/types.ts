// packages/bazi-core/types.ts
export interface BaziInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  longitude: number;
  latitude: number;
}

export interface BaziResult {
  year: string;
  month: string;
  day: string;
  hour: string;
}

export interface BaziResponse {
  bazi: BaziResult;
  interpretation: string;
}

export interface GanZhi {
  tg: number;
  dz: number;
}
