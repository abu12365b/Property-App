import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wihbgmcknjofyrvfqefe.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpaGJnbWNrbmpvZnlydmZxZWZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2MjIxODMsImV4cCI6MjA3NTE5ODE4M30.qOweo8O_ZNP_-7O8hZKM33Ci_IOD_VYmJlkcTAZQcI0";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
