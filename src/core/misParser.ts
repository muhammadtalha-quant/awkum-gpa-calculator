/**
 * AWKUM MIS Result Text Parser — Enhanced for Robust Pattern Recognition
 *
 * Strategy:
 * 1. Loosen regex for course codes (handle more variations).
 * 2. Identify subject block by course code presence.
 * 3. Use heuristic (Math.max) to identify "Total" marks instead of static indexing.
 * 4. Handle "Absent", "Withheld", "-", and secondary numbers gracefully.
 */

export interface ParsedSubject {
  code: string;
  name: string;
  marks: number;
}

// Identifies semester blocks (e.g., "1st Semester (Subject-Wise Scores)")
const SEMESTER_HEADER = /(\d+)(st|nd|rd|th)\s*Semester\s*\(Subject-Wise\s*Scores\)/i;

// More inclusive regex: handle various prefixes and 2-5 digits, optional spaces
const CODE_IN_PARENS = /\(([A-Z]{2,8}\s*-?\s*\d{2,5})\)/i;

// Match numeric marks, including potential abbreviations for 0
const MARK_VALUE = /^\s*(\d{1,3}|ABS|WH|W|R|F|-)\s*$/i;

/**
 * Normalizes mark string to number
 */
function normalizeMark(val: string): number {
  const trimmed = val.trim().toUpperCase();
  if (/^\d{1,3}$/.test(trimmed)) return parseInt(trimmed, 10);
  // ABS, WH, -, etc. all result in 0 marks but are valid rows
  return 0;
}

function extractCourseInfo(line: string): { name: string; code: string } | null {
  const codeMatch = line.match(CODE_IN_PARENS);
  if (!codeMatch) return null;

  const code = codeMatch[1].replace(/\s+/g, '').toUpperCase();

  // Tab-split columns
  const cols = line.split('\t');
  const courseCol = cols.find((c) => CODE_IN_PARENS.test(c)) ?? '';

  // Extract name by removing (CODE) and row headers
  const name = courseCol
    .replace(CODE_IN_PARENS, '')
    .replace(/^\d+\s+/, '')
    .trim();

  return name ? { name, code } : null;
}

export function parseMISText(raw: string, targetSemester?: number): ParsedSubject[] {
  const lines = raw.split(/[\r\n]+/);
  const seen = new Map<string, ParsedSubject>();

  let activeSemester = 1; // Default context
  let i = 0;

  while (i < lines.length) {
    const semMatch = lines[i].match(SEMESTER_HEADER);
    if (semMatch) {
      activeSemester = parseInt(semMatch[1], 10);

      // In SGPA mode (targetSemester undefined), we stop if we encounter a NEW semester header
      // AFTER having found at least some subjects in the initial segment.
      if (targetSemester === undefined && seen.size > 0) break;
    }

    const info = extractCourseInfo(lines[i]);

    if (info) {
      // Filtering logic:
      // SGPA Mode: Always process until we hit next semester header (controlled by break above)
      // CGPA Mode: Process only if current segment matches target semester index
      const isTarget = targetSemester === undefined ? true : activeSemester === targetSemester;

      if (isTarget) {
        // Heuristic context: scan next ~8 lines for mark values
        const candidates: number[] = [];
        let j = i + 1;
        let linesScanned = 0;

        while (j < lines.length && linesScanned < 8) {
          const trimmed = lines[j].trim();

          if (MARK_VALUE.test(trimmed)) {
            candidates.push(normalizeMark(trimmed));
          } else if (
            trimmed !== '' &&
            (extractCourseInfo(lines[j]) || SEMESTER_HEADER.test(lines[j]))
          ) {
            // Stop scanning if we hit another course block or a semester header
            break;
          }

          if (trimmed !== '') linesScanned++;
          j++;
        }

        const rawMax = candidates.length > 0 ? Math.max(...candidates) : 0;

        // Ensure we have a valid entry with at least some name/code trace
        if (info.code && rawMax > 0 && rawMax <= 100) {
          seen.set(info.code, {
            code: info.code,
            name: info.name || `COURSE ${info.code}`,
            marks: rawMax,
          });
        }
        i = j;
        continue;
      }
    }

    i++;
  }

  return Array.from(seen.values());
}

export interface ParsedSemester {
  semesterIndex: number;
  subjects: ParsedSubject[];
}

export function parseAllMISText(raw: string): ParsedSemester[] {
  const lines = raw.split(/[\r\n]+/);
  // Map semester index to a Map of subjects (code -> ParsedSubject)
  const semestersData = new Map<number, Map<string, ParsedSubject>>();

  let activeSemester = 1;
  let i = 0;

  while (i < lines.length) {
    const semMatch = lines[i].match(SEMESTER_HEADER);
    if (semMatch) {
      activeSemester = parseInt(semMatch[1], 10);
    }

    if (!semestersData.has(activeSemester)) {
      semestersData.set(activeSemester, new Map<string, ParsedSubject>());
    }

    const info = extractCourseInfo(lines[i]);

    if (info) {
      const candidates: number[] = [];
      let j = i + 1;
      let linesScanned = 0;

      while (j < lines.length && linesScanned < 8) {
        const trimmed = lines[j].trim();

        if (MARK_VALUE.test(trimmed)) {
          candidates.push(normalizeMark(trimmed));
        } else if (
          trimmed !== '' &&
          (extractCourseInfo(lines[j]) || SEMESTER_HEADER.test(lines[j]))
        ) {
          break;
        }

        if (trimmed !== '') linesScanned++;
        j++;
      }

      const rawMax = candidates.length > 0 ? Math.max(...candidates) : 0;

      if (info.code && rawMax > 0 && rawMax <= 100) {
        semestersData.get(activeSemester)!.set(info.code, {
          code: info.code,
          name: info.name || `COURSE ${info.code}`,
          marks: rawMax,
        });
      }
      i = j;
      continue;
    }

    i++;
  }

  // Convert the map to an array of ParsedSemester, sorted by semesterIndex
  const result: ParsedSemester[] = Array.from(semestersData.entries())
    .map(([index, subjectsMap]) => ({
      semesterIndex: index,
      subjects: Array.from(subjectsMap.values()),
    }))
    .filter((s) => s.subjects.length > 0)
    .sort((a, b) => a.semesterIndex - b.semesterIndex);

  // Re-index to be perfectly sequential (1, 2, 3...) in case of gaps
  return result.map((sem, idx) => ({ ...sem, semesterIndex: idx + 1 }));
}
