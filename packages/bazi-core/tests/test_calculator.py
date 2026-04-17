# packages/bazi-core/tests/test_calculator.py
import unittest
from bazi.calculator import calculate_bazi

class TestCalculator(unittest.TestCase):
    def test_bazi(self):
        """Test basic bazi calculation with known values"""
        # 测试用例：1990年1月1日8点，上海坐标
        bazi = calculate_bazi(1990, 1, 1, 8, 121.47, 31.23)
        self.assertEqual(bazi['year'], '庚午')
        self.assertEqual(bazi['month'], '丁丑')
        self.assertEqual(bazi['day'], '丙子')
        self.assertEqual(bazi['hour'], '庚寅')

    def test_edge_case_leap_year(self):
        """Test edge case with leap year (Feb 29)"""
        # 2000年是闰年，2月29日有效
        bazi = calculate_bazi(2000, 2, 29, 12, 0, 0)
        # Verify result is a valid bazi (4 elements with valid Chinese characters)
        self.assertIn('year', bazi)
        self.assertIn('month', bazi)
        self.assertIn('day', bazi)
        self.assertIn('hour', bazi)
        
        # Verify each element has exactly 2 characters (tigan + dizhi)
        self.assertEqual(len(bazi['year']), 2)
        self.assertEqual(len(bazi['month']), 2)
        self.assertEqual(len(bazi['day']), 2)
        self.assertEqual(len(bazi['hour']), 2)

    def test_edge_case_year_boundaries(self):
        """Test edge cases for year boundaries"""
        # Test beginning of year
        bazi_jan = calculate_bazi(2000, 1, 1, 0, 120, 30)
        self.assertIsNotNone(bazi_jan)
        
        # Test end of year
        bazi_dec = calculate_bazi(2000, 12, 31, 23, 120, 30)
        self.assertIsNotNone(bazi_dec)

    def test_edge_case_coordinates(self):
        """Test edge cases for longitude and latitude"""
        # Test with extreme coordinates
        bazi_poles = calculate_bazi(2000, 6, 15, 12, 180, 90)
        self.assertIsNotNone(bazi_poles)
        
        bazi_antimeridian = calculate_bazi(2000, 6, 15, 12, -180, -90)
        self.assertIsNotNone(bazi_antimeridian)

if __name__ == '__main__':
    unittest.main()
