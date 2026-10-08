import { expect, type Page } from '@playwright/test';
import type { AppSettings } from '../shared/utils/appSettings';
import { canAccessLeagueRoute } from '../shared/utils/leagueRouteAccess';
import { openSitePage, readSmokeSettings, requiredSmokeEnv, siteTest as test, siteUrl } from './helpers';

let settings: AppSettings;

test.beforeAll(async ({ request }) => {
  settings = await readSmokeSettings(request);
});

const openCheckedPage = async (page: Page, route: string) => {
  await openSitePage(page, route);
  if (route === '/' && settings.siteOpen && !settings.teamRegistrationOpen && settings.leagueDataPublic) {
    await expect(page.getByRole('heading', { name: /^Gameweek \d+ Summary$/ })).toBeVisible();
  }
};

test('the frontend uses the database configured for this deployment', async ({ page }) => {
  const [response] = await Promise.all([
    page.waitForResponse(response => new URL(response.url()).pathname === '/rest/v1/settings'),
    openCheckedPage(page, '/'),
  ]);
  expect(response.ok()).toBe(true);
  expect(new URL(response.url()).origin).toBe(new URL(requiredSmokeEnv('SUPABASE_URL')).origin);
});

for (const route of ['/', '/players', '/teams', '/table', '/rules']) {
  test(`site boots and renders ${route}`, async ({ page }) => {
    await openCheckedPage(page, route);
    const expectedPath = !settings.siteOpen
      ? '/coming-soon'
      : canAccessLeagueRoute(route, settings.leagueDataPublic, false) ? route : '/';
    await expect(page).toHaveURL(siteUrl(expectedPath));
    await expect(page.locator('main').first()).not.toHaveText('');
    await expect(page.getByText('Something went wrong', { exact: true })).toHaveCount(0);
  });
}

test('login renders and signed-out users cannot open the admin dashboard', async ({ page }) => {
  await openSitePage(page, '/account/login');
  await expect(page.getByLabel('Email', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Log in', exact: true })).toBeVisible();
  await openSitePage(page, '/account');
  await expect(page).toHaveURL(siteUrl(settings.siteOpen ? '/account/login' : '/coming-soon'));
});

test('manual transfer instructions render and the template can be copied', async ({ page, context }) => {
  test.skip(settings.onlineTransferRequestsEnabled, 'Online transfers are enabled for this environment');
  await openSitePage(page, '/manage-team');
  if (!settings.siteOpen) {
    await expect(page).toHaveURL(siteUrl('/coming-soon'));
    return;
  }
  await expect(page.getByRole('heading', { name: 'Request transfers by email' })).toBeVisible();
  await expect(page.getByText('transfers@leagueofourown.co.uk', { exact: true })).toBeVisible();
  const template = page.getByRole('textbox', { name: 'Transfer template' });
  await expect(template).toHaveValue(/Team name:[\s\S]*Player ID:/);
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.getByRole('button', { name: 'Copy template', exact: true }).click();
  await expect(page.getByText('Template copied. Paste it into a new email, then fill in your details.')).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('Team name:');
});

test('disabled online transfer routes stay gated', async ({ page, request }) => {
  test.skip(settings.onlineTransferRequestsEnabled, 'Online transfers are enabled for this environment');
  await openSitePage(page, '/manage-team/online');
  await expect(page).toHaveURL(siteUrl(settings.siteOpen ? '/manage-team' : '/coming-soon'));
  const response = await request.get(siteUrl('/api/team-management/11111111-1111-4111-8111-111111111111'));
  expect(response.status()).toBe(404);
});
