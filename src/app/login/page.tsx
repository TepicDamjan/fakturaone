"use client"

import Button from "@/app/components/Button";
import { login } from './actions';
import { useActionState } from 'react';

const initialState = {
    error: '',
}

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(login, initialState)

    return (
        <section id='Login' className='flex justify-center items-center min-h-screen bg-gray-50 m-0 px-4 py-8'>

            <div className='bg-white w-full max-w-[440px] rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100 flex flex-col justify-center'>

                <h1 className='text-3xl font-bold text-gray-900 m-1'>Dobrodošli nazad</h1>
                <p className='text-gray-500 m-1 mb-6'>Unesite svoje podatke kako biste se ulogovali</p>

                <form action={formAction} className='flex flex-col gap-4'>
                    <div className="flex flex-col gap-1.5">
                        <label className='font-medium text-gray-700 text-sm m-1'>Email adresa</label>
                        <input
                            name="email"
                            className='bg-[#F8FAFC] w-full p-4 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:bg-white transition-all'
                            type="email"
                            placeholder='Unesite vaš email'
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center m-1">
                            <label className='font-medium text-gray-700 text-sm'>Lozinka</label>
                            <a href="#" className='text-[#137FEC] text-sm hover:underline hover:text-blue-700'>Zaboravili ste lozinku?</a>
                        </div>
                        <input
                            name="password"
                            className='bg-[#F8FAFC] w-full p-4 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:bg-white transition-all'
                            type="password"
                            placeholder='Unesite lozinku'
                            required
                        />
                    </div>

                    {/* Prikaz eventualnih grešaka */}
                    {state?.error && (
                        <p className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg mt-2">
                            {state.error}
                        </p>
                    )}

                    <div className='flex flex-col gap-3 justify-center items-center w-full mt-6'>
                        <Button
                            className='w-full py-3 text-lg'
                            backgroundColor="#137FEC"
                            type="submit"
                            disabled={isPending}
                        >
                            {isPending ? 'Prijava u toku...' : 'Prijavi se'}
                        </Button>

                        <p className='text-[#64748B] mt-2'>
                            Nemate nalog? <a href="/registracija" className='text-[#137FEC] font-medium hover:underline'>Registrujte se</a>
                        </p>
                    </div>
                </form>

            </div>

        </section>
    )
}