/**
 * AWKUM Course Code Validation
 * Format: ABC-123 (e.g. CS-113)
 */
export const isValidCourseCode = (code: string): boolean => {
    const regex = /^[A-Z]{2,}-\d{3}$/;
    return regex.test(code);
};

export const sanitizeSubjectName = (name: string): string => {
    return name.replace(/[^A-Za-z\s]/g, '');
};
