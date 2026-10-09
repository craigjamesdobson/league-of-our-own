import { TRANSFER_REQUEST_EMAIL } from './contact';

export type WhatsNewEntry = {
  id: string;
  publishedAt: string;
  title: string;
  summary: string;
  details: string[];
  link?: {
    label: string;
    to: string;
  };
};

/**
 * Keep entries in newest-first order. The IDs are deliberately stable because
 * they are used by the browser to remember which release notes were seen.
 */
export const whatsNewEntries: WhatsNewEntry[] = [
  {
    id: 'transfer-requests-2026-09-23',
    publishedAt: '2026-10-07T12:00:00Z',
    title: 'Request transfers by email',
    summary: 'Our email transfer page now shows the gameweek and provides a template you can copy into your usual email account.',
    link: {
      label: 'View email instructions',
      to: '/manage-team',
    },
    details: [
      `Keep using your usual email account. Send transfer requests to ${TRANSFER_REQUEST_EMAIL} with the subject shown on the page.`,
      'Copy the template and include your team name, manager name and email, and the IDs, names, clubs and prices of players leaving and joining your squad.',
      'Check the player details and make sure your transfers keep the team within its budget.',
      'The usual Friday 7pm deadline applies. The league team reviews your email and confirms the gameweek before changing your squad.',
    ],
  },
];
