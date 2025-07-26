import type { TeamInfoProps } from '../types';

/**
 * Icons for team info display
 */
const TEAM_INFO_ICONS = {
  TRANSFERS_ENABLED: `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="vertical-align: middle; margin-right: 6px;">
        <path d="M9 12l2 2 4-4" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="12" cy="12" r="10" stroke="#22c55e" stroke-width="2"/>
    </svg>`,
  TRANSFERS_DISABLED: `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="vertical-align: middle; margin-right: 6px;">
        <path d="M18 6L6 18" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M6 6l12 12" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="12" cy="12" r="10" stroke="#ef4444" stroke-width="2"/>
    </svg>`,
  TEAM_VALUE: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" style="vertical-align: middle; margin-right: 6px;" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.5"><path stroke-linecap="round" d="M14.5 8.5c-.78-.202-1.866-.5-2.735-.5C7.476 8 4 10.668 4 13.958c0 1.891 1.148 3.577 2.938 4.668l-.485 1.6a.6.6 0 0 0 .574.774h1.764a.6.6 0 0 0 .36-.12l1.395-1.047h2.437l1.395 1.047a.6.6 0 0 0 .36.12h1.764a.6.6 0 0 0 .574-.774l-.485-1.6c1.067-.65 1.905-1.511 2.409-2.501M14.5 8.5L19 7l-.084 3.628L21 11.5V15l-1.926 1"/><path fill="currentColor" stroke-linecap="round" d="M15.5 13a.5.5 0 1 1 0-1a.5.5 0 0 1 0 1"/><path stroke-linecap="round" d="M2 10s0 2.4 2 3"/><path d="M12.8 7.753c.13-.372.2-.772.2-1.188C13 4.596 11.433 3 9.5 3S6 4.596 6 6.565c0 .941.358 1.798.944 2.435"/></g></svg>`,
} as const;

/**
 * Generates team info display for emails
 */
export const generateTeamInfo = (props: TeamInfoProps): string => {
  const { allowedTransfers, totalValue, showAsAlert = false, style = {} } = props;

  if (showAsAlert) {
    return generateAlertStyleTeamInfo(props);
  }

  const containerStyle = {
    backgroundColor: '#f8f9fa',
    borderLeft: '4px solid #0b0c3d',
    padding: '15px',
    margin: '20px 0',
    ...style,
  };

  const styleString = Object.entries(containerStyle)
    .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
    .join('; ');

  const transferIcon = allowedTransfers
    ? TEAM_INFO_ICONS.TRANSFERS_ENABLED
    : TEAM_INFO_ICONS.TRANSFERS_DISABLED;

  return `
    <div style="${styleString}">
        <p style="margin: 0 0 10px 0;">
            ${transferIcon}<strong>Transfers:</strong> ${allowedTransfers ? 'Enabled' : 'Disabled'}
        </p>
        <p style="margin: 0;">
            ${TEAM_INFO_ICONS.TEAM_VALUE}<strong>Total Team Value:</strong> £${totalValue}m
        </p>
    </div>`;
};

/**
 * Generates alert-style team info (used in admin emails)
 */
const generateAlertStyleTeamInfo = (props: TeamInfoProps): string => {
  const { allowedTransfers, totalValue, style = {} } = props;

  const backgroundColor = allowedTransfers ? '#d1ecf1' : '#fff3cd';
  const borderColor = allowedTransfers ? '#bee5eb' : '#ffeaa7';

  const containerStyle = {
    backgroundColor,
    border: `1px solid ${borderColor}`,
    borderRadius: '6px',
    padding: '15px',
    margin: '20px 0',
    ...style,
  };

  const styleString = Object.entries(containerStyle)
    .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
    .join('; ');

  const transferIcon = allowedTransfers
    ? TEAM_INFO_ICONS.TRANSFERS_ENABLED
    : TEAM_INFO_ICONS.TRANSFERS_DISABLED;

  return `
    <div style="${styleString}">
        <p style="margin: 0 0 10px 0; font-weight: bold;">
            ${transferIcon}Transfers: ${allowedTransfers ? 'Enabled' : 'Disabled'}
        </p>
        <p style="margin: 0; font-weight: bold;">
            ${TEAM_INFO_ICONS.TEAM_VALUE}Total Value: £${totalValue}m
        </p>
    </div>`;
};

/**
 * Generates action button for emails
 */
export const generateActionButton = (
  text: string,
  url: string,
  options: { backgroundColor?: string; color?: string; style?: Record<string, string> } = {},
): string => {
  const { backgroundColor = '#0b0c3d', color = '#ffffff', style = {} } = options;

  const buttonStyle = {
    display: 'inline-block',
    backgroundColor,
    color,
    textDecoration: 'none',
    padding: '14px 28px',
    borderRadius: '6px',
    fontWeight: 'bold',
    fontSize: '16px',
    ...style,
  };

  const styleString = Object.entries(buttonStyle)
    .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
    .join('; ');

  return `
    <div style="text-align: center; margin: 30px 0;">
        <a href="${url}" style="${styleString}">
            ${text}
        </a>
    </div>`;
};

/**
 * Generates member details section (for admin emails)
 */
export const generateMemberDetails = (data: {
  name: string;
  teamName: string;
  email: string;
}): string => {
  return `
    <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 6px; padding: 20px; margin: 20px 0;">
        <h3 style="color: #0b0c3d; margin: 0 0 15px 0; font-size: 18px;">New Member Details</h3>
        <table style="width: 100%;" cellpadding="0" cellspacing="0">
            <tr>
                <td style="padding: 5px 0; font-weight: bold; color: #666666; width: 120px;">Name:</td>
                <td style="padding: 5px 0;">${data.name}</td>
            </tr>
            <tr>
                <td style="padding: 5px 0; font-weight: bold; color: #666666;">Team:</td>
                <td style="padding: 5px 0; font-weight: bold;">${data.teamName}</td>
            </tr>
            <tr>
                <td style="padding: 5px 0; font-weight: bold; color: #666666;">Email:</td>
                <td style="padding: 5px 0;"><a href="mailto:${data.email}" style="color: #0b0c3d;">${data.email}</a></td>
            </tr>
        </table>
    </div>`;
};
