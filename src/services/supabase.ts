import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pdwblxvurmdzkjhxzobc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkd2JseHZ1cm1kemtqaHh6b2JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MjcyNTgsImV4cCI6MjA4NTUwMzI1OH0.KBUHatvXretLGv3r1HTD_rt5F6Rl8UhEzQ64yod3pYw';

export const supabase = createClient(supabaseUrl, supabaseKey);
