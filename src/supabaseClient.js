// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dxtkbhvaclofrlalbhrf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4dGtiaHZhY2xvZnJsYWxiaHJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4MTEyNzYsImV4cCI6MjA2ODM4NzI3Nn0.az6TDz41JRyZu1JZVJvT32efKI8mk9nCbb2DrU2VzS4';

export const supabase = createClient(supabaseUrl, supabaseKey);
