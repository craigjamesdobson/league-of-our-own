import type { AdminEmailData, EmailTemplateContext } from '../types';
import { generateEmailLayout, generateContentSection, generateTitle, generateParagraph, generateHelpText } from '../components/layout';
import { generateEmailHeader, HEADER_CONFIGS } from '../components/header';
import { generateSquadTable } from '../components/squad-table';
import { generateTeamInfo, generateActionButton, generateMemberDetails } from '../components/team-info';

const config = useRuntimeConfig();

/**
 * Generates admin notification email using modular components
 */
export const generateAdminNotificationEmail = (context: EmailTemplateContext<AdminEmailData>): string => {
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
      `${config.public.SITE_URL}/teams`,
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
