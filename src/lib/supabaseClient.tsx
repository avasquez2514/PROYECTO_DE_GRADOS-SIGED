import { createClient } from "@supabase/supabase-js";

// 🌐 URL de tu proyecto Supabase
const supabaseUrl = "https://uwkqbjvuuiudbinvwvnf.supabase.co";

// 🔑 Clave pública (anon key)
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3a3FianZ1dWl1ZGJpbnZ3dm5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwNjEwOTIsImV4cCI6MjA2ODYzNzA5Mn0.Ie4WwVrTQgsbBTG_TWRF1KC6eyFIH865NrcoW4cdHpg";

// 🚀 Crear cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
