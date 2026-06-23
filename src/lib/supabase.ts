/// <reference types="vite/client" />
import './polyfills';

const isConfigured = !!import.meta.env.VITE_SUPABASE_URL && 
                     !import.meta.env.VITE_SUPABASE_URL.includes('placeholder') &&
                     !!import.meta.env.VITE_SUPABASE_ANON_KEY &&
                     !import.meta.env.VITE_SUPABASE_ANON_KEY.includes('placeholder') &&
                     !(typeof sessionStorage !== 'undefined' && sessionStorage.getItem('bypass_supabase') === 'true');

let activeClient: any = null;

// Helper to create the bypass mock client
const createMockClient = (path: string[] = []): any => {
  function MockConstructor() {}
  const proxyMock: any = new Proxy(MockConstructor, {
    get(target: any, prop: string | symbol): any {
      if (typeof prop !== 'string') {
        if (prop === Symbol.toPrimitive) {
          return () => 'MockClient';
        }
        return undefined;
      }
      if (prop === 'isMockProxy') return true;
      if (prop === 'then') {
        return (resolve: any) => {
          // If the chain involves 'admins'
          if (path.includes('admins')) {
            const adminRow = {
              id: 'simulated-admin-id',
              email: 'admin@foreclosedautodeals.com',
              name: 'Demo Admin',
              created_at: new Date().toISOString()
            };
            return resolve({
              data: path.includes('maybeSingle') || path.includes('single') ? adminRow : [adminRow],
              error: null,
              count: 1
            });
          }
          if (path.includes('settings')) {
            const settingsRow = {
              id: 'global_settings',
              company_name: 'Foreclosed Auto Deals',
              whatsapp: 'https://wa.me/15555550199',
              phone: '+1 (555) 555-0199',
              email: 'assets@foreclosedautodeals.com',
              address: '4420 Sovereign Way, Suite 100, Miami, FL 33130',
              social_links: {
                facebook: 'https://facebook.com',
                instagram: 'https://instagram.com',
                twitter: 'https://twitter.com',
                youtube: 'https://youtube.com'
              }
            };
            return resolve({
              data: path.includes('maybeSingle') || path.includes('single') ? settingsRow : [settingsRow],
              error: null,
              count: 1
            });
          }
          // Default response for query selectors
          return resolve({
            data: path.includes('maybeSingle') || path.includes('single') ? null : [],
            error: null,
            count: 0
          });
        };
      }
      if (prop === 'auth') {
        return {
          getSession: async () => {
            const token = localStorage.getItem('admin_token');
            if (token) {
              const user = {
                id: 'simulated-admin-id',
                email: 'admin@foreclosedautodeals.com',
                created_at: new Date().toISOString()
              };
              return { data: { session: { access_token: token, user } }, error: null };
            }
            return { data: { session: null }, error: null };
          },
          onAuthStateChange: (callback?: any) => {
            if (callback) {
              const token = localStorage.getItem('admin_token');
              if (token) {
                const user = {
                  id: 'simulated-admin-id',
                  email: 'admin@foreclosedautodeals.com',
                  created_at: new Date().toISOString()
                };
                setTimeout(() => {
                  try {
                    callback('SIGNED_IN', { access_token: token, user });
                  } catch (e) {}
                }, 0);
              }
            }
            return { data: { subscription: { unsubscribe: () => {} } } };
          },
          signUp: async ({ email, password, options }: any) => {
            const user = {
              id: 'simulated-admin-id',
              email: email || 'admin@foreclosedautodeals.com',
              created_at: new Date().toISOString(),
              user_metadata: options?.data || {}
            };
            const session = {
              access_token: 'simulated-bypass-token',
              user
            };
            return { data: { user, session }, error: null };
          },
          signInWithPassword: async ({ email, password }: any) => {
            const user = {
              id: 'simulated-admin-id',
              email: email || 'admin@foreclosedautodeals.com',
              created_at: new Date().toISOString()
            };
            const session = {
              access_token: 'simulated-bypass-token',
              user
            };
            return { data: { user, session }, error: null };
          },
          signOut: async () => {
            return { error: null };
          },
        };
      }
      if (prop === 'storage') {
        return {
          from: () => ({
            upload: async () => ({ data: { path: 'mock-path' }, error: null }),
            getPublicUrl: () => ({ data: { publicUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200' } }),
            remove: async () => ({ data: null, error: null }),
          })
        };
      }
      return createMockClient([...path, prop]);
    },
    apply(target, thisArg, argumentsList) {
      const strArgs = argumentsList.map(a => typeof a === 'string' ? a : '').filter(Boolean);
      return createMockClient([...path, ...strArgs]);
    },
    construct(target, argumentsList, newTarget) {
      return createMockClient(path);
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
      if (typeof val === 'function' && !val.isMockProxy) {
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



