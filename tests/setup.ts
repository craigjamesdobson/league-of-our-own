import { vi } from 'vitest';

// Global mock for Supabase - intercepts @supabase/supabase-js imports
// This ensures all Supabase calls in tests use controlled mock responses
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(),
    rpc: vi.fn(),
    // Additional Supabase methods will be added as needed
  })),
}));
