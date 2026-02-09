export type ThemeType = 'tokyonight' | 'catppuccin' | 'gruvbox';
export type ThemeMode = 'light' | 'dark';

export interface SGPASubject {
  id: string;
  name: string;
  code?: string;
  credits: number | string;
  marks: number | string;
  gradePoint: number;
  gradeLetter: string;
  isLocked: boolean;
}

export interface CGPASemester {
  id: string;
  name: string;
  sgpa: number | string;
  credits: number | string;
  gradeLetter: string;
  isLocked: boolean;
  subjects?: SGPASubject[];
}

export interface GradeRange {
  label: string;
  min: number;
  max: number;
  gpRange: string;
}

export interface UserInfo {
  name: string;
  fatherName: string;
  registrationNumber: string;
  programme: string;
  semester: string;
  section: string;
  subject: string;
  minor?: string;
  isCompleted?: boolean;
  totalDuration?: string;
  isVerified?: boolean;
  photo?: string; // base64
}