import {
  parseTeamSubmissionRequest,
  type SubmissionPlayer,
  validateSubmissionPlayers,
} from './teamSubmission';

export interface SavedTeam {
  drafted_team_id: number;
  key: string;
  edited_count: number;
  active_season: string;
  team_name: string;
  team_owner: string;
  team_email: string;
  contact_number: string | null;
  allow_communication: boolean;
  allowed_transfers: boolean;
  total_team_value: number;
  created_at: string;
  updated_at: string | null;
}

export interface SaveTeamSubmission {
  activeSeason: string;
  allowCommunication: boolean;
  allowedTransfers: boolean;
  contactNumber: string | null;
  editKey: string | null;
  playerIds: number[];
  teamEmail: string;
  teamName: string;
  teamOwner: string;
  totalTeamValue: number;
}

export interface TeamSubmissionDependencies {
  loadAppSettings: () => Promise<{
    activeSeason: string;
    teamRegistrationOpen: boolean;
  }>;
  verifyTurnstile: (token: string) => Promise<boolean>;
  loadPlayers: (playerIds: number[]) => Promise<SubmissionPlayer[]>;
  saveTeam: (submission: SaveTeamSubmission) => Promise<SavedTeam>;
}

export class TeamSubmissionError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'TeamSubmissionError';
  }
}

export const processTeamSubmission = async (
  request: unknown,
  dependencies: TeamSubmissionDependencies,
): Promise<SavedTeam> => {
  const submission = parseTeamSubmissionRequest(request);

  if (!await dependencies.verifyTurnstile(submission.turnstileToken)) {
    throw new TeamSubmissionError(422, 'Security verification failed');
  }

  const settings = await dependencies.loadAppSettings();

  if (!settings.teamRegistrationOpen) {
    throw new TeamSubmissionError(403, 'Team registration is closed');
  }

  if (!settings.activeSeason) {
    throw new TeamSubmissionError(500, 'Server configuration error');
  }

  const players = await dependencies.loadPlayers(submission.playerIds);
  const totalTeamValue = validateSubmissionPlayers(players, submission.allowedTransfers);

  return await dependencies.saveTeam({
    activeSeason: settings.activeSeason,
    allowCommunication: submission.allowCommunication,
    allowedTransfers: submission.allowedTransfers,
    contactNumber: submission.contactNumber,
    editKey: submission.editKey,
    playerIds: submission.playerIds,
    teamEmail: submission.teamEmail,
    teamName: submission.teamName,
    teamOwner: submission.teamOwner,
    totalTeamValue,
  });
};
