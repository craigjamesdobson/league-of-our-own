export interface TeamSubmissionRequest {
  turnstileToken: string;
  editKey: string | null;
  teamName: string;
  teamOwner: string;
  teamEmail: string;
  contactNumber: string | null;
  allowCommunication: boolean;
  allowedTransfers: boolean;
  playerIds: number[];
}

export interface SubmissionPlayer {
  player_id: number | null;
  position: number | null;
  cost: number | null;
  unavailable_for_season: boolean | null;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^07\d{9}$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EXPECTED_POSITIONS = new Map([
  [1, 1],
  [2, 4],
  [3, 3],
  [4, 3],
]);

const requireTrimmedString = (value: unknown, field: string, maximumLength: number): string => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required`);
  }

  const trimmedValue = value.trim();
  if (trimmedValue.length > maximumLength) {
    throw new Error(`${field} is too long`);
  }

  return trimmedValue;
};

export const parseTeamSubmissionRequest = (body: unknown): TeamSubmissionRequest => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('Invalid team submission');
  }

  const submission = body as Record<string, unknown>;
  const turnstileToken = requireTrimmedString(submission.turnstileToken, 'Security token', 4096);
  const teamName = requireTrimmedString(submission.teamName, 'Team name', 100);
  const teamOwner = requireTrimmedString(submission.teamOwner, 'Team owner', 100);
  const teamEmail = requireTrimmedString(submission.teamEmail, 'Team email', 254).toLowerCase();

  if (!EMAIL_PATTERN.test(teamEmail)) {
    throw new Error('Team email is invalid');
  }

  if (typeof submission.allowCommunication !== 'boolean' || typeof submission.allowedTransfers !== 'boolean') {
    throw new Error('Team options are invalid');
  }

  const contactNumber = submission.contactNumber === null || submission.contactNumber === undefined || submission.contactNumber === ''
    ? null
    : requireTrimmedString(submission.contactNumber, 'Contact number', 11);

  if (contactNumber && !PHONE_PATTERN.test(contactNumber)) {
    throw new Error('Contact number is invalid');
  }

  const editKey = submission.editKey === null || submission.editKey === undefined || submission.editKey === ''
    ? null
    : requireTrimmedString(submission.editKey, 'Edit key', 36);

  if (editKey && !UUID_PATTERN.test(editKey)) {
    throw new Error('Edit key is invalid');
  }

  if (!Array.isArray(submission.playerIds)
    || submission.playerIds.length !== 11
    || submission.playerIds.some(playerId => !Number.isInteger(playerId) || Number(playerId) <= 0)) {
    throw new Error('Exactly 11 valid players are required');
  }

  const playerIds = submission.playerIds.map(Number);
  if (new Set(playerIds).size !== playerIds.length) {
    throw new Error('A player cannot be selected more than once');
  }

  return {
    turnstileToken,
    editKey,
    teamName,
    teamOwner,
    teamEmail,
    contactNumber,
    allowCommunication: submission.allowCommunication,
    allowedTransfers: submission.allowedTransfers,
    playerIds,
  };
};

export const validateSubmissionPlayers = (
  players: SubmissionPlayer[],
  allowedTransfers: boolean,
): number => {
  if (players.length !== 11 || players.some(player => player.player_id === null || player.position === null || player.cost === null)) {
    throw new Error('One or more selected players do not exist');
  }

  if (players.some(player => player.unavailable_for_season)) {
    throw new Error('A player unavailable for the season cannot be selected');
  }

  const positions = new Map<number, number>();
  for (const player of players) {
    positions.set(player.position!, (positions.get(player.position!) ?? 0) + 1);
  }

  for (const [position, expectedCount] of EXPECTED_POSITIONS) {
    if (positions.get(position) !== expectedCount) {
      throw new Error('Team must contain 1 goalkeeper, 4 defenders, 3 midfielders and 3 forwards');
    }
  }

  const totalTeamValue = Number(players.reduce((total, player) => total + player.cost!, 0).toFixed(1));
  const budget = allowedTransfers ? 85 : 90;
  if (totalTeamValue > budget) {
    throw new Error(`Team value exceeds the £${budget}m budget`);
  }

  return totalTeamValue;
};
