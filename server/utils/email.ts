import { promises as fs } from 'fs';
import { join } from 'path';
import type { Resend, CreateEmailOptions, CreateEmailResponse } from 'resend';
import type { H3Event } from 'h3';

export const handleEmailSending = async (
  emailData: CreateEmailOptions,
  resend: Resend,
  event: H3Event,
): Promise<CreateEmailResponse> => {
  const config = useRuntimeConfig(event);
  const isDevelopment = config.public.nodeEnv === 'development';

  if (isDevelopment) {
    return await handleDevelopmentEmail(emailData);
  }

  return await resend.emails.send(emailData);
};

const handleDevelopmentEmail = async (emailData: CreateEmailOptions): Promise<CreateEmailResponse> => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `email-${timestamp}.html`;

  try {
    const emailsDir = join(process.cwd(), 'temp', 'emails');
    await fs.mkdir(emailsDir, { recursive: true });

    const filePath = join(emailsDir, filename);
    await fs.writeFile(filePath, emailData.html || '', 'utf8');

    console.log(`Email saved to: ${filePath}`);
  }
  catch (error) {
    console.warn('Failed to save email file:', error);
  }

  return {
    data: {
      id: `dev-email-${Date.now()}`,
    },
    error: null,
  } as CreateEmailResponse;
};
