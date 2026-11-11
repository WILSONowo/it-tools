import { test, expect } from '@playwright/test';

test.describe('Tool - OTP code generator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/otp-generator');
  });

  test('Has title', async ({ page }) => {
    await expect(page).toHaveTitle('OTP 一次性密码 - IT Tools');
  });

  test('Secret hexa value is computed from provided secret', async ({ page }) => {
    await page.getByPlaceholder('粘贴TOTP 密钥...').fill('ITTOOLS');

    const secretInHex = await page.getByPlaceholder('密钥的十六进制形式将显示在这里').inputValue();

    expect(secretInHex).toEqual('44e6e72e02');
  });

  test('OTP a generated from the provided secret', async ({ page }) => {
    await page.evaluate(() => {
      Date.now = () => 1609477200000; //Jan 1, 2021
    });

    await page.getByPlaceholder('粘贴TOTP 密钥...').fill('ITTOOLS');

    await expect(page.getByTestId('previous-otp')).toHaveText('028034');
    await expect(page.getByTestId('current-otp')).toHaveText('162195');
    await expect(page.getByTestId('next-otp')).toHaveText('452815');
  });

  test('You can generate a new random secret', async ({ page }) => {
    const initialSecret = await page.getByPlaceholder('粘贴TOTP 密钥...').inputValue();
    await page.getByRole('button', { name: '生成密钥' }).click();

    const newSecret = await page.getByPlaceholder('粘贴TOTP 密钥...').inputValue();

    expect(newSecret).not.toEqual(initialSecret);
  });
});
