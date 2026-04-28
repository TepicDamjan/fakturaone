


import StavkeFakture from "@/app/components/StavkeFakture";

export default function NovaFaktura() {
    return (
        <div>

            <div>

                <div className='m-8'>
                    <h1 className="text-2xl font-bold text-fcrna">Forma za kreiranje nove fakture</h1>
                    <p className='text-xl text-[#64748B]'>Popunite detalje ispod kako biste generisali novu fakturu za vašeg klijenta.</p>
                </div>

                <div className='bg-white rounded-lg m-8 p-6 border border-gray-100 shadow-sm'>
                    <label className='block text-sm font-bold text-[#0F172A] mb-2'>Izbor Klijenta</label>
                    <div className="relative max-w-md">
                        <select
                            className="w-full appearance-none bg-fsiva border border-ftsiva text-[#0F172A] text-sm rounded-lg focus:ring-2 focus:ring-[#137FEC]/20 focus:border-[#137FEC] block p-3 pr-8 transition-all shadow-sm outline-none cursor-pointer hover:border-gray-300"
                            defaultValue=""
                        >
                            <option value="" disabled>Izaberite klijenta...</option>
                            <option value="acme">Acme Corp</option>
                            <option value="globex">Globex Inc</option>
                            <option value="soylent">Soylent Corp</option>
                            <option value="initech">Initech</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>

                    <div className='mt-6 grid grid-cols-2 gap-6'>

                        <div>
                            <label className='block text-sm font-bold text-[#0F172A] mb-2'>Broj fakture</label>
                            <input type='text' className='border-ftsiva border-2 hover:border-fplava focus:border-fplava outline-none transition-colors rounded-lg text-xl font-light w-full max-h-12 h-full p-2 bg-fsiva text-[#0F172A] mb-2'></input>
                        </div>
                        <div>
                            <label className='block text-sm font-bold text-[#0F172A] mb-2'>Referenca ( Opcionalno )</label>
                            <input type='text' className='border-ftsiva border-2 hover:border-fplava focus:border-fplava outline-none transition-colors rounded-lg text-xl font-light w-full max-h-12 h-full p-2 bg-fsiva text-[#0F172A] mb-2'></input>
                        </div>
                        <div>
                            <label className='block text-sm font-bold text-[#0F172A] mb-2'>Datum izdavanja</label>
                            <input type='date' className='border-ftsiva border-2 hover:border-fplava focus:border-fplava outline-none transition-colors rounded-lg text-xl font-light w-full max-h-12 h-full p-2 bg-fsiva text-[#0F172A] mb-2'></input>
                        </div>
                        <div>
                            <label className='block text-sm font-bold text-[#0F172A] mb-2'>Datum placanja</label>
                            <input type='date' className='border-ftsiva border-2 hover:border-fplava focus:border-fplava outline-none transition-colors rounded-lg text-xl font-light w-full max-h-12 h-full p-2 bg-fsiva text-[#0F172A] mb-2'></input>
                        </div>

                    </div>
                </div>

                <StavkeFakture />

                <div className='bg-white rounded-lg m-8 p-6 border border-gray-100 shadow-sm'>
                    <label className='block text-base font-bold text-[#0F172A] mb-4'>Napomene / Uslovi plaćanja</label>
                    <textarea 
                        className='w-full border border-ftsiva border-2 rounded-lg p-4 bg-fsiva text-[#0F172A] min-h-[120px] outline-none hover:border-fplava focus:border-fplava transition-colors resize-y'
                        placeholder='npr. Molimo platite u roku od 15 dana putem bankovnog transfera.'
                    ></textarea>
                </div>

            </div>



        </div>
    );
}