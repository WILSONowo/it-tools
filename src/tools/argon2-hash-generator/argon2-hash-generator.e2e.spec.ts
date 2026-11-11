import { test, expect } from '@playwright/test';

test.describe('Tool - Argon2 hash generator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/argon2-hash-generator');
  });

  test('Has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('Argon2 哈希生成器 - IT Tools');
  });

  test('Verifies matching and different passwords', async ({ page }) => {
    await page.getByTestId('input').fill('sample password');
    await expect(page.getByTestId('hash')).toHaveValue(/^\$argon2id\$/);
    const hash = await page.getByTestId('hash').inputValue();
    await page.getByTestId('compare-hash').fill(hash);
    await page.getByTestId('compare-string').fill('sample password');
    await expect(page.getByTestId('do-they-match')).toHaveText('匹配');
    await page.getByTestId('compare-string').fill('another sample');
    await expect(page.getByTestId('do-they-match')).toHaveText('不匹配');
  });
});
