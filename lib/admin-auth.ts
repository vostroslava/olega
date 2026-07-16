"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";

let client: SupabaseClient | null = null;

export const adminAuthConfigured = Boolean(supabaseUrl && publishableKey);

export function getAdminAuthClient() {
  if (!adminAuthConfigured) {
    throw new Error("Авторизация администратора ещё не настроена.");
  }

  client ??= createClient(supabaseUrl, publishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });

  return client;
}
