// What this file does: makes the two Supabase clients, server side only.
// - getUserClient: acts as the signed-in person (reads their login cookie).
// - getAdminClient: uses the service key and skips Row Level Security.
//   Only use it after the server has checked who the caller is.
import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

function need(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

export async function getUserClient() {
  const store = await cookies();
  return createServerClient(need("NEXT_PUBLIC_SUPABASE_URL"), need("NEXT_PUBLIC_SUPABASE_ANON_KEY"), {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Cookies cannot be set in some server contexts. Safe to ignore.
        }
      },
    },
  });
}

export function getAdminClient(): SupabaseClient {
  return createClient(need("NEXT_PUBLIC_SUPABASE_URL"), need("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
