// Layout utilities for email templates

/**
 * Base email layout configuration
 */
export type EmailLayoutProps = {
  title: string;
  content: string;
  maxWidth?: string;
};

/**
 * Common email styles that can be reused
 */
export const EMAIL_STYLES = {
  BODY: {
    margin: '0',
    padding: '0',
    fontFamily: 'Arial, sans-serif',
    lineHeight: '1.6',
    color: '#333333',
    backgroundColor: '#f4f4f4',
  },
  CONTAINER: {
    width: '100%',
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
  },
  CONTENT_CELL: {
    padding: '30px 20px',
  },
  TITLE: {
    color: '#0b0c3d',
    margin: '0 0 20px 0',
    fontSize: '20px',
  },
  PARAGRAPH: {
    margin: '0 0 20px 0',
    fontSize: '16px',
  },
  HELP_TEXT: {
    margin: '20px 0 0 0',
    fontSize: '14px',
    color: '#666666',
    textAlign: 'center',
  },
} as const;

/**
 * Converts a style object to inline CSS string
 */
export const stylesToString = (styles: Record<string, string | number>): string => {
  return Object.entries(styles)
    .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
    .join('; ');
};

/**
 * Generates the base HTML structure for emails
 */
export const generateEmailLayout = (props: EmailLayoutProps): string => {
  const { title, content, maxWidth = '600px' } = props;

  const bodyStyle = stylesToString(EMAIL_STYLES.BODY);
  const containerStyle = stylesToString({
    ...EMAIL_STYLES.CONTAINER,
    maxWidth,
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body style="${bodyStyle}">
    <table style="${containerStyle}" cellpadding="0" cellspacing="0">
        ${content}
    </table>
</body>
</html>`.trim();
};

/**
 * Generates a content section wrapper
 */
export const generateContentSection = (content: string, style?: Record<string, string>): string => {
  const sectionStyle = stylesToString({
    ...EMAIL_STYLES.CONTENT_CELL,
    ...style,
  });

  return `
        <tr>
            <td style="${sectionStyle}">
                ${content}
            </td>
        </tr>`;
};

/**
 * Common email text elements
 */
export const generateTitle = (text: string, style?: Record<string, string>): string => {
  const titleStyle = stylesToString({
    ...EMAIL_STYLES.TITLE,
    ...style,
  });

  return `<h2 style="${titleStyle}">${text}</h2>`;
};

export const generateParagraph = (text: string, style?: Record<string, string>): string => {
  const paragraphStyle = stylesToString({
    ...EMAIL_STYLES.PARAGRAPH,
    ...style,
  });

  return `<p style="${paragraphStyle}">${text}</p>`;
};

export const generateHelpText = (text: string, style?: Record<string, string>): string => {
  const helpStyle = stylesToString({
    ...EMAIL_STYLES.HELP_TEXT,
    ...style,
  });

  return `<p style="${helpStyle}">${text}</p>`;
};
