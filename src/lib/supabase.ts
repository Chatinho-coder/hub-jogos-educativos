import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wadhrxnhuwbdgwoyeqfe.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhZGhyeG5odXdiZGd3b3llcWZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NTQzNTIsImV4cCI6MjA4NzQzMDM1Mn0.xqRGyQsQLrpkBqN25dCNlG5QRk_0Gb7q-0LbV0ttVi8'

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface Score {
  id?: number
  user_id: string
  user_email: string
  game: string
  score: number
  created_at?: string
}
