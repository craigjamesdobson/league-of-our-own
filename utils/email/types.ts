import type { DraftedTeamPlayer } from '~/types/DraftedTeamPlayer';

/**
 * Base data required for both user and admin emails
 */
export type BaseEmailData = {
  team_name: string;
  allowed_transfers: boolean;
  total_team_value: number;
  key: string;
};

/**
 * Data for user confirmation emails
 */
export type UserEmailData = BaseEmailData;

/**
 * Data for admin notification emails
 */
export type AdminEmailData = BaseEmailData & {
  team_owner: string;
  team_email: string;
};

/**
 * Email template context with players and data
 */
export type EmailTemplateContext<T = BaseEmailData> = {
  players: DraftedTeamPlayer[];
  data: T;
};

/**
 * Email component props for consistent styling
 */
export type EmailComponentProps = {
  style?: Record<string, string>;
  className?: string;
};

/**
 * Header component configuration
 */
export type EmailHeaderProps = EmailComponentProps & {
  title: string;
  subtitle?: string;
  backgroundColor?: string;
};

/**
 * Squad table configuration
 */
export type SquadTableProps = EmailComponentProps & {
  players: DraftedTeamPlayer[];
  showIcons?: boolean;
};

/**
 * Team info component configuration
 */
export type TeamInfoProps = EmailComponentProps & {
  allowedTransfers: boolean;
  totalValue: number;
  showAsAlert?: boolean;
};
