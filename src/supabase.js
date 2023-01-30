import { createClient } from "@supabase/supabase-js";

const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYzMDE0MzIwMSwiZXhwIjoxOTQ1NzE5MjAxfQ.CsonEZq7BbELLr2Jvqtv985ZiEFbzidGBCEfEtEk2L0";
const SUPABASE_URL = "https://glkylfhlgbxdibbqaqyg.supabase.co";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
