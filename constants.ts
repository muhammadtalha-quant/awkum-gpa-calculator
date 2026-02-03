
import { GradeRange } from './types';

// Using local file as requested
export const AWKUM_LOGO_URL = '/AWKUM.png';


export const PROGRAMMES = [
  "Undergraduate (BS)",
  "Graduation(MS)",
  "M.Phil",
  "Ph.D"
];

export const GRADE_RANGES: GradeRange[] = [
  { label: 'A+', min: 90, max: 100, gpRange: '4.00' },
  { label: 'A',  min: 85, max: 89,  gpRange: '3.75 - 3.95' },
  { label: 'A-', min: 80, max: 84,  gpRange: '3.50 - 3.70' },
  { label: 'B+', min: 75, max: 79,  gpRange: '3.25 - 3.45' },
  { label: 'B',  min: 70, max: 74,  gpRange: '3.00 - 3.20' },
  { label: 'B-', min: 65, max: 69,  gpRange: '2.75 - 2.95' },
  { label: 'C+', min: 60, max: 64,  gpRange: '2.50 - 2.70' },
  { label: 'C',  min: 55, max: 59,  gpRange: '2.25 - 2.45' },
  { label: 'C-', min: 50, max: 54,  gpRange: '2.00 - 2.20' },
  { label: 'F',  min: 0,  max: 49,  gpRange: '0.00' },
];

export const COLORS = {
  primary: '#005AC1',
  primaryContainer: '#D8E2FF',
  onPrimaryContainer: '#001A41',
  surface: '#FEF7FF',
  error: '#BA1A1A',
  secondary: '#575E71'
};
