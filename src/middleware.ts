import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
    // Ažurira auth sesiju preko svake komande, i odlučuje redirekcije sa .auth.getUser()
    return await updateSession(request)
}

// Matching paths
export const config = {
    matcher: [
        /*
         * Primenjuje se na sve rute OSIM na:
         * - _next/static (static file fajlove)
         * - _next/image (image fajlove)
         * - favicon.ico, /public, etc. (favicon i slike)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
