import { test, expect } from '@playwright/test';
import { z } from 'zod';
import { databaseRequest, readSmokeSettings } from './helpers';

test('database API exposes valid operational settings', async ({ request }) => {
  const settings = await readSmokeSettings(request);
  expect(settings.activeSeason).toMatch(/^\d{2}-\d{2}$/);
  expect(settings.currentGameweek).toBeGreaterThanOrEqual(1);
  expect(settings.currentGameweek).toBeLessThanOrEqual(38);
});

test('public player and club views are reachable', async ({ request }) => {
  const resources: { table: string; field: string }[] = [
    { table: 'players_view', field: 'player_id' },
    { table: 'teams', field: 'id' },
  ];
  for (const { table, field } of resources) {
    const response = await request.get(databaseRequest.url(`${table}?select=${field}&limit=1`), {
      headers: databaseRequest.headers(),
    });
    expect(response.ok(), `${table} returned HTTP ${response.status()}`).toBe(true);
    const body: unknown = await response.json();
    z.array(z.object({ [field]: z.number().int() })).parse(body);
  }
});

test('public team lookup RPC is installed and responds', async ({ request }) => {
  const settings = await readSmokeSettings(request);
  const response = await request.get(databaseRequest.url('rpc/get_drafted_teams_by_season'), {
    headers: databaseRequest.headers(),
    params: { active_season_param: settings.activeSeason },
  });
  expect(response.ok(), `Team lookup RPC returned HTTP ${response.status()}`).toBe(true);
  const body: unknown = await response.json();
  const teams = z.array(z.object({ drafted_team_id: z.number().int() })).nullable().parse(body);
  if (!settings.leagueDataPublic) expect(teams ?? []).toHaveLength(0);
});

test('anonymous users cannot read contact details, edit keys or pending requests', async ({ request }) => {
  for (const query of [
    'drafted_teams?select=key,team_email&limit=0',
    'transfer_requests?select=transfer_request_id&limit=0',
  ]) {
    const response = await request.get(databaseRequest.url(query), { headers: databaseRequest.headers() });
    expect([401, 403]).toContain(response.status());
    const body: unknown = await response.json();
    expect(z.object({ code: z.string() }).parse(body).code).toBe('42501');
  }
});
