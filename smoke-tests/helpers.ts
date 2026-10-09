import { test as base, expect, type APIRequestContext, type Page } from '@playwright/test';
import { z } from 'zod';
import { APP_SETTING_KEYS, parseAppSettings } from '../shared/utils/appSettings';

export const requiredSmokeEnv = (name: 'SITE_URL' | 'SUPABASE_URL' | 'SUPABASE_KEY'): string => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Smoke tests require ${name}`);
  return value;
};

export const siteUrl = (path: string): string => new URL(path, requiredSmokeEnv('SITE_URL')).toString();

export const openSitePage = async (page: Page, path: string) => {
  await page.goto(siteUrl(path));
  await expect(page.locator('main').first()).toBeVisible();
  const closeWhatsNew = page.getByRole('button', { name: 'Close What\'s new', exact: true });
  if (await closeWhatsNew.isVisible()) await closeWhatsNew.click();
};

export const databaseRequest = {
  url: (path: string): string => new URL(`/rest/v1/${path}`, requiredSmokeEnv('SUPABASE_URL')).toString(),
  headers: (): Record<string, string> => ({ apikey: requiredSmokeEnv('SUPABASE_KEY') }),
};

const settingRowsSchema = z.array(z.object({
  setting_key: z.string(),
  setting_value: z.string(),
}));

export const readSmokeSettings = async (request: APIRequestContext) => {
  const response = await request.get(databaseRequest.url(
    `settings?select=setting_key,setting_value&setting_key=in.(${APP_SETTING_KEYS.join(',')})`,
  ), { headers: databaseRequest.headers() });
  expect(response.ok(), `Settings API returned HTTP ${response.status()}`).toBe(true);
  const body: unknown = await response.json();
  return parseAppSettings(settingRowsSchema.parse(body));
};

export const siteTest = base.extend<{ applicationErrors: string[] }>({
  applicationErrors: [async ({ page }, use) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error' && !message.text().startsWith('Failed to load resource')) {
        errors.push(message.text());
      }
    });
    await use(errors);
    expect(errors, 'The deployed application reported browser errors').toEqual([]);
  }, { auto: true }],
});
