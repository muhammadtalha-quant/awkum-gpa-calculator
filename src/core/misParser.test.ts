import { describe, it, expect } from 'vitest';
import { parseMISText } from './misParser';

describe('MIS Parser', () => {
  it('should parse valid MIS copy-paste data correctly', () => {
    const rawData = `
1\tIntroduction To Management (SS-306)\tMr. Haider Zaman\t
21
20
35
76
-
2\tCalculus I (MTH-101)\tDr. Smith\t
10
10
20
40
-
`;
    const result = parseMISText(rawData);
    expect(result.length).toBe(2);
    expect(result[0]).toEqual({ code: 'SS-306', name: 'Introduction To Management', marks: 76 });
    expect(result[1]).toEqual({ code: 'MTH-101', name: 'Calculus I', marks: 40 });
  });

  it('should handle missing retotling dash and stop appropriately', () => {
    const rawData = `
1\tLinear Algebra (MTH-102)\tTutor\t
15
20
50
85
2\tPhysics (PHY-101)\tTutor\t
90
`;
    const result = parseMISText(rawData);
    expect(result.length).toBe(2);
    expect(result[0].name).toBe('Linear Algebra');
    expect(result[0].marks).toBe(85);
    expect(result[1].name).toBe('Physics');
    expect(result[1].marks).toBe(90);
  });

  it('should deduplicate subjects based on code', () => {
    const rawData = `
1\tData Structures (CS-201)\tTutor\t
10
10
10
30
-
2\tData Structures (CS-201)\tTutor\t
40
10
20
70
-
`;
    const result = parseMISText(rawData);
    expect(result.length).toBe(1);
    expect(result[0]).toEqual({ code: 'CS-201', name: 'Data Structures', marks: 70 });
  });

  it('should ignore invalid marks (>100 or <=0)', () => {
    const rawData = `
1\tInvalid Mark High (INV-101)\tTutor\t
10
10
10
110
-
2\tInvalid Mark Low (INV-102)\tTutor\t
0
0
0
0
-
`;
    const result = parseMISText(rawData);
    expect(result.length).toBe(0);
  });

  it('should extract correct name even with row number without tabs', () => {
    const rawData = `12\tMachine Learning (CS-405)\tTutor
20
20
40
80
-`;
    const result = parseMISText(rawData);
    expect(result.length).toBe(1);
    expect(result[0]).toEqual({ code: 'CS-405', name: 'Machine Learning', marks: 80 });
  });
});
