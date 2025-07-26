/**
 * Standalone email template generators for preview system
 * These don't depend on Nuxt composables and can run in Node.js
 */

import type { UserEmailData, AdminEmailData, EmailTemplateContext } from '../types';
import { generateEmailLayout, generateContentSection, generateTitle, generateParagraph, generateHelpText } from '../components/layout';
import { generateEmailHeader, HEADER_CONFIGS } from '../components/header';
import { generateSquadTable } from '../components/squad-table';
import { generateTeamInfo, generateActionButton, generateMemberDetails } from '../components/team-info';

// Mock config for standalone usage
const MOCK_CONFIG = {
  public: {
    SITE_URL: 'https://leagueofourown.example.com',
  },
};

/**
 * Standalone user confirmation email generator
 */
export const generateUserConfirmationEmailStandalone = (context: EmailTemplateContext<UserEmailData>): string => {
  const { players, data } = context;

  // Generate email sections using components
  const header = generateEmailHeader({
    ...HEADER_CONFIGS.USER_CONFIRMATION,
  });

  const content = generateContentSection(`
    ${generateTitle(`Team Confirmation: ${data.team_name}`)}
    
    ${generateParagraph('Thank you for submitting your team! Here are your selected players:')}
    
    <!-- Team Squad -->
    ${generateSquadTable({ players, showIcons: true })}
    
    ${generateTeamInfo({
      allowedTransfers: data.allowed_transfers,
      totalValue: data.total_team_value,
      showAsAlert: false,
    })}
    
    ${generateActionButton(
      'Edit Your Team',
      `${MOCK_CONFIG.public.SITE_URL}/team-builder?id=${data.key}`,
    )}
    
    ${generateHelpText(
      'Need help? Contact us at <a href="mailto:leagueofourown.fpl@gmail.com" style="color: #0b0c3d;">leagueofourown.fpl@gmail.com</a>',
    )}
  `);

  return generateEmailLayout({
    title: 'Your Team Confirmation - League of Our Own',
    content: header + content,
  });
};

/**
 * Standalone admin notification email generator
 */
export const generateAdminNotificationEmailStandalone = (context: EmailTemplateContext<AdminEmailData>): string => {
  const { players, data } = context;

  // Generate email sections using components
  const header = generateEmailHeader({
    ...HEADER_CONFIGS.ADMIN_NOTIFICATION,
  });

  const content = generateContentSection(`
    ${generateTitle(`Welcome ${data.team_owner}!`)}
    
    ${generateParagraph('A new member has joined the league and submitted their team:')}
    
    ${generateMemberDetails({
      name: data.team_owner,
      teamName: data.team_name,
      email: data.team_email,
    })}
    
    ${generateTeamInfo({
      allowedTransfers: data.allowed_transfers,
      totalValue: data.total_team_value,
      showAsAlert: true,
    })}
    
    <!-- Team Squad -->
    <h3 style="color: #0b0c3d; margin: 30px 0 15px 0; font-size: 18px;">Their Starting Squad</h3>
    ${generateSquadTable({ players, showIcons: true })}
    
    ${generateActionButton(
      'View All Teams Progress',
      `${MOCK_CONFIG.public.SITE_URL}/teams`,
    )}
    
    ${generateHelpText(
      'Keep track of everyone\'s teams and see how the league is shaping up!',
      { textAlign: 'center' },
    )}
  `);

  return generateEmailLayout({
    title: 'New Team Submission - League of Our Own Admin',
    content: header + content,
  });
};
