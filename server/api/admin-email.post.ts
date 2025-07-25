import { Resend } from 'resend';
import { handleEmailSending } from '~/server/utils/email';

const resend = new Resend(process.env.RESEND_API_KEY);

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  try {
    const data = await handleEmailSending({
      from: 'Jim & Craig <leagueofourown@craigjamesdobson.dev>',
      to: [body.email],
      subject: 'A new team has been submitted',
      html: body.html,
    }, resend, event);

    return data;
  }
  catch (error) {
    return { error };
  }
});
