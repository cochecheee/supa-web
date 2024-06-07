import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://vwvjexujemrpyohnwpwh.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3dmpleHVqZW1ycHlvaG53cHdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTU5NTMyNjksImV4cCI6MjAzMTUyOTI2OX0.dNyECVV6_3fL5TBWyWM9dFoN9z9yQIShnELduLvyAug";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
