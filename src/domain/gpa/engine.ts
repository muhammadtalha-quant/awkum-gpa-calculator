import { GradePoint, Credit, asGP } from '../types';

/**
 * Calculates SGPA based on subjects
 * Formula: Sum(GP * Credits) / Sum(Credits)
 */
export function calculateSGPA(
    data: { gradePoint: GradePoint; credits: Credit }[]
): GradePoint {
    if (data.length === 0) return asGP(0);

    let totalWeightedGP = 0;
    let totalCredits = 0;

    data.forEach((item) => {
        totalWeightedGP += item.gradePoint * item.credits;
        totalCredits += item.credits;
    });

    if (totalCredits === 0) return asGP(0);

    const res = totalWeightedGP / totalCredits;
    return asGP(Number(res.toFixed(2)));
}

/**
 * Calculates CGPA based on semesters
 */
export function calculateCGPA(
    semesters: { sgpa: GradePoint; credits: Credit }[]
): GradePoint {
    return calculateSGPA(semesters.map(s => ({ gradePoint: s.sgpa, credits: s.credits })));
}

export type ProbationStatus = 'GOOD' | 'WARNING' | 'PROBATION' | 'CRITICAL';

export function getProbationStatus(cgpa: number): ProbationStatus {
    if (cgpa < 2.0) return 'PROBATION';
    if (cgpa < 2.2) return 'WARNING';
    if (cgpa >= 3.5) return 'GOOD';
    return 'GOOD';
}

/**
 * Calculates the required SGPA for the next semester to reach a target CGPA.
 * Returns:
 * - number: The exact SGPA needed.
 * - 'ACHIEVED': If the target is already reached or needs < 0 SGPA.
 * - 'IMPOSSIBLE': If the target requires > 4.0 SGPA.
 */
export function calculateRequiredSGPA(
    currentCGPA: number,
    currentTotalCredits: number,
    targetCGPA: number,
    nextSemesterCredits: number
): number | 'ACHIEVED' | 'IMPOSSIBLE' {
    if (nextSemesterCredits <= 0) return 'IMPOSSIBLE';

    const currentQP = currentCGPA * currentTotalCredits;
    const targetQP = targetCGPA * (currentTotalCredits + nextSemesterCredits);
    const requiredQP = targetQP - currentQP;
    const requiredSGPA = requiredQP / nextSemesterCredits;

    if (requiredSGPA > 4.0) return 'IMPOSSIBLE';
    if (requiredSGPA <= 0) return 'ACHIEVED';

    return Number(requiredSGPA.toFixed(2));
}

/**
 * Calculates the required marks for remaining subjects to reach a target SGPA.
 * Returns:
 * - number: Average marks needed per remaining credit.
 * - 'ACHIEVED': If target is already reached.
 * - 'IMPOSSIBLE': If target requires > 4.0 GP average.
 */
export function calculateRequiredMarks(
    filledWeightedGP: number,
    totalCredits: number,
    remainingCredits: number,
    targetSGPA: number
): number | 'ACHIEVED' | 'IMPOSSIBLE' {
    if (remainingCredits <= 0) return 'ACHIEVED';

    const targetWeightedGP = targetSGPA * totalCredits;
    const requiredWeightedGP = targetWeightedGP - filledWeightedGP;
    const requiredGP = requiredWeightedGP / remainingCredits;

    if (requiredGP > 4.0) return 'IMPOSSIBLE';
    if (requiredGP <= 0) return 'ACHIEVED';

    // Reverse AWKUM Formula: Marks = (GP - 2.00) / 0.05 + 50
    if (requiredGP < 2.0) return 50; // Minimum passing marks
    const marks = (requiredGP - 2.00) / 0.05 + 50;
    return Math.ceil(marks);
}

/**
 * Calculates a projected CGPA based on a specific scenario.
 * @param semesters Current actual semesters
 * @param mode 'best' (4.0), 'worst' (2.0), or 'expected' (avg)
 * @param futureCredits Estimated credits for remaining semesters
 */
