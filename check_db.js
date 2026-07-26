import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing Supabase environment variables. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY."
  );
}

function isNewSupabaseApiKey(value: string) {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

function createSupabaseFetch(supabaseKey: string) {
  return (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request
        ? input.headers
        : undefined
    );

    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) =>
        headers.set(key, value)
      );
    }

    if (
      isNewSupabaseApiKey(supabaseKey) &&
      headers.get("Authorization") === `Bearer ${supabaseKey}`
    ) {
      headers.delete("Authorization");
    }

    headers.set("apikey", supabaseKey);

    return fetch(input, {
      ...init,
      headers,
    });
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
    email: process.env.ADMIN_EMAIL || "admin@gmail.com",
    password: process.env.ADMIN_PASSWORD || "admin@123",
  });

  if (error) {
    console.log("❌ LOGIN FAILED!");
    console.log(error);
  } else {
    console.log("✅ LOGIN SUCCESSFUL!");
    console.log(data.user?.email);
  }

  process.exit(0);
}

check();