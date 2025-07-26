import type { EmailHeaderProps } from '../types';

/**
 * League logo SVG - extracted as a constant for reusability
 */
const LEAGUE_LOGO_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="32px" height="32px" viewBox="0 0 32 32" style="margin-bottom: 10px;"><circle cx="17" cy="28" r="2" fill="#ffffff"/><path fill="#ffffff" d="M8 20.586L13.586 15L15 16.414L9.414 22z"/><path fill="#ffffff" d="M28 16.584L19.414 8H6v2h12.586l3 3L6 28.586L7.414 30L23 14.415L26.584 18L23 21.586L24.414 23L28 19.416a2.004 2.004 0 0 0 0-2.832M24.5 9A3.5 3.5 0 1 1 28 5.5A3.504 3.504 0 0 1 24.5 9m0-5A1.5 1.5 0 1 0 26 5.5A1.5 1.5 0 0 0 24.5 4"/></svg>`;

/**
 * Generates the email header with league branding
 */
export const generateEmailHeader = (props: EmailHeaderProps): string => {
  const {
    title,
    subtitle,
    backgroundColor = '#0b0c3d',
    style = {},
  } = props;

  const headerStyle = {
    backgroundColor,
    padding: '20px',
    textAlign: 'center',
    ...style,
  };

  const styleString = Object.entries(headerStyle)
    .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
    .join('; ');

  return `
        <tr>
            <td style="${styleString}">
                ${LEAGUE_LOGO_SVG}
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">${title}</h1>
                ${subtitle ? `<p style="color: #c8c9e6; margin: 5px 0 0 0; font-size: 14px;">${subtitle}</p>` : ''}
            </td>
        </tr>`;
};

/**
 * Common header configurations
 */
export const HEADER_CONFIGS = {
  USER_CONFIRMATION: {
    title: 'League of Our Own',
    backgroundColor: '#0b0c3d',
  },
  ADMIN_NOTIFICATION: {
    title: 'New League Member',
    backgroundColor: '#dc3545',
  },
} as const;
