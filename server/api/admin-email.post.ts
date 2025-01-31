import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  try {
    const data = await resend.emails.send({
      from: 'Jim & Craig <leagueofourown@craigjamesdobson.dev>',
      to: [body.email],
      subject: 'A new team has been submitted',
      html: body.html,
    });

    return data;
  }
  catch (error) {
    return { error };
  }
});
