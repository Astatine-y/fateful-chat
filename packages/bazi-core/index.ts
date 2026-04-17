// packages/bazi-core/index.ts
import { calculateBazi } from './calculator';

export function getBazi(
  year: number,
  month: number,
  day: number,
  hour: number,
  longitude: number,
  latitude: number
) {
  return calculateBazi(year, month, day, hour, longitude, latitude);
}

export default getBazi;