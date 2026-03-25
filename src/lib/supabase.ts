import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Lazy singletons — se crean solo cuando se llama la función,
// no en tiempo de build. Esto evita el error "supabaseUrl is required".

let _public: SupabaseClient | null = null;
let _admin:  SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_public) {
    _public = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _public;
}

export function getSupabaseAdmin(): SupabaseClient {
  if (!_admin) {
    _admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _admin;
}