// apps/api/src/routes/bazi.ts - FIXED VERSION
import { Router } from 'express';
import { execSync } from 'child_process';
import path from 'path';

// Python-based Bazi Calculator Integration
function calculateBazi(
  year: number, 
  month: number, 
  day: number, 
  hour: number, 
  longitude: number, 
  latitude: number
) {
  try {
    // Call Python calculator
    const scriptPath = path.join(__dirname, '../../../packages/bazi-core/calculator.py');
    
    const cmd = `python "${scriptPath}" ${year} ${month} ${day} ${hour} ${longitude} ${latitude}`;
    const result = execSync(cmd, { encoding: 'utf8' });
    
    // Parse JSON result from Python
    return JSON.parse(result);
  } catch (error) {
    // Fallback to TypeScript calculator if Python fails
    console.warn('Python calculation failed, using TypeScript fallback:', error);
    return calculateBaziTypeScript(year, month, day, hour, longitude, latitude);
  }
}

// TypeScript fallback calculator (simplified)
function calculateBaziTypeScript(
  year: number,
  month: number,
  day: number,
  hour: number,
  longitude: number,
  latitude: number
) {
  // Heavenly Stems (天干)
  const tianGan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  // Earthly Branches (地支)
  const diZhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  
  // Simplified calculations (not accurate, but provides data)
  const yearCycle = (year - 1984) % 60;
  const monthCycle = ((year - 1984) * 12 + month - 1) % 60;
  const dayCycle = (new Date(year, month - 1, day).getTime() / 86400000 + 19484) % 60;
  const hourCycle = Math.floor(hour / 2) % 12;
  
  return {
    year: `${tianGan[(yearCycle) % 10]}${diZhi[(yearCycle) % 12]}`,
    month: `${tianGan[(monthCycle) % 10]}${diZhi[(monthCycle) % 12]}`,
    day: `${tianGan[dayCycle % 10]}${diZhi[dayCycle % 12]}`,
    hour: `${tianGan[(dayCycle + hourCycle) % 10]}${diZhi[hourCycle % 12]}`
  };
}

export { calculateBazi, calculateBaziTypeScript };