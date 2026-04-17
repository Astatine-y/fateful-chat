# packages/bazi-core/calculator.py
from sxtwl import Lunar
import math

def true_solar_time(year, month, day, hour, longitude):
    # 简化版真太阳时计算（忽略高阶项）
    B = (360 / 365.2422) * (day + hour / 24)
    EoT = 9.87 * math.sin(2 * math.radians(B)) - 7.53 * math.cos(math.radians(B)) - 1.5 * math.sin(math.radians(B))
    true_hour = hour + (longitude - 120) / 15 + EoT / 60
    return true_hour

def calculate_bazi(year, month, day, hour, longitude, latitude):
    # 1. 算真太阳时
    true_hour = true_solar_time(year, month, day, hour, longitude)

    # 2. 转农历（Lunar）
    lunar = Lunar(year, month, day, int(true_hour))

    # 3. 八字四柱
    bazi = {
        'year': lunar.getYearGZ(),
        'month': lunar.getMonthGZ(),
        'day': lunar.getDayGZ(),
        'hour': lunar.getHourGZ(int(true_hour)),
    }

    # 转中文显示
    tigan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
    dizhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

    result = {}
    for k, gz in bazi.items():
        tg = tigan[gz.tg]
        dz = dizhi[gz.dz]
        result[k] = f'{tg}{dz}'

    return result