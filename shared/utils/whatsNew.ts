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
    title: 'Manage your team transfers',
    summary: 'Use the private team management link sent to the email address used when your team was submitted. If you need it again, you can request a new link from the manage team page.',
    link: {
      label: 'View transfer options',
      to: '/manage-team',
    },
    details: [
      'Choose players leaving and joining your squad, with your current team and transfer budget shown alongside the request.',
      'Submit up to two transfers when they are available in the current transfer period.',
      'Review or update pending requests before the weekly transfer deadline.',
      `You can still request transfers by email. Send your request to ${TRANSFER_REQUEST_EMAIL} using the copyable template on the transfer options page.`,
      'Every request is checked and approved by the league team before any changes go live.',
    ],
  },
];
