import { createClient } from '@supabase/supabase-js'

const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjMwMTQzMjAxLCJleHAiOjE5NDU3MTkyMDF9.R9KMwp3ZX_7lsugwRlU6iYMQ1b57jrdYOqNJFdWlo48'

const supabaseUrl = 'https://glkylfhlgbxdibbqaqyg.supabase.co'
const supabase = createClient(supabaseUrl, SUPABASE_KEY)

export { supabase };
