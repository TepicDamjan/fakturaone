import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    // Prvo kriramo neizmijenjeni response
    let supabaseResponse = NextResponse.next({
        request,
    })

    // Zatim formiramo supabase sa tim objektima
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    // U Next.js middleware-u osvežavamo "request" i ubacujemo cookie na response
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Poziv `getUser` osvežava jwt (auth token) ukoliko je istekao i produžava cookije
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Proveravamo da li je korisnik ulogovan a posećuje zaštićenu Dashboard rutu
    if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // Ako već ima korisnika, a ide na /login -> Pošalji ga odma' na dashboard 
    if (request.nextUrl.pathname.startsWith('/login') && user) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
