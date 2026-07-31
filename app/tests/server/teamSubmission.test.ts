import { describe, expect, it } from 'vitest';
import {
  parseTeamSubmissionRequest,
  validateSubmissionPlayers,
} from '../../../server/utils/teamSubmission';

const validRequest = () => ({
  turnstileToken: 'valid-token',
  editKey: null,
  teamName: 'Worldwide Wanderers',
  teamOwner: 'Test Owner',
  teamEmail: 'owner@example.com',
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

describe('team submission validation', () => {
  it('normalises a valid anonymous submission', () => {
    const submission = parseTeamSubmissionRequest({
      ...validRequest(),
      teamName: '  Worldwide Wanderers  ',
      teamEmail: 'OWNER@EXAMPLE.COM',
    });

    expect(submission.teamName).toBe('Worldwide Wanderers');
    expect(submission.teamEmail).toBe('owner@example.com');
    expect(submission.playerIds).toHaveLength(11);
  });

  it('rejects malformed contact details and edit keys', () => {
    expect(() => parseTeamSubmissionRequest({ ...validRequest(), teamEmail: 'invalid' }))
      .toThrow('Team email is invalid');
    expect(() => parseTeamSubmissionRequest({ ...validRequest(), contactNumber: '123' }))
      .toThrow('Contact number is invalid');
    expect(() => parseTeamSubmissionRequest({ ...validRequest(), editKey: 'not-a-key' }))
      .toThrow('Edit key is invalid');
  });

  it('rejects missing or duplicate players', () => {
    expect(() => parseTeamSubmissionRequest({ ...validRequest(), playerIds: [1, 2] }))
      .toThrow('Exactly 11 valid players are required');
    expect(() => parseTeamSubmissionRequest({ ...validRequest(), playerIds: [1, 1, 3, 4, 5, 6, 7, 8, 9, 10, 11] }))
      .toThrow('A player cannot be selected more than once');
  });

  it('validates formation and calculates the authoritative team value', () => {
    expect(validateSubmissionPlayers(validPlayers(), false)).toBe(70);

    const invalidFormation = validPlayers();
    invalidFormation[0]!.position = 2;
    expect(() => validateSubmissionPlayers(invalidFormation, false))
      .toThrow('Team must contain 1 goalkeeper, 4 defenders, 3 midfielders and 3 forwards');
  });

  it('enforces the correct budget for the transfer option', () => {
    const expensivePlayers = validPlayers().map(player => ({ ...player, cost: 8 }));

    expect(validateSubmissionPlayers(expensivePlayers, false)).toBe(88);
    expect(() => validateSubmissionPlayers(expensivePlayers, true))
      .toThrow('Team value exceeds the £85m budget');
  });

  it('rejects players unavailable for the whole season', () => {
    const unavailablePlayers = validPlayers();
    unavailablePlayers[0]!.unavailable_for_season = true;

    expect(() => validateSubmissionPlayers(unavailablePlayers, false))
      .toThrow('A player unavailable for the season cannot be selected');
  });
});
