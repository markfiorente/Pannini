import { createClient } from '@supabase/supabase-js';

// Setup:
// 1. Go to https://supabase.com and create a free project
// 2. In your project go to Settings > API
// 3. Replace the values below with your Project URL and anon/public key
// 4. Run the SQL in supabase/schema.sql in your project's SQL editor
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
