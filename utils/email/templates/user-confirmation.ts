import type { UserEmailData, EmailTemplateContext } from '../types';
import { generateEmailLayout, generateContentSection, generateTitle, generateParagraph, generateHelpText } from '../components/layout';
import { generateEmailHeader, HEADER_CONFIGS } from '../components/header';
import { generateSquadTable } from '../components/squad-table';
import { generateTeamInfo, generateActionButton } from '../components/team-info';

const config = useRuntimeConfig();

/**
 * Generates user confirmation email using modular components
 */
export const generateUserConfirmationEmail = (context: EmailTemplateContext<UserEmailData>): string => {
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
      `${config.public.SITE_URL}/team-builder?id=${data.key}`,
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
