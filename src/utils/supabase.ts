import { createClient } from '@supabase/supabase-js';

// ✅ Make sure you have these variables in your .env.local file
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;

// 🔗 Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
