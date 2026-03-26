/**
 * Branded Types for Domain Integrity
 */

export type Mark = number & { readonly __brand: 'Mark' };
export type Credit = number & { readonly __brand: 'Credit' };
export type GradePoint = number & { readonly __brand: 'GradePoint' };

export interface SGPASubject {
  id: string;
  name: string;
  code?: string;
  credits: Credit;
  marks: Mark | '';
  gradePoint: GradePoint;
  gradeLetter: string;
  isLocked?: boolean;
}

export interface CGPASemester {
  id: string;
  name: string;
  sgpa: GradePoint;
  credits: Credit;
  subjects?: SGPASubject[];
  gradeLetter?: string;
  isLocked?: boolean;
}

export interface UserInfo {
  name: string;
  fatherName: string;
  registrationNumber: string;
  programme: string;
  subject: string;
  semester: string;
  section: string;
  photo?: string;
  minor?: string;
  isCompleted?: boolean;
  totalDuration?: string;
  isVerified?: boolean;
}

// Type Guards & Constructors
export const asMark = (n: number): Mark => {
  if (n < 0 || n > 100) throw new Error('Invalid Mark');
  return n as Mark;
};

export const asSubjectCredit = (n: number): Credit => {
  if (n < 1 || n > 6) throw new Error('Invalid subject credit hours');
  return n as Credit;
};

export const asProgramCredit = (n: number): Credit => {
  if (n < 0 || n > 216) throw new Error('Invalid total program credits');
  return n as Credit;
};

export const asGP = (n: number): GradePoint => {
  if (n < 0 || n > 4) throw new Error('Invalid GP');
  return n as GradePoint;
};

// UI & Theme Types
export type ThemeType = 'tokyonight' | 'catppuccin' | 'gruvbox';
export type ThemeMode = 'light' | 'dark';

export interface GradeRange {
  label: string;
  min: number;
  max: number;
  gpRange: string;
}
