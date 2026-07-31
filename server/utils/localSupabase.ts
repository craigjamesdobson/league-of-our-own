const LOOPBACK_HOSTNAMES = new Set(['127.0.0.1', 'localhost', '[::1]']);

export const assertLocalSupabaseUrl = (supabaseUrl: string): void => {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(supabaseUrl);
  }
  catch {
    throw new Error('Refusing to seed: Supabase URL is invalid');
  }

  if (!LOOPBACK_HOSTNAMES.has(parsedUrl.hostname)) {
    throw new Error(
      `Refusing to seed non-local Supabase URL: ${parsedUrl.hostname}`,
    );
  }
};
