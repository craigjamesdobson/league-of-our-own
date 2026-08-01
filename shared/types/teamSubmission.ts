export type TeamSubmissionResponse<TTeam>
  = | { outcome: 'created'; team: TTeam; emailSent: boolean }
    | { outcome: 'updated'; team: TTeam }
    | { outcome: 'existing-team' };
