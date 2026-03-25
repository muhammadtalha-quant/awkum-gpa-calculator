import { test, expect } from '@playwright/test';

test.describe('GPA Calculator Core User Journeys', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should calculate SGPA correctly for multiple subjects', async ({ page }) => {
        await page.click('text=SGPA Calculator');
        await expect(page.locator('h1')).toContainText('SGPA Simulator');

        // Add subjects
        await page.click('text=Add Course');
        await page.click('text=Add Course');

        const rows = page.locator('tbody tr');
        await expect(rows).toHaveCount(2);

        // Fill first subject
        const firstRow = rows.nth(0);
        await firstRow.locator('input[placeholder*="Advanced AI Models"]').fill('Calculus I');
        await firstRow.locator('input[type="number"]').nth(0).fill('3'); // Credits
        await firstRow.locator('input[type="number"]').nth(1).fill('85'); // Marks

        // Fill second subject
        const secondRow = rows.nth(1);
        await secondRow.locator('input[placeholder*="Advanced AI Models"]').fill('English Comp');
        await secondRow.locator('input[type="number"]').nth(0).fill('3'); // Credits
        await secondRow.locator('input[type="number"]').nth(1).fill('75'); // Marks

        // Check SGPA (85 -> 4.0, 75 -> 3.3 approx)
        // (4.0 * 3 + 3.0 * 3) / 6 = 3.5 ?
        // 85 -> 4.00, 75 -> 3.00 (In AWKUM 75-79 is 3.00)
        // (12 + 9) / 6 = 21 / 6 = 3.50
        await expect(page.locator('span.text-8xl')).toContainText('3.50');
    });

    test('should manage CGPA semesters and calculate cumulative average', async ({ page }) => {
        await page.click('text=CGPA Calculator');
        await expect(page.locator('h1')).toContainText('Cumulative Vector');

        // Add semesters
        await page.click('text=Add Academic Block');
        await page.click('text=Add Academic Block');

        const rows = page.locator('.group.flex-col'); // Select semester blocks
        await expect(rows).toHaveCount(2);

        // Fill first semester
        const firstRow = rows.nth(0);
        await firstRow.locator('input[type="number"]').nth(0).fill('18'); // Credits
        await firstRow.locator('input[type="number"]').nth(1).fill('3.5'); // SGPA

        // Fill second semester
        const secondRow = rows.nth(1);
        await secondRow.locator('input[type="number"]').nth(0).fill('18'); // Credits
        await secondRow.locator('input[type="number"]').nth(1).fill('3.7'); // SGPA

        // CGPA = (3.5 * 18 + 3.7 * 18) / 36 = 3.6
        await expect(page.locator('span.text-8xl')).toContainText('3.60');
    });

    test('should open MIS parser and handle imports', async ({ page }) => {
        await page.click('text=SGPA Calculator');
        await page.click('text=Import MIS');
        await expect(page.locator('h3:has-text("MIS Protocol Integration")')).toBeVisible();
        await page.click('text=close');
        await expect(page.locator('h3:has-text("MIS Protocol Integration")')).not.toBeVisible();
    });
});
