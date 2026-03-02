import Button from "@/app/components/Button";


export default function LoginPage() {
    return (
        <section id='Login' className='flex justify-center items-center m-8'>

            <div className='bg-white h-[556px] w-[440px] rounded-lg shadow-lg p-7'>

                <p className='text-2xl font-bold text-center text-left m-1'>Dobrodošli nazad</p>
                <p className='text-center m-1 text-left'>Unesite svoje podatke kako biste se ulogovali</p>

                <div className='mt-3 flex flex-col gap-2'>
                    <label className='text-fcrna text-left m-1'>Email adresa</label>
                    <input className='bg-[#F8FAFC] w-full p-4 rounded-lg border-2 border-[#CBD5E1]' type="text" placeholder='Unesite vas email' />
                    <label className='text-fcrna text-left m-1'>Lozinka</label>
                    <input className='bg-[#F8FAFC] w-full p-4 rounded-lg border-2 border-[#CBD5E1]' type="password" placeholder='Lozinka' />
                    <a className='text-[#137FEC] text-right'>Zaboravili ste lozinku ?</a>
                </div>

                <div className='flex flex-col gap-2 justify-center items-center w-full mt-8 rounded-2xl'>
                    <Button className='w-full' backgroundColor="#137FEC">Prijavi se</Button>

                    <p className='text-[#64748B]'>Nemate nalog ? <span className='text-[#137FEC]'>Registrujte se</span> </p>

                </div>


            </div>

        </section>
    )
}