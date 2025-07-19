import { test, expect } from '@playwright/test';
const routes: string[] = require('../routes.json');

for (const route of routes) {
  test(`axe on ${route}`, async ({ page }) => {
    await page.goto(`http://localhost:8082${route}`);
    await page.waitForLoadState('networkidle');
    const results = await page.evaluate(() =>
      import('axe-core').then((axe) => axe.run()));
    expect(results.violations).toHaveLength(0);
  });
} 