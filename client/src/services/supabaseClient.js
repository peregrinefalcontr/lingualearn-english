import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gbfpbzelnnnepfvsmzjd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZnBiemVsbm5uZXBmdnNtempkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5MDgyNTQsImV4cCI6MjEwNDQ4NDI1NH0.ceg5rLqJjG3SAzomGHeP5AdL59fXRRIVRP4OOYW_rbQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
