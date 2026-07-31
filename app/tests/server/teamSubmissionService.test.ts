// @vitest-environment node

import { describe, expect, it, vi } from 'vitest';
import {
  processTeamSubmission,
  type TeamSubmissionDependencies,
} from '../../../server/utils/teamSubmissionService';

const validRequest = () => ({
  turnstileToken: 'valid-token',
  editKey: null,
  teamName: '  Worldwide Wanderers  ',
  teamOwner: 'Test Owner',
  teamEmail: 'OWNER@EXAMPLE.COM',
  contactNumber: '07123456789',
  allowCommunication: true,
  allowedTransfers: false,
  playerIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
});

const validPlayers = () => [
  { player_id: 1, position: 1, cost: 5, unavailable_for_season: false },
  ...[2, 3, 4, 5].map(player_id => ({ player_id, position: 2, cost: 5, unavailable_for_season: false })),
  ...[6, 7, 8].map(player_id => ({ player_id, position: 3, cost: 7, unavailable_for_season: false })),
  ...[9, 10, 11].map(player_id => ({ player_id, position: 4, cost: 8, unavailable_for_season: false })),
];

const savedTeam = {
  drafted_team_id: 42,
  key: '4bd08b04-a810-4faf-b368-0770360477f9',
  edited_count: 0,
  active_season: '2026/27',
  team_name: 'Worldwide Wanderers',
  team_owner: 'Test Owner',
  team_email: 'owner@example.com',
  contact_number: '07123456789',
  allow_communication: true,
  allowed_transfers: false,
  total_team_value: 70,
  created_at: '2026-07-26T12:00:00.000Z',
  updated_at: null,
};

const createDependencies = (
  overrides: Partial<TeamSubmissionDependencies> = {},
): TeamSubmissionDependencies => ({
  loadAppSettings: vi.fn().mockResolvedValue({
    activeSeason: '26-27',
    teamRegistrationOpen: true,
  }),
  verifyTurnstile: vi.fn().mockResolvedValue(true),
  loadPlayers: vi.fn().mockResolvedValue(validPlayers()),
  saveTeam: vi.fn().mockResolvedValue(savedTeam),
  ...overrides,
});

describe('processTeamSubmission', () => {
  it('validates and saves a normalised submission using the server-calculated value', async () => {
    const dependencies = createDependencies();

    await expect(processTeamSubmission(validRequest(), dependencies)).resolves.toEqual(savedTeam);
    expect(dependencies.loadPlayers).toHaveBeenCalledWith([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    expect(dependencies.saveTeam).toHaveBeenCalledWith(expect.objectContaining({
      activeSeason: '26-27',
      teamName: 'Worldwide Wanderers',
      teamEmail: 'owner@example.com',
      totalTeamValue: 70,
    }));
  });

  it('rejects a failed security check before querying players', async () => {
    const dependencies = createDependencies({
      verifyTurnstile: vi.fn().mockResolvedValue(false),
    });

    await expect(processTeamSubmission(validRequest(), dependencies)).rejects.toMatchObject({
      statusCode: 422,
      message: 'Security verification failed',
    });
    expect(dependencies.loadPlayers).not.toHaveBeenCalled();
    expect(dependencies.saveTeam).not.toHaveBeenCalled();
  });

  it('rejects submissions while registration is closed', async () => {
    const dependencies = createDependencies({
      loadAppSettings: vi.fn().mockResolvedValue({
        activeSeason: '26-27',
        teamRegistrationOpen: false,
      }),
    });

    await expect(processTeamSubmission(validRequest(), dependencies)).rejects.toMatchObject({
      statusCode: 403,
      message: 'Team registration is closed',
    });
    expect(dependencies.loadPlayers).not.toHaveBeenCalled();
  });

  it('does not save a team when authoritative player validation fails', async () => {
    const dependencies = createDependencies({
      loadPlayers: vi.fn().mockResolvedValue(validPlayers().slice(0, 10)),
    });

    await expect(processTeamSubmission(validRequest(), dependencies)).rejects.toThrow(
      'One or more selected players do not exist',
    );
    expect(dependencies.saveTeam).not.toHaveBeenCalled();
  });
});
