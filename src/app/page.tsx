import Link from "next/link";
import Button from "@/app/components/Button";
import Navbar from "@/app/components/Navbar";
import NotificationCard from "@/app/components/NotificationCard";
import FeatureCard from "@/app/components/FeatureCard";
import Footer from "@/app/components/Footer";
import Image from "next/image";


export default function Hero() {
    return (
        <>
            <Navbar />
            <section id="Hero" className='m-8'>
                <div className='flex flex-col items-center justify-center gap-6'>

                    <div className='flex flex-row justify-center items-center  gap-1 bg-[#DBEAFE] p-1 pl-4 pr-4 rounded-2xl text-fplava text-sm font-medium'>
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="8" height="8" rx="4" fill="#137FEC" />
                        </svg>

                        <p>Novo: Automatsko slanje faktura</p>
                    </div>

                    <div className='max-w-4xl flex flex-col justify-center items-center gap-3'>

                        <h1 className='text-fcrna text-7xl font-bold text-center'>
                            Jednostavno upravljanje <span className='text-fplava'>fakturama</span>
                        </h1>
                        <p className='text-center text-fcrna max-w-2xl'>
                            Kreirajte, šaljite i štampajte profesionalne račune za nekoliko sekundi.
                            Sve što vam je potrebno da vodite svoje finansije bez stresa.
                        </p>

                    </div>
                    <div className='flex flex-row gap-4 items-center justify-center'>

                        <Link href="/registracija" className="block">
                            <Button backgroundColor="#137FEC">
                                Započnite besplatno
                            </Button>
                        </Link>
                        <Button backgroundColor="#FFFFFF" textColor="#334155">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7.5 14.5L14.5 10L7.5 5.5V14.5V14.5M10 20C8.61667 20 7.31667 19.7375 6.1 19.2125C4.88333 18.6875 3.825 17.975 2.925 17.075C2.025 16.175 1.3125 15.1167 0.7875 13.9C0.2625 12.6833 0 11.3833 0 10C0 8.61667 0.2625 7.31667 0.7875 6.1C1.3125 4.88333 2.025 3.825 2.925 2.925C3.825 2.025 4.88333 1.3125 6.1 0.7875C7.31667 0.2625 8.61667 0 10 0C11.3833 0 12.6833 0.2625 13.9 0.7875C15.1167 1.3125 16.175 2.025 17.075 2.925C17.975 3.825 18.6875 4.88333 19.2125 6.1C19.7375 7.31667 20 8.61667 20 10C20 11.3833 19.7375 12.6833 19.2125 13.9C18.6875 15.1167 17.975 16.175 17.075 17.075C16.175 17.975 15.1167 18.6875 13.9 19.2125C12.6833 19.7375 11.3833 20 10 20V20M10 18C12.2333 18 14.125 17.225 15.675 15.675C17.225 14.125 18 12.2333 18 10C18 7.76667 17.225 5.875 15.675 4.325C14.125 2.775 12.2333 2 10 2C7.76667 2 5.875 2.775 4.325 4.325C2.775 5.875 2 7.76667 2 10C2 12.2333 2.775 14.125 4.325 15.675C5.875 17.225 7.76667 18 10 18V18M10 10V10V10V10V10V10V10V10V10V10" fill="#137FEC" />
                            </svg>
                            Pogledaj demo
                        </Button>

                    </div>
                </div>
            </section>

            <section id='Image' className='w-full max-w-4xl mx-auto mt-12 m-8 px-6 pb-20'>
                <div className="relative w-full flex justify-center">
                    <Image
                        src="/HeroImg.png"
                        alt="Hero Image"
                        width={1000}
                        height={600}
                        className="w-full h-auto rounded-xl shadow-lg border border-gray-100 relative z-0"
                    />

                    <NotificationCard
                        title="Nova Faktura"
                        message="Uspešno kreirana"
                        className="absolute bottom-6 -left-4 md:-left-12 lg:-left-20 z-10"
                    />

                    <NotificationCard
                        title="Status Fakture"
                        message="Plaćeno"
                        className="absolute top-1/2 -translate-y-1/2 -right-4 md:-right-12 lg:-right-20 z-10"
                        icon={
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="40" height="40" rx="20" fill="#22C55E" fillOpacity="0.1" />
                                <path d="M17 24.172L11.828 19L13.243 17.586L17 21.343L26.757 11.586L28.172 13L17 24.172Z" fill="#22C55E" />
                            </svg>
                        }
                    />
                </div>
            </section>

            <section id='About' className='bg-white h-full flex flex-col justify-center items-center text-center p-7'>

                <div>
                    <h1 className='text-fcrna text-4xl font-bold m-3'>Zašto izabrati nas ?</h1>
                    <p className='text-fcrna text-xl '>Sve što vam je potrebno da vodite svoje finansije bez stresa, na jednom mestu.</p>
                </div>

                <div className="mt-12 flex flex-wrap gap-8 justify-center">
                    <FeatureCard
                        title="Brzo kreiranje"
                        description="Napravite fakturu za manje od minut uz naše profesionalne šablone."
                    />
                    <FeatureCard
                        title="Automatsko slanje"
                        description="Podesite automatsko slanje faktura i podsetnika vašim klijentima."
                    />
                    <FeatureCard
                        title="Detaljni izveštaji"
                        description="Pregledajte detaljne izveštaje o vašim fakturama i transakcijama."
                    />
                </div>

            </section>

            <section id='Test'>

                <div className='flex flex-col md:flex-row justify-between items-center bg-[#137FEC] max-w-[1000px] w-full mx-auto my-20 px-10 py-12 md:px-16 md:py-16 rounded-[28px] shadow-sm gap-8'>
                    <div className='flex flex-col text-left max-w-2xl'>
                        <h2 className='text-white text-3xl md:text-4xl lg:text-[42px] font-bold tracking-tight leading-tight mb-4'>
                            Spremni da unapredite poslovanje?
                        </h2>
                        <p className='text-[#DBEAFE] text-lg md:text-xl leading-relaxed max-w-[500px]'>
                            Pridružite se hiljadama zadovoljnih korisnika i počnite sa izdavanjem faktura danas.
                        </p>
                    </div>

                    <div className='shrink-0'>
                        <Link href="/registracija" className="block">
                            <Button backgroundColor="#ffffff" textColor="#137FEC">
                                <span className="font-bold text-base md:text-lg px-3 py-1.5">Besplatna registracija</span>
                            </Button>
                        </Link>
                    </div>
                </div>

            </section>



        </>
    )
}