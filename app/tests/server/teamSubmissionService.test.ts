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

const testSubmissionDeadline = '2026-08-20';
const beforeTestSubmissionDeadline = new Date('2026-08-20T12:00:00.000Z');

const createDependencies = (
  overrides: Partial<TeamSubmissionDependencies> = {},
): TeamSubmissionDependencies => ({
  loadAppSettings: vi.fn().mockResolvedValue({
    activeSeason: '26-27',
    teamRegistrationOpen: true,
    teamSubmissionDeadline: testSubmissionDeadline,
  }),
  // Ordinary submission tests run before the deadline; deadline-specific tests override this clock.
  now: () => beforeTestSubmissionDeadline,
  verifyTurnstile: vi.fn().mockResolvedValue(true),
  loadPlayers: vi.fn().mockResolvedValue(validPlayers()),
  saveTeam: vi.fn().mockResolvedValue({ outcome: 'created', team: savedTeam }),
  sendCreatedTeamEmails: vi.fn().mockResolvedValue(true),
  ...overrides,
});

describe('processTeamSubmission', () => {
  it('validates and saves a normalised submission using the server-calculated value', async () => {
    const dependencies = createDependencies();

    await expect(processTeamSubmission(validRequest(), dependencies)).resolves.toEqual({
      outcome: 'created',
      team: savedTeam,
      emailSent: true,
    });
    expect(dependencies.loadPlayers).toHaveBeenCalledWith([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    expect(dependencies.saveTeam).toHaveBeenCalledWith(expect.objectContaining({
      activeSeason: '26-27',
      teamName: 'Worldwide Wanderers',
      teamEmail: 'owner@example.com',
      totalTeamValue: 70,
    }));
    expect(dependencies.sendCreatedTeamEmails).toHaveBeenCalledWith(savedTeam, validPlayers());
  });

  it('updates a team without sending new-team emails', async () => {
    const request = {
      ...validRequest(),
      editKey: savedTeam.key,
    };
    const dependencies = createDependencies({
      saveTeam: vi.fn().mockResolvedValue({ outcome: 'updated', team: savedTeam }),
    });

    await expect(processTeamSubmission(request, dependencies)).resolves.toEqual({
      outcome: 'updated',
      team: savedTeam,
    });
    expect(dependencies.sendCreatedTeamEmails).not.toHaveBeenCalled();
  });

  it('reports an existing team without exposing it or sending email', async () => {
    const dependencies = createDependencies({
      saveTeam: vi.fn().mockResolvedValue({ outcome: 'existing-email' }),
    });

    await expect(processTeamSubmission(validRequest(), dependencies)).resolves.toEqual({
      outcome: 'existing-team',
    });
    expect(dependencies.sendCreatedTeamEmails).not.toHaveBeenCalled();
  });

  it('reports a saved team when confirmation email delivery fails', async () => {
    const dependencies = createDependencies({
      sendCreatedTeamEmails: vi.fn().mockResolvedValue(false),
    });

    await expect(processTeamSubmission(validRequest(), dependencies)).resolves.toEqual({
      outcome: 'created',
      team: savedTeam,
      emailSent: false,
    });
  });

  it('does not turn a successful save into a failed submission when email delivery throws', async () => {
    const dependencies = createDependencies({
      sendCreatedTeamEmails: vi.fn().mockRejectedValue(new Error('Email provider unavailable')),
    });

    await expect(processTeamSubmission(validRequest(), dependencies)).resolves.toEqual({
      outcome: 'created',
      team: savedTeam,
      emailSent: false,
    });
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
        teamSubmissionDeadline: testSubmissionDeadline,
      }),
    });

    await expect(processTeamSubmission(validRequest(), dependencies)).rejects.toMatchObject({
      statusCode: 403,
      message: 'Team registration is closed',
    });
    expect(dependencies.loadPlayers).not.toHaveBeenCalled();
  });

  it('rejects submissions after the UK deadline even when the registration flag is still open', async () => {
    const dependencies = createDependencies({
      now: () => new Date('2026-08-20T23:00:00.000Z'),
    });

    await expect(processTeamSubmission(validRequest(), dependencies)).rejects.toMatchObject({
      statusCode: 403,
      message: 'Team registration is closed',
    });
    expect(dependencies.loadPlayers).not.toHaveBeenCalled();
  });

  it('allows submissions through 23:59 UK time on the deadline date', async () => {
    const dependencies = createDependencies({
      now: () => new Date('2026-08-20T22:59:59.999Z'),
    });

    await expect(processTeamSubmission(validRequest(), dependencies)).resolves.toMatchObject({
      outcome: 'created',
    });
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
