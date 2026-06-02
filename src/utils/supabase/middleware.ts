import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database'
import { AKTIVNA_FIRMA_COOKIE, getAktivnaFirmaIdFromRequest } from '@/lib/aktivnaFirmaCookie'

function getSupabaseEnv() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
    if (!url || !anonKey) return null
    return { url, anonKey }
}

export async function updateSession(request: NextRequest) {
    const env = getSupabaseEnv()
    if (!env) {
        // Na Vercelu postavite NEXT_PUBLIC_SUPABASE_URL i NEXT_PUBLIC_SUPABASE_ANON_KEY
        return NextResponse.next({ request })
    }

    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient<Database>(
        env.url,
        env.anonKey,
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

    if (request.nextUrl.pathname.startsWith('/izbor-firme') && !user) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    if (request.nextUrl.pathname.startsWith('/dashboard') && user) {
        const aktivnaFirmaId = getAktivnaFirmaIdFromRequest(request)
        if (!aktivnaFirmaId) {
            const url = request.nextUrl.clone()
            url.pathname = '/izbor-firme'
            return NextResponse.redirect(url)
        }

        const { data: firmaOk } = await supabase
            .from('firma')
            .select('id')
            .eq('id', aktivnaFirmaId)
            .eq('user_id', user.id)
            .maybeSingle()

        if (!firmaOk) {
            const url = request.nextUrl.clone()
            url.pathname = '/izbor-firme'
            const res = NextResponse.redirect(url)
            res.cookies.delete(AKTIVNA_FIRMA_COOKIE)
            return res
        }
    }

    const authGuestOnly =
        request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/registracija')

    if (authGuestOnly && user) {
        const url = request.nextUrl.clone()
        url.pathname = '/izbor-firme'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
