import { createClient } from '@supabase/supabase-js'

const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYzMDE0MzIwMSwiZXhwIjoxOTQ1NzE5MjAxfQ.CsonEZq7BbELLr2Jvqtv985ZiEFbzidGBCEfEtEk2L0'

const supabaseUrl = 'https://glkylfhlgbxdibbqaqyg.supabase.co'
const supabase = createClient(supabaseUrl, SUPABASE_KEY)

export { supabase };
