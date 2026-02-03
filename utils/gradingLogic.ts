
export function calculateGradePoint(marks: number): number {
  const roundedMarks = Math.round(marks);
  if (roundedMarks >= 90) return 4.00;
  if (roundedMarks < 50) return 0.00;
  // AWKUM Linear Formula: 2.00 + (Marks - 50) * 0.05
  return 2.00 + (roundedMarks - 50) * 0.05;
}

export function getLetterFromGP(gp: number): string {
  if (gp >= 4.00) return 'A+';
  if (gp >= 3.75) return 'A';
  if (gp >= 3.50) return 'A-';
  if (gp >= 3.25) return 'B+';
  if (gp >= 3.00) return 'B';
  if (gp >= 2.75) return 'B-';
  if (gp >= 2.50) return 'C+';
  if (gp >= 2.25) return 'C';
  if (gp >= 2.00) return 'C-';
  return 'F';
}
