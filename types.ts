
export interface SGPASubject {
  id: string;
  name: string;
  credits: number | string;
  marks: number | string;
  gradePoint: number;
  gradeLetter: string;
}

export interface CGPASemester {
  id: string;
  name: string;
  sgpa: number | string;
  credits: number | string;
  gradeLetter: string;
}

export interface GradeRange {
  label: string;
  min: number;
  max: number;
  gpRange: string;
}
