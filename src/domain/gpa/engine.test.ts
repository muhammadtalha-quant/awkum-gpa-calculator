import { describe, it, expect } from 'vitest';
import { calculateSGPA, calculateCGPA } from './engine';
import { asGP, asCredit } from '../types';

describe('GPA Engine', () => {
  describe('calculateSGPA', () => {
    it('should return 0.00 for empty data', () => {
      expect(calculateSGPA([])).toBe(0);
    });

    it('should calculate SGPA correctly for a single subject', () => {
      const data = [{ gradePoint: asGP(3.5), credits: asCredit(3) }];
      expect(calculateSGPA(data)).toBe(3.5);
    });

    it('should calculate SGPA correctly for multiple subjects', () => {
      const data = [
        { gradePoint: asGP(4.0), credits: asCredit(3) },
        { gradePoint: asGP(3.0), credits: asCredit(3) },
      ];
      // (4*3 + 3*3) / 6 = (12+9)/6 = 21/6 = 3.5
      expect(calculateSGPA(data)).toBe(3.5);
    });

    it('should round SGPA to 2 decimal places', () => {
      const data = [
        { gradePoint: asGP(3.33), credits: asCredit(3) },
        { gradePoint: asGP(3.67), credits: asCredit(3) },
        { gradePoint: asGP(4.0), credits: asCredit(2) },
      ];
      // (3.33*3 + 3.67*3 + 4.0*2) / 8 = (9.99 + 11.01 + 8) / 8 = 29 / 8 = 3.625 -> 3.63
      expect(calculateSGPA(data)).toBe(3.63);
    });
  });

  describe('calculateCGPA', () => {
    it('should calculate CGPA based on semesters', () => {
      const semesters = [
        { sgpa: asGP(3.5), credits: asCredit(15) },
        { sgpa: asGP(3.8), credits: asCredit(18) },
      ];
      // (3.5*15 + 3.8*18) / 33 = (52.5 + 68.4) / 33 = 120.9 / 33 = 3.6636... -> 3.66
      expect(calculateCGPA(semesters)).toBe(3.66);
    });
  });
});
