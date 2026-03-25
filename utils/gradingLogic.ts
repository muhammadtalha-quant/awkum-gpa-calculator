export function calculateGradePoint(marks: number): number {
  const roundedMarks = Math.round(marks);
  if (roundedMarks >= 90) return 4.0;
  if (roundedMarks < 50) return 0.0;
  // AWKUM Linear Formula: 2.00 + (Marks - 50) * 0.05
  return 2.0 + (roundedMarks - 50) * 0.05;
}

export function getLetterFromGP(gp: number): string {
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
