import type { DraftedTeamPlayer } from '~/types/DraftedTeamPlayer';
import { generateUserConfirmationEmail } from '~/utils/email/templates/user-confirmation';
import { generateAdminNotificationEmail } from '~/utils/email/templates/admin-notification';
import type { UserEmailData, AdminEmailData } from '~/utils/email/types';

/**
 * Generates user team confirmation email
 * @deprecated Use generateUserConfirmationEmail from utils/email/templates
 */
const generateTeamEmail = (players: DraftedTeamPlayer[], data: UserEmailData): string => {
  return generateUserConfirmationEmail({ players, data });
};

/**
 * Generates admin notification email
 * @deprecated Use generateAdminNotificationEmail from utils/email/templates
 */
const generateAdminEmail = (players: DraftedTeamPlayer[], data: AdminEmailData): string => {
  return generateAdminNotificationEmail({ players, data });
};

export { generateTeamEmail, generateAdminEmail };
