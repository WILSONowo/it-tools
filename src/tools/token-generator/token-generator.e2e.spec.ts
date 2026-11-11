import { test, expect } from '@playwright/test';

test.describe('Tool - Token generator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/token-generator');
  });

  test('Has title', async ({ page }) => {
    await expect(page).toHaveTitle('随机字符串生成器 - 在线工具箱');
  });

  test('New token on refresh', async ({ page }) => {
    const initialToken = await page.locator('.result-box').innerText();
    await page.getByRole('button', { name: '生成', exact: true }).click();
    const newToken = await page.locator('.result-box').innerText();

    expect(newToken).not.toEqual(initialToken);
  });
});
