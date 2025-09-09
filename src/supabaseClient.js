import { createClient } from '@supabase/supabase-js';

// Replace with your Supabase URL and anon key
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://mocdyrlqznqaulkwfkgi.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2R5cmxxem5xYXVsa3dma2dpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNTQ3NTEsImV4cCI6MjA3MDczMDc1MX0.yrFlmY9RcMBdwpUOMPJxvYjPhMKJPCI3m-LcM8RmM9I';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false, // Disable auto refresh for admin sessions
    persistSession: false,   // Don't persist sessions to avoid token issues
    detectSessionInUrl: false,
    flowType: 'pkce'
  }
}); 