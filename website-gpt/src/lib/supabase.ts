import { createClient } from '@supabase/supabase-js';

// These would typically come from environment variables
// For now, we'll use placeholder values for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

// Create a single supabase client for the entire app
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  return (
    supabaseUrl !== 'https://your-supabase-url.supabase.co' &&
    supabaseAnonKey !== 'your-anon-key'
  );
}; 