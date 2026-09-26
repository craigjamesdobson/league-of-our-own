import type { H3Event } from 'h3';

export const getTeamManagementUrl = (event: H3Event, teamKey: string): string => {
  const config = useRuntimeConfig(event);
  const configuredSiteUrl = String(config.public.SITE_URL ?? '').trim();

  if (!configuredSiteUrl) {
    throw new Error('SITE_URL is required to send team management links');
  }

  const manageUrl = new URL('/manage-team', configuredSiteUrl);
  manageUrl.searchParams.set('key', teamKey);
  return manageUrl.toString();
};
