/* ============================================================
   VANTA AI — SUPABASE CONFIGURATION
   ============================================================ */

const VANTA_SUPABASE_URL =
  "https://nbydifnctqrkotzruocx.supabase.co";

const VANTA_SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_WYltlsk8UqHz83utjPSS6Q_UY4mdPfA";


// Create the Supabase client once
window.vantaSupabase = window.supabase.createClient(
  VANTA_SUPABASE_URL,
  VANTA_SUPABASE_PUBLISHABLE_KEY
);


// Make configuration available globally
window.VANTA_CONFIG = {
  supabaseUrl: VANTA_SUPABASE_URL,
  supabaseClient: window.vantaSupabase
};

console.log("VANTA AI — Supabase connected");