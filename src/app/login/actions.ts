'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { clearAktivnaFirmaId } from '@/lib/aktivnaFirma.server'

export async function login(prevState: any, formData: FormData) {
    const supabase = await createClient()

    // Preuzmi podatke iz input polja (pomoću name atributa)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // Validacija da li su uneti email i password
    if (!email || !password) {
        return { error: 'Email i lozinka su obavezni.' }
    }

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: 'Pogrešan email ili lozinka.' }
    }

    // Ako je prijava uspešna, osveži putanje i redirektuj na /dashboard
    revalidatePath('/dashboard')
    redirect('/izbor-firme')
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    await clearAktivnaFirmaId()

    // Očisti keš servera i redirektuj nazad na /login
    revalidatePath('/', 'layout')
    redirect('/login')
}
