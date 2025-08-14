import { createClient } from '@supabase/supabase-js';

// Replace with your Supabase URL and anon key
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://cuwdnpshdgniocjqrniz.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1d2RucHNoZGduaW9janFybml6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMjkzODgsImV4cCI6MjA2NzkwNTM4OH0.TcWegchh6pBNY-MTNBrACMjVzWr75pWiWtWpm_Msr7E';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 