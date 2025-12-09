// Mock Supabase client - no real setup needed
const mockSupabase = {
  from: (table) => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: (data) => Promise.resolve({ data, error: null }),
    update: (data) => Promise.resolve({ data, error: null }),
    delete: () => Promise.resolve({ data: null, error: null }),
    eq: function (column, value) { return this; },
    single: function () { return this; },
  }),
  auth: {
    signUp: () => Promise.resolve({ data: { user: { id: 'mock-id' } }, error: null }),
    signIn: () => Promise.resolve({ data: { user: { id: 'mock-id' } }, error: null }),
    signInWithPassword: () => Promise.resolve({ data: { user: { id: 'mock-id' } }, error: null }),
    signOut: () => Promise.resolve({ error: null }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
  },
  storage: {
    from: () => ({
      upload: () => Promise.resolve({ data: null, error: null }),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
    }),
  },
};

export const supabase = mockSupabase;

console.log('Using mock Supabase - no real database connected');