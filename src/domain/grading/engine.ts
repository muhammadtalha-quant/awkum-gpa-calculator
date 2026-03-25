import { Mark, GradePoint, asGP } from '../types';

/**
 * AWKUM Linear Formula: 2.00 + (Marks - 50) * 0.05
 * Ceiling: 90+ = 4.00
 * Floor: <50 = 0.00
 */
export function calculateGradePoint(marks: Mark): GradePoint {
  const roundedMarks = Math.round(marks);
  if (roundedMarks >= 90) return asGP(4.0);
  if (roundedMarks < 50) return asGP(0.0);

  const gp = 2.0 + (roundedMarks - 50) * 0.05;
  return asGP(Number(gp.toFixed(2)));
}

export function getLetterFromGP(gp: GradePoint): string {
  if (gp >= 4.0) return 'A+';
  if (gp >= 3.75) return 'A';
  if (gp >= 3.5) return 'A-';
  if (gp >= 3.25) return 'B+';
  if (gp >= 3.0) return 'B';
  if (gp >= 2.75) return 'B-';
  if (gp >= 2.5) return 'C+';
  if (gp >= 2.25) return 'C';
  if (gp >= 2.0) return 'C-';
  return 'F';
}
