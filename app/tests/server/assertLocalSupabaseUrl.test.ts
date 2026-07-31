import { describe, expect, it } from 'vitest';
import { assertLocalSupabaseUrl } from '../../../server/utils/localSupabase';

describe('assertLocalSupabaseUrl', () => {
  it('accepts loopback Supabase URLs', () => {
    expect(() => assertLocalSupabaseUrl('http://127.0.0.1:54321')).not.toThrow();
    expect(() => assertLocalSupabaseUrl('http://localhost:54321')).not.toThrow();
    expect(() => assertLocalSupabaseUrl('http://[::1]:54321')).not.toThrow();
  });

  it('rejects malformed and non-local Supabase URLs', () => {
    expect(() => assertLocalSupabaseUrl('not-a-url')).toThrow(
      'Refusing to seed: Supabase URL is invalid',
    );
    expect(() => assertLocalSupabaseUrl('https://example.supabase.co')).toThrow(
      'Refusing to seed non-local Supabase URL: example.supabase.co',
    );
  });
});
