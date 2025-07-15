import { vi } from 'vitest';

// Extend global type to include our test mocks
declare global {
  var _testMocks: {
    useSupabaseClient: () => {
      from: () => unknown;
      rpc: () => unknown;
    };
    useRoute: () => {
      query: { id: string };
    };
    useRouter: () => {
      push: () => void;
    };
    ref: <T>(value: T) => { value: T };
    computed: <T>(fn: () => T) => { value: T };
    watchEffect: (fn: () => void) => () => void;
    readonly: <T>(value: T) => T;
  };
  var _watchEffects: Array<() => void>;
}

// Global mock for Supabase - intercepts @supabase/supabase-js imports
// This ensures all Supabase calls in tests use controlled mock responses
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(),
    rpc: vi.fn(),
    // Additional Supabase methods will be added as needed
  })),
}));

// Initialize global test mocks
global._testMocks = {
  useSupabaseClient: vi.fn(() => ({
    from: vi.fn(),
    rpc: vi.fn(),
  })),
  useRoute: vi.fn(() => ({
    query: { id: '1' },
  })),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
  ref: vi.fn((initialValue) => {
    const reactiveRef = { value: initialValue };
    return reactiveRef;
  }),
  computed: vi.fn((fn) => {
    const computedRef = { value: fn() };
    // Simple reactive update - recalculate when accessed
    Object.defineProperty(computedRef, 'value', {
      get: fn,
      enumerable: true,
      configurable: true,
    });
    return computedRef;
  }),
  watchEffect: vi.fn((fn) => {
    // Store the effect function for later access
    global._watchEffects.push(fn);
    // Execute immediately
    fn();

    // Return a stop function
    const stopFn = () => {};
    stopFn._effect = fn;
    return stopFn;
  }),
  readonly: vi.fn(value => value),
};

// Store watchEffect functions for manual triggering if needed
global._watchEffects = [];

// Assign mocks to global scope for composable access
global.useSupabaseClient = global._testMocks.useSupabaseClient;
global.useRoute = global._testMocks.useRoute;
global.useRouter = global._testMocks.useRouter;
global.ref = global._testMocks.ref;
global.computed = global._testMocks.computed;
global.watchEffect = global._testMocks.watchEffect;
global.readonly = global._testMocks.readonly;
