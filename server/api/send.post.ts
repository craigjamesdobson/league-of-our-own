import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  try {
    const data = await resend.emails.send({
      from: 'TEST <test@craigjamesdobson.dev>',
      to: [body.email],
      subject: 'Hello world',
      html: '<strong>It works!</strong>',
    });

    return data;
  } catch (error) {
    return { error };
  }
});
