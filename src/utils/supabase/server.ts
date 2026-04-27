import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
    const cookieStore = await cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // Metod `setAll` se poziva isključivo unutar Server Actions i Route Handlera. 
                        // Ukoliko bude pozvan iz Server Components pojaviće se greška 
                        // koju bezbedno ignorišemo (Cookies u SC-ovima su read-only).
                    }
                },
            },
        }
    )
}
