// apps/api/src/validators/bazi.ts
import { BaziRequest } from '../types';

export function validateBaziInput(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate year
  if (typeof data.year !== 'number' || data.year < 1900 || data.year > 2100) {
    errors.push('Year must be between 1900 and 2100');
  }

  // Validate month
  if (typeof data.month !== 'number' || data.month < 1 || data.month > 12) {
    errors.push('Month must be between 1 and 12');
  }

  // Validate day
  if (typeof data.day !== 'number' || data.day < 1 || data.day > 31) {
    errors.push('Day must be between 1 and 31');
  }

  // Validate hour
  if (typeof data.hour !== 'number' || data.hour < 0 || data.hour > 23) {
    errors.push('Hour must be between 0 and 23');
  }

  // Validate longitude
  if (typeof data.longitude !== 'number' || data.longitude < -180 || data.longitude > 180) {
    errors.push('Longitude must be between -180 and 180');
  }

  // Validate latitude
  if (typeof data.latitude !== 'number' || data.latitude < -90 || data.latitude > 90) {
    errors.push('Latitude must be between -90 and 90');
  }

  // Validate gender (optional)
  if (data.gender && !['male', 'female'].includes(data.gender)) {
    errors.push('Gender must be "male" or "female"');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
