/**
 * AWKUM Course Code Validation
 * Format: 2-6 letters, hyphen, 3-4 digits (e.g. CS-113, MATH-1010)
 */
export const isValidCourseCode = (code: string): boolean => {
  const regex = /^[A-Z]{2,6}-\d{3,4}$/;
  return regex.test(code.toUpperCase());
};

export const sanitizeSubjectName = (name: string): string => {
  return name.replace(/[^A-Za-z0-9\s\-.()']/g, '').slice(0, 100);
};
