import { test, expect } from '@playwright/test';

test.describe('Tool - json to yaml', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/json-to-yaml-converter');
  });

  test('Has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('JSON 转 YAML - 在线工具箱');
  });

  test('json is parsed and output clean yaml', async ({ page }) => {
    await page.getByPlaceholder('在此粘贴输入 JSON...').fill('{"foo":"bar","list":["item",{"key":"value"}]}');

    await page.getByRole('button', { name: '转换', exact: true }).click();
    const generatedJson = await page.getByPlaceholder('结果将显示在这里').inputValue();

    expect(generatedJson.trim()).toEqual(`foo: bar\nlist:\n  - item\n  - key: value`.trim());
  });
});
