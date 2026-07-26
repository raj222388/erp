import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://vqfdcjknpcsaptmfzdwv.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_GojpcjtkYq22Rm6ujHQmjQ_XjUVwlSN";

function isNewSupabaseApiKey(value) {
  return value.startsWith('sb_publishable_') || value.startsWith('sb_secret_');
}

function createSupabaseFetch(supabaseKey) {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== 'undefined' && input instanceof Request ? input.headers : undefined,
    );

    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }

    if (isNewSupabaseApiKey(supabaseKey) && headers.get('Authorization') === `Bearer ${supabaseKey}`) {
      headers.delete('Authorization');
    }

    headers.set('apikey', supabaseKey);
    return fetch(input, { ...init, headers });
  };
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  global: {
    fetch: createSupabaseFetch(SUPABASE_ANON_KEY),
  },
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function check() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: "admin@gmail.com",
    password: "admin@123",
  });
  if (error) {
    console.log("❌ LOGIN FAILED!");
    console.log("Message:", error.message);
    console.log("Status Code:", error.status);
  } else {
    console.log("✅ LOGIN SUCCESSFUL!");
    console.log("Logged in User Email:", data?.user?.email);
  }
  process.exit(0);
}

check();
