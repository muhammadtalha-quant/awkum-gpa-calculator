import { test, expect } from '@playwright/test';

test.describe('GPA Calculator Core User Journeys', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => localStorage.removeItem('awkum-academic-storage'));
    });

    test('should calculate SGPA correctly for multiple subjects', async ({ page }) => {
        await page.click('text=SGPA Calculator');
        await expect(page.locator('h1')).toContainText('SGPA Utility');

        // Add subjects
        await page.locator('[data-testid="add-course-btn"]').click();
        await page.locator('[data-testid="add-course-btn"]').click();

        const rows = page.locator('[data-testid="subject-row"]');
        await expect(rows).toHaveCount(2);

        // Fill first subject
        const firstRow = rows.nth(0);
        await firstRow.locator('[data-testid="subject-credits-input"]').fill('3'); // Credits
        await firstRow.locator('[data-testid="subject-marks-input"]').fill('85'); // Marks

        // Fill second subject
        const secondRow = rows.nth(1);
        await secondRow.locator('[data-testid="subject-credits-input"]').fill('3'); // Credits
        await secondRow.locator('[data-testid="subject-marks-input"]').fill('75'); // Marks

        // Check SGPA (85 -> 4.0, 75 -> 3.0 approx)
        // (4.0 * 3 + 3.0 * 3) / 6 = 3.50
        await expect(page.locator('[data-testid="sgpa-score"]').first()).toContainText('3.50');
    });

    test('should manage CGPA semesters and calculate cumulative average', async ({ page }) => {
        await page.click('text=CGPA Calculator');
        await expect(page.locator('h1')).toContainText('CGPA Utility');

        // Add semesters
        await page.locator('[data-testid="add-semester-btn"]').click();
        await page.locator('[data-testid="add-semester-btn"]').click();

        const rows = page.locator('[data-testid="semester-row"]'); // Select semester blocks
        await expect(rows).toHaveCount(2);

        // Fill first semester (Subject 1)
        const firstRow = rows.nth(0);
        await firstRow.locator('[data-testid="subject-credits-input"]').fill('6');
        await firstRow.locator('[data-testid="subject-marks-input"]').fill('85'); // GP 4.0 -> SGPA 4.0

        // Fill second semester (Subject 2)
        const secondRow = rows.nth(1);
        await secondRow.locator('[data-testid="subject-credits-input"]').fill('6');
        await secondRow.locator('[data-testid="subject-marks-input"]').fill('75'); // GP 3.0 -> SGPA 3.0

        // CGPA = (4.0 * 18 + 3.0 * 18) / 36 = 3.50
        await expect(page.locator('[data-testid="cgpa-score"]').first()).toContainText('3.50');
    });

    test('should open MIS parser and handle imports', async ({ page }) => {
        await page.click('text=SGPA Calculator');
        await page.locator('[data-testid="import-mis-btn"]').click();
        await expect(page.locator('h2:has-text("MIS Intelligent Import")')).toBeVisible();
        await page.click('[data-testid="close-modal"]');
        await expect(page.locator('h2:has-text("MIS Intelligent Import")')).not.toBeVisible();
    });
});