export function calculateProjectedCGPA(
    semesters: { sgpa: GradePoint; credits: Credit }[],
    mode: 'best' | 'worst' | 'expected',
    futureCredits: number = 0
): GradePoint {
    const currentTotalQP = semesters.reduce((sum, s) => sum + (s.sgpa * s.credits), 0);
    const currentTotalCredits = semesters.reduce((sum, s) => sum + s.credits, 0);

    let projectedGP = 0;
    if (mode === 'best') projectedGP = 4.0;
    else if (mode === 'worst') projectedGP = 2.0;
    else {
        // Expected: uses weighted historical average
        const avg = currentTotalCredits > 0 ? currentTotalQP / currentTotalCredits : 0;
        projectedGP = Number(avg.toFixed(2));
    }

    const projectedQP = projectedGP * futureCredits;
    const finalTotalQP = currentTotalQP + projectedQP;
    const finalTotalCredits = currentTotalCredits + futureCredits;

    if (finalTotalCredits === 0) return asGP(0);
    const res = finalTotalQP / finalTotalCredits;
    return asGP(Number(res.toFixed(2)));
}

/**
 * Calculates the CGPA delta if a subject's grade is improved.
 */
export function getRetakeImpact(
    currentSemesters: { id: string; sgpa: GradePoint; credits: Credit; subjects?: any[] }[],
    targetGradePoint: GradePoint,
    subjectId: string,
    semesterId: string
): { delta: number; newCGPA: GradePoint } {
    const currentCGPA = calculateCGPA(currentSemesters);

    // Create a simulation of the change
    const simulatedSemesters = currentSemesters.map(sem => {
        if (sem.id !== semesterId) return sem;

        const nextSubjects = (sem.subjects || []).map(sub => {
            if (sub.id === subjectId) return { ...sub, gradePoint: targetGradePoint };
            return sub;
        });

        const newSGPA = calculateSGPA(nextSubjects.map(s => ({ gradePoint: s.gradePoint, credits: s.credits })));
        return { ...sem, sgpa: newSGPA };
    });

    const newCGPA = calculateCGPA(simulatedSemesters);
    return {
        delta: Number((newCGPA - currentCGPA).toFixed(3)),
        newCGPA
    };
}

/**
 * Calculates the minimum GP a specific subject must score in a retake
 * to bring the overall CGPA to a user-defined target.
 *
 * Derivation:
 *   targetCGPA * totalCredits = TQP - (currentSubjectGP * subjectCredits) + (requiredGP * subjectCredits)
 *   => requiredGP = [targetCGPA * totalCredits - TQP + subjectQP] / subjectCredits
 */
export function getRequiredGPForTargetCGPA(
    semesters: { id: string; sgpa: GradePoint; credits: Credit; subjects?: any[] }[],
    semesterId: string,
    subjectId: string,
    targetCGPA: number
): number | 'IMPOSSIBLE' | 'ACHIEVED' {
    const totalCredits = semesters.reduce((sum, s) => sum + Number(s.credits), 0);
    const totalQP = semesters.reduce((sum, s) => sum + (Number(s.sgpa) * Number(s.credits)), 0);

    const sem = semesters.find(s => s.id === semesterId);
    if (!sem) return 'IMPOSSIBLE';
    const sub = (sem.subjects || []).find((s: any) => s.id === subjectId);
    if (!sub) return 'IMPOSSIBLE';

    const subjectCredits = Number(sub.credits);
    const subjectCurrentQP = Number(sub.gradePoint) * subjectCredits;

    const requiredQP = targetCGPA * totalCredits - totalQP + subjectCurrentQP;
    const requiredGP = requiredQP / subjectCredits;

    if (requiredGP > 4.0) return 'IMPOSSIBLE';
    if (requiredGP <= Number(sub.gradePoint)) return 'ACHIEVED';
    return Number(requiredGP.toFixed(3));
}

/**
 * Converts a GradePoint to the minimum AWKUM marks required to achieve it.
 * AWKUM: 4.0 GP = 90 marks. Formula: marks = (GP - 2.0) / 0.05 + 50
 */
export function gpToMinMarks(gp: number): number {
    if (gp >= 4.0) return 90;
    if (gp < 2.0) return 50;
    return Math.ceil((gp - 2.0) / 0.05 + 50);
}

export type RetakeDistributionResult = {
    subjectId: string;
    semesterId: string;
    name: string;
    credits: number;
    currentMarks: number;
    currentGP: number;
    requiredGP: number;
    requiredMarks: number;
    weightPercent: number;
    feasible: boolean;
};

