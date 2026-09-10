import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ajpsdqdzeuvykgbvmkea.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_9PTsLHlLExGiO7w391Z7NA_SAzLfFJX";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
