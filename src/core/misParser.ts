/**
 * AWKUM MIS Result Text Parser — Fixed for Real Format
 *
 * ACTUAL COPY-PASTE FORMAT FROM BROWSER (tab-separated columns):
 *
 *   1\tIntroduction To Management (SS-306)\tMr. Haider Zaman\t
 *   21         ← Mid
 *   20         ← Internal
 *   35         ← Final
 *   76         ← Total  ← WE WANT THIS
 *   -          ← Retotling (ignore)
 *
 * Key fixes vs. previous version:
 *  1. Course code is NOT at end of line — tutor name follows after a tab.
 *     Regex must NOT anchor to $ (end).
 *  2. Name is extracted from the tab-split column that contains the code,
 *     NOT the whole raw line.
 *  3. Row number at start of line is stripped from the first column.
 */

export interface ParsedSubject {
    code: string;
    name: string;
    marks: number;
}

// Code inside parentheses, anywhere on the line (no $ anchor!)
const CODE_IN_PARENS = /\(([A-Za-z]{2,6}-?\d{3,4})\)/i;

// A line that is purely a number (0-100) with optional surrounding whitespace/tabs
const PURE_NUMBER = /^\s*(\d{1,3})\s*$/;

/**
 * Given a raw line from the MIS paste, extract the course name
 * (without the code) and the code itself.
 */
function extractCourseInfo(line: string): { name: string; code: string } | null {
    const codeMatch = line.match(CODE_IN_PARENS);
    if (!codeMatch) return null;

    const code = codeMatch[1].toUpperCase();

    // The line may be tab-separated: [rowNum] [CourseName(Code)] [TutorName]
    const cols = line.split('\t');

    // Find the column that contains the code
    const courseCol = cols.find(c => CODE_IN_PARENS.test(c)) ?? '';

    // Strip the (CODE) part from the column to get just the name
    const rawName = courseCol.replace(CODE_IN_PARENS, '').trim();

    // Also strip any leading row number like "1 " or "12 "
    const name = rawName.replace(/^\d+\s+/, '').trim();

    return name ? { name, code } : null;
}

/**
 * Parses the full MIS copy-paste text.
 * Returns detected subjects with code, name, and Total marks.
 * Deduplicates by course code (last occurrence wins).
 */
export function parseMISText(raw: string): ParsedSubject[] {
    const lines = raw.split(/[\r\n]+/);
    const seen = new Map<string, ParsedSubject>();

    let i = 0;
    while (i < lines.length) {
        const info = extractCourseInfo(lines[i]);

        if (info) {
            // Collect numeric-only lines that follow immediately
            const numbers: number[] = [];
            let j = i + 1;

            while (j < lines.length && numbers.length < 5) {
                const trimmed = lines[j].trim();

                if (PURE_NUMBER.test(trimmed)) {
                    numbers.push(parseInt(trimmed, 10));
                    j++;
                } else if (trimmed === '-' || trimmed === '') {
                    // dash = Retotling, blank = spacing — skip but stop after dash
                    const isDash = trimmed === '-';
                    j++;
                    if (isDash) break;
                } else {
                    break; // Hit something non-numeric/non-dash → stop
                }
            }

            // Total marks = 4th number (index 3). Fallback to last available.
            const totalMarks =
                numbers.length >= 4
                    ? numbers[3]
                    : numbers.length > 0
                        ? numbers[numbers.length - 1]
                        : 0;

            if (info.name && totalMarks > 0 && totalMarks <= 100) {
                seen.set(info.code, { code: info.code, name: info.name, marks: totalMarks });
            }

            i = j;
            continue;
        }

        i++;
    }

    return Array.from(seen.values());
}