/**
 * Distributes the required quality-point deficit across all eligible retake
 * subjects, weighted by credit hours.
 *
 * Algorithm:
 *  1. Compute neededExtraQP = targetCGPA × totalCredits − currentTotalQP
 *  2. Distribute proportionally: share_i = neededExtraQP × (cr_i / Σcr_eligible)
 *  3. requiredGP_i = currentGP_i + share_i / cr_i  (simplifies to +deltaGP for all)
 *  4. If requiredGP_i > 4.0, cap it, remove from pool, and redistribute the
 *     residual QP iteratively until stable.
 *
 * AWKUM eligibility: marks < 60 only.
 */
export function distributeRetakeMarks(
    semesters: { id: string; sgpa: GradePoint; credits: Credit; subjects?: any[] }[],
    targetCGPA: number
): RetakeDistributionResult[] | 'TARGET_TOO_HIGH' | 'NO_ELIGIBLE' {
    // Flatten eligible subjects
    type EligibleSub = {
        subjectId: string; semesterId: string; name: string;
        credits: number; currentGP: number; currentMarks: number;
    };

    const eligible: EligibleSub[] = [];
    for (const sem of semesters) {
        for (const sub of sem.subjects || []) {
            if (Number(sub.marks) >= 60) continue;   // AWKUM: only marks < 60
            eligible.push({
                subjectId: sub.id,
                semesterId: sem.id,
                name: sub.name,
                credits: Number(sub.credits),
                currentGP: Number(sub.gradePoint),
                currentMarks: Number(sub.marks)
            });
        }
    }

    if (eligible.length === 0) return 'NO_ELIGIBLE';

    const totalCredits = semesters.reduce((s, sem) => s + Number(sem.credits), 0);
    const currentTotalQP = semesters.reduce((s, sem) => s + Number(sem.sgpa) * Number(sem.credits), 0);
    const neededExtraQP = targetCGPA * totalCredits - currentTotalQP;

    if (neededExtraQP <= 0) return 'NO_ELIGIBLE'; // Already at or above target

    // Iterative credit-weighted distribution with 4.0 cap
    const requiredGPs = new Map<string, number>(eligible.map(e => [e.subjectId, e.currentGP]));
    let uncapped = [...eligible];
    let remainingQP = neededExtraQP;

    for (let iter = 0; iter < 20; iter++) {
        const totalUncappedCredits = uncapped.reduce((s, e) => s + e.credits, 0);
        if (totalUncappedCredits === 0) break;

        const deltaGP = remainingQP / totalUncappedCredits;
        let residual = 0;
        const nextUncapped: EligibleSub[] = [];

        for (const e of uncapped) {
            const newGP = e.currentGP + deltaGP;
            if (newGP >= 4.0) {
                // Cap at 4.0, accumulate residual to redistribute
                const allocatedQP = (4.0 - e.currentGP) * e.credits;
                residual += (remainingQP * (e.credits / totalUncappedCredits)) - allocatedQP;
                requiredGPs.set(e.subjectId, 4.0);
            } else {
                requiredGPs.set(e.subjectId, newGP);
                nextUncapped.push(e);
            }
        }

        if (residual <= 0.0001 || nextUncapped.length === 0) break;
        remainingQP = residual;
        uncapped = nextUncapped;
    }

    // Check if target is achievable
    const achievedQP = eligible.reduce((s, e) => s + (requiredGPs.get(e.subjectId) ?? e.currentGP) * e.credits, 0);
    const nonEligibleQP = currentTotalQP - eligible.reduce((s, e) => s + e.currentGP * e.credits, 0);
    const projectedCGPA = (achievedQP + nonEligibleQP) / totalCredits;
    if (projectedCGPA < targetCGPA - 0.005) return 'TARGET_TOO_HIGH';

    const totalEligibleCredits = eligible.reduce((s, e) => s + e.credits, 0);

    return eligible.map(e => {
        const reqGP = requiredGPs.get(e.subjectId) ?? e.currentGP;
        const reqMarks = gpToMinMarks(reqGP);
        return {
            subjectId: e.subjectId,
            semesterId: e.semesterId,
            name: e.name,
            credits: e.credits,
            currentMarks: e.currentMarks,
            currentGP: e.currentGP,
            requiredGP: Number(reqGP.toFixed(3)),
            requiredMarks: reqMarks,
            weightPercent: Math.round((e.credits / totalEligibleCredits) * 100),
            feasible: reqGP <= 4.0 && reqMarks <= 90
        };
    }).sort((a, b) => (b.requiredMarks - b.currentMarks) - (a.requiredMarks - a.currentMarks));
}
