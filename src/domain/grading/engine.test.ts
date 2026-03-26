import { describe, it, expect } from 'vitest';
import { calculateGradePoint, getLetterFromGP } from './engine';
import { asMark, asGP } from '../types';

describe('Grading Engine', () => {
  describe('calculateGradePoint', () => {
    it('should return 4.0 for marks >= 90', () => {
      expect(calculateGradePoint(asMark(90))).toBe(4.0);
      expect(calculateGradePoint(asMark(100))).toBe(4.0);
    });
    it('should return 0.0 for marks < 50', () => {
      expect(calculateGradePoint(asMark(49))).toBe(0.0);
      expect(calculateGradePoint(asMark(0))).toBe(0.0);
    });
    it('should calculate GP correctly for marks between 50 and 89', () => {
      // 50 marks -> 2.0
      expect(calculateGradePoint(asMark(50))).toBe(2.0);
      // 70 marks -> 2.0 + (70 - 50)*0.05 = 3.0
      expect(calculateGradePoint(asMark(70))).toBe(3.0);
      // 85 marks -> 2.0 + (85 - 50)*0.05 = 3.75
      expect(calculateGradePoint(asMark(85))).toBe(3.75);
    });
  });

  describe('getLetterFromGP', () => {
    it('should return correct letters for GP tiers', () => {
      expect(getLetterFromGP(asGP(4.0))).toBe('A+');
      expect(getLetterFromGP(asGP(3.8))).toBe('A');
      expect(getLetterFromGP(asGP(3.6))).toBe('A-');
      expect(getLetterFromGP(asGP(3.4))).toBe('B+');
      expect(getLetterFromGP(asGP(3.1))).toBe('B');
      expect(getLetterFromGP(asGP(2.8))).toBe('B-');
      expect(getLetterFromGP(asGP(2.6))).toBe('C+');
      expect(getLetterFromGP(asGP(2.3))).toBe('C');
      expect(getLetterFromGP(asGP(2.1))).toBe('C-');
      expect(getLetterFromGP(asGP(1.5))).toBe('F');
    });
  });
});
