import { describe, it, expect } from 'vitest';
import {
  calculateSGPA,
  getProbationStatus,
  calculateRequiredSGPA,
  gpToMinMarks,
  calculateProjectedCGPA,
  getRetakeImpact,
  getRequiredGPForTargetCGPA,
  distributeRetakeMarks,
  calculateRequiredMarks,
} from './engine';
import { asGP, asProgramCredit, asSubjectCredit, Credit } from '../types';

describe('GPA Engine', () => {
  describe('calculateSGPA', () => {
    it('should return 0.00 for empty data', () => {
      expect(calculateSGPA([])).toBe(0);
    });

    it('should calculate SGPA correctly for a single subject', () => {
      const data = [{ gradePoint: asGP(3.5), credits: asSubjectCredit(3) }];
      expect(calculateSGPA(data)).toBe(3.5);
    });

    it('should calculate SGPA correctly for multiple subjects', () => {
      const data = [
        { gradePoint: asGP(4.0), credits: asSubjectCredit(3) },
        { gradePoint: asGP(3.0), credits: asSubjectCredit(3) },
      ];
      // (4*3 + 3*3) / 6 = (12+9)/6 = 21/6 = 3.5
      expect(calculateSGPA(data)).toBe(3.5);
    });

    it('should round SGPA to 2 decimal places', () => {
      const data = [
        { gradePoint: asGP(3.33), credits: asSubjectCredit(3) },
        { gradePoint: asGP(3.67), credits: asSubjectCredit(3) },
        { gradePoint: asGP(4.0), credits: asSubjectCredit(2) },
      ];
      // (3.33*3 + 3.67*3 + 4.0*2) / 8 = (9.99 + 11.01 + 8) / 8 = 29 / 8 = 3.625 -> 3.63
      expect(calculateSGPA(data)).toBe(3.63);
    });
  });

  describe('getProbationStatus', () => {
    it('should return PROBATION for cgpa < 2.0', () => {
      expect(getProbationStatus(0.0)).toBe('PROBATION');
      expect(getProbationStatus(1.99)).toBe('PROBATION');
    });
    it('should return WARNING for cgpa < 2.5', () => {
      expect(getProbationStatus(2.0)).toBe('WARNING');
      expect(getProbationStatus(2.49)).toBe('WARNING');
    });
    it('should return SATISFACTORY for cgpa < 3.0', () => {
      expect(getProbationStatus(2.5)).toBe('SATISFACTORY');
      expect(getProbationStatus(2.99)).toBe('SATISFACTORY');
    });
    it('should return GOOD for cgpa < 3.75', () => {
      expect(getProbationStatus(3.0)).toBe('GOOD');
      expect(getProbationStatus(3.74)).toBe('GOOD');
    });
    it('should return DISTINCTION for cgpa >= 3.75', () => {
      expect(getProbationStatus(3.75)).toBe('DISTINCTION');
      expect(getProbationStatus(4.0)).toBe('DISTINCTION');
    });
  });

  describe('calculateRequiredSGPA', () => {
    it('should return ACHIEVED if target is already hit', () => {
      // Current: 3.5 (30 cr) -> QP: 105
      // Target: 2.0 (45 cr) -> QP: 90. We exceed it.
      expect(calculateRequiredSGPA(3.5, 30, 2.0, 15)).toBe('ACHIEVED');
    });
    it('should return IMPOSSIBLE if required SGPA is > 4.0', () => {
      expect(calculateRequiredSGPA(2.0, 30, 3.5, 15)).toBe('IMPOSSIBLE');
    });
    it('should calculate the exact SGPA needed', () => {
      // Current: 3.0 (30 cr) -> QP: 90
      // Target: 3.2 (45 cr) -> QP: 144
      // Required QP: 54 / 15 credits = 3.6
      expect(calculateRequiredSGPA(3.0, 30, 3.2, 15)).toBe(3.6);
    });
  });

  describe('gpToMinMarks', () => {
    it('should return 50 for GP < 2.0', () => {
      expect(gpToMinMarks(1.5)).toBe(50);
    });
    it('should return 90 for GP >= 4.0', () => {
      expect(gpToMinMarks(4.0)).toBe(90);
    });
    it('should calculate precisely for mid ranges', () => {
      // 3.0 -> (3.0 - 2.0)/0.05 + 50 = 70
      expect(gpToMinMarks(3.0)).toBe(70);
      // 3.5 -> (3.5 - 2.0)/0.05 + 50 = 80
      expect(gpToMinMarks(3.5)).toBe(80);
    });
  });

  describe('calculateRequiredMarks', () => {
    it('should return ACHIEVED if remaining credits <= 0', () => {
      expect(calculateRequiredMarks(50, 20, 0, 3.0)).toBe('ACHIEVED');
    });
    it('should calculate required marks correctly', () => {
      // Total 20 credits, Target 3.0 -> 60 QP
      // Filled 15 credits with GP 3.0 -> 45 QP
      // Remaining 5 credits need 15 QP -> GP 3.0 -> 70 marks
      expect(calculateRequiredMarks(45, 20, 5, 3.0)).toBe(70);
    });
  });

  describe('calculateProjectedCGPA', () => {
    it('should calculate worst mode (2.0)', () => {
      const sems = [{ sgpa: asGP(3.5), credits: asProgramCredit(15) }];
      expect(calculateProjectedCGPA(sems, 'worst', 15)).toBe(2.75); // (3.5*15 + 2.0*15) / 30
    });
    it('should calculate best mode (4.0)', () => {
      const sems = [{ sgpa: asGP(3.5), credits: asProgramCredit(15) }];
      expect(calculateProjectedCGPA(sems, 'best', 15)).toBe(3.75); // (3.5*15 + 4.0*15) / 30
    });
    it('should calculate expected mode (historical avg)', () => {
      const sems = [{ sgpa: asGP(3.5), credits: asProgramCredit(15) }];
      expect(calculateProjectedCGPA(sems, 'expected', 15)).toBe(3.5); // avg 3.5
    });
  });

  describe('getRetakeImpact', () => {
    it('should correctly calculate the impact of a retake', () => {
      const sems = [
        {
          id: 'sem1',
          sgpa: asGP(2.0),
          credits: asProgramCredit(15),
          subjects: [
            { id: 'sub1', credits: asSubjectCredit(3), gradePoint: asGP(1.0) },
            { id: 'sub2', credits: asSubjectCredit(6), gradePoint: asGP(2.25) },
            { id: 'sub3', credits: asSubjectCredit(6), gradePoint: asGP(2.25) },
          ],
        },
      ];
      const result = getRetakeImpact(sems, asGP(3.5), 'sub1', 'sem1');
      expect(result.delta).toBeGreaterThan(0);
      expect(result.newCGPA).toBe(2.5); // QP diff is 2.5 * 3 = 7.5. old req 30 + 7.5 = 37.5 / 15 = 2.5
    });
  });

  describe('getRequiredGPForTargetCGPA', () => {
    it('should compute required GP correctly', () => {
      const sems = [
        {
          id: 'sem1',
          sgpa: asGP(2.0),
          credits: asProgramCredit(15),
          subjects: [{ id: 'sub1', credits: 3 as Credit, gradePoint: asGP(1.0) }],
        },
      ];
      // Current QP: 30
      // Target CGPA: 2.2 -> Target QP: 33 (delta 3)
      // sub1 current QP: 1.0 * 3 = 3
      // sub1 needs to provide 6 QP -> GP 2.0
      expect(getRequiredGPForTargetCGPA(sems, 'sem1', 'sub1', 2.2)).toBe(2);
    });
  });

  describe('distributeRetakeMarks', () => {
    it('should iteratively redistribute residuals when capping at 4.0', () => {
      const sems = [
        {
          id: 'sem1',
          sgpa: asGP(1.0),
          credits: asProgramCredit(6),
          subjects: [
            {
              id: 'sub1',
              name: 'A',
              marks: 50,
              gradePoint: asGP(2.0),
              credits: asSubjectCredit(3),
            },
            {
              id: 'sub2',
              name: 'B',
              marks: 10,
              gradePoint: asGP(0.0),
              credits: asSubjectCredit(3),
            },
          ],
        },
      ];
      // Target CGPA 3.5 requires 21 QP. Current QP: 6. Shortage: 15.
      // E.q. sub1 gets 7.5 -> 2.0+2.5=4.5 (cap 4.0, 1.5 residual)
      // sub2 gets 7.5 -> 0.0+2.5=2.5 (gets 1.5 more -> 3.0)
      const result = distributeRetakeMarks(sems, 3.5);
      expect(Array.isArray(result)).toBe(true);
      if (Array.isArray(result)) {
        expect(result.find((r: any) => r.subjectId === 'sub1')?.requiredGP).toBe(4.0);
        expect(result.find((r: any) => r.subjectId === 'sub2')?.requiredGP).toBe(3.0);
      }
    });

    it('should return NO_ELIGIBLE if no subjects are eligible', () => {
      const sems = [
        {
          id: '1',
          sgpa: asGP(4.0),
          credits: asProgramCredit(3),
          subjects: [{ id: '1', marks: 80, gradePoint: 4.0, credits: 3 }],
        },
      ];
      expect(distributeRetakeMarks(sems, 3.0)).toBe('NO_ELIGIBLE');
    });

    it('should return NO_ELIGIBLE if target is already hit', () => {
      const sems = [
        {
          id: '1',
          sgpa: asGP(3.0),
          credits: asProgramCredit(3),
          subjects: [{ id: '1', marks: 50, gradePoint: 2.0, credits: 3 }],
        },
      ];
      expect(distributeRetakeMarks(sems, 2.5)).toBe('NO_ELIGIBLE');
    });

    it('should distribute marks for eligible subjects', () => {
      const sems = [
        {
          id: 'sem1',
          sgpa: asGP(1.0),
          credits: asProgramCredit(6),
          subjects: [
            { id: 'sub1', name: 'A', marks: 40, gradePoint: 0.0, credits: 3 },
            { id: 'sub2', name: 'B', marks: 45, gradePoint: 0.0, credits: 3 },
          ],
        },
      ];
      // Current QP for this specific test case reflects a 0.00 base.
      // distributeRetakeMarks re-calculates based on CGPA target: Target 2.0 * 6 = 12 QP
      // Need 12 QP. Each gives 6 QP -> GP 2.0 -> Marks 50
      const result = distributeRetakeMarks(sems, 2.0);
      expect(Array.isArray(result)).toBe(true);
      if (Array.isArray(result)) {
        expect(result[0].requiredMarks).toBe(50);
        expect(result[1].requiredMarks).toBe(50);
      }
    });
  });
});
