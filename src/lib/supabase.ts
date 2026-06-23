/// <reference types="vite/client" />

const isConfigured = !!import.meta.env.VITE_SUPABASE_URL && 
                     !import.meta.env.VITE_SUPABASE_URL.includes('placeholder') &&
                     !!import.meta.env.VITE_SUPABASE_ANON_KEY &&
                     !import.meta.env.VITE_SUPABASE_ANON_KEY.includes('placeholder');

let activeClient: any = null;

// Helper to create the bypass mock client
const createMockClient = (): any => {
  function MockConstructor() {}
  const proxyMock: any = new Proxy(MockConstructor, {
    get(target: any, prop: string | symbol): any {
      if (prop === 'then') {
        return (resolve: any) => resolve({ data: [], error: null, count: 0 });
      }
      if (prop === 'auth') {
        return {
          getSession: async () => ({ data: { session: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          signUp: async () => ({ data: { user: null }, error: new Error('Bypass mode active') }),
          signInWithPassword: async () => ({ data: { user: null, session: null }, error: new Error('Bypass mode active') }),
          signOut: async () => ({ error: null }),
        };
      }
      if (prop === 'storage') {
        return {
          from: () => ({
            upload: async () => ({ data: null, error: new Error('Bypass mode active') }),
            getPublicUrl: () => ({ data: { publicUrl: '' } }),
            remove: async () => ({ data: null, error: null }),
          })
        };
      }
      return createMockClient();
    },
    apply(target, thisArg, argumentsList) {
      return createMockClient();
    },
    construct(target, argumentsList, newTarget) {
      return createMockClient();
    }
  });
  return proxyMock;
};

// Start with the mock client by default
activeClient = createMockClient();

if (isConfigured) {
  // Asynchronously load Supabase only if configured, catching any import or run runtime errors (like Illegal constructor)
  import('@supabase/supabase-js')
    .then(({ createClient }) => {
      try {
        const options: any = {};
        if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
          options.global = {
            fetch: (input: RequestInfo | URL, init?: RequestInit) => window.fetch(input, init)
          };
        }
        const realClient = createClient(
          import.meta.env.VITE_SUPABASE_URL || '',
          import.meta.env.VITE_SUPABASE_ANON_KEY || '',
          options
        );
        // Successfully initialized real client, swap active reference
        activeClient = realClient;
        console.log('Supabase client loaded successfully.');
      } catch (e) {
        console.warn('Error constructing real Supabase client, keeping simulated fallback:', e);
      }
    })
    .catch((err) => {
      console.warn('Failed to dynamically load @supabase/supabase-js, keeping simulated fallback:', err);
    });
}

// Export a Proxy that dynamically routes all calls to whatever the active client is
export const supabase = new Proxy(function() {}, {
  get(target: any, prop: string | symbol): any {
    if (activeClient) {
      const val = activeClient[prop];
      if (typeof val === 'function') {
        return val.bind(activeClient);
      }
      return val;
    }
    return undefined;
  },
  set(target: any, prop: string | symbol, value: any): boolean {
    if (activeClient) {
      activeClient[prop] = value;
      return true;
    }
    return false;
  },
  apply(target, thisArg, argumentsList) {
    if (activeClient && typeof activeClient === 'function') {
      return Reflect.apply(activeClient, thisArg, argumentsList);
    }
  },
  construct(target, argumentsList, newTarget) {
    if (activeClient && typeof activeClient === 'function') {
      return Reflect.construct(activeClient, argumentsList, newTarget);
    }
    return {};
  }
});



