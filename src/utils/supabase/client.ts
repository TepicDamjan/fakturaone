import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    // Kreira browser (klijent) stranu Supabase objekta
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}
