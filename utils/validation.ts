
export const isValidCourseCode = (code: string): boolean => {
    // Pattern: 2-5 alphabets, one hyphen, 3 digits
    // Example: CS-123, MATH-101, PHY-202
    const pattern = /^[A-Za-z]{2,5}-\d{3}$/;
    return pattern.test(code);
};
