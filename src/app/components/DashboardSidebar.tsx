'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthUser } from '@/lib/useAuthUser';

interface NavItemProps {
    href: string;
    icon: React.ReactNode;
    label: string;
    isActive?: boolean;
    onNavigate?: () => void;
}

function NavItem({ href, icon, label, isActive, onNavigate }: NavItemProps) {
    return (
        <Link
            href={href}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${isActive
                ? 'bg-[#EBF3FC] text-[#137FEC]'
                : 'text-[#64748B] hover:bg-gray-50 hover:text-gray-900'
                }`}
        >
            <div className={`w-5 h-5 flex items-center justify-center shrink-0 ${isActive ? 'text-[#137FEC]' : 'text-[#64748B]'}`}>
                {icon}
            </div>
            {label}
        </Link>
    );
}

type DashboardSidebarProps = {
    mobileOpen?: boolean;
    onMobileClose?: () => void;
};

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
    const pathname = usePathname();
    const { ime, email, loading } = useAuthUser();
    const avatarSeed = encodeURIComponent(email ?? 'korisnik');

    return (
        <div className="flex flex-col justify-between h-full w-full">
            <div className="px-4 sm:px-6 flex flex-col gap-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#137FEC] rounded-xl flex items-center justify-center shadow-md shrink-0">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                            <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M14 2V8H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M16 13H8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M16 17H8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M10 9H8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[#0F172A] font-bold text-lg leading-tight">Faktura<span className="text-[#0F172A]">Ona</span></span>
                        <span className="text-[#137FEC] text-xs font-semibold">Pro Plan</span>
                    </div>
                </div>

                <nav className="flex flex-col gap-2">
                    <NavItem
                        href="/dashboard"
                        label="Komandna tabla"
                        isActive={pathname === '/dashboard'}
                        onNavigate={onNavigate}
                        icon={
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                                <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                                <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                                <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                                <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                            </svg>
                        }
                    />
                    <NavItem
                        href="/dashboard/fakture"
                        label="Fakture"
                        isActive={pathname.startsWith('/dashboard/fakture')}
                        onNavigate={onNavigate}
                        icon={
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                                <path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        }
                    />
                    <NavItem
                        href="/dashboard/klijenti"
                        label="Klijenti"
                        isActive={pathname.startsWith('/dashboard/klijenti')}
                        onNavigate={onNavigate}
                        icon={
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                                <path d="M12 4A4 4 0 1 0 12 12A4 4 0 0 0 12 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M6 20V19C6 16.7909 7.79086 15 10 15H14C16.2091 15 18 16.7909 18 19V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M20 18A3.00004 3.00004 0 0 0 18 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M4 18A3.00004 3.00004 0 0 1 6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        }
                    />
                    <NavItem
                        href="/dashboard/podesavanja"
                        label="Podešavanja"
                        isActive={pathname.startsWith('/dashboard/podesavanja')}
                        onNavigate={onNavigate}
                        icon={
                            <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                                <path d="M7.3 20L6.9 16.8C6.68333 16.7167 6.47917 16.6167 6.2875 16.5C6.09583 16.3833 5.90833 16.2583 5.725 16.125L2.75 17.375L0 12.625L2.575 10.675C2.55833 10.5583 2.55 10.4458 2.55 10.3375C2.55 10.2292 2.55 10.1167 2.55 10C2.55 9.88333 2.55 9.77083 2.55 9.6625C2.55 9.55417 2.55833 9.44167 2.575 9.325L0 7.375L2.75 2.625L5.725 3.875C5.90833 3.74167 6.1 3.61667 6.3 3.5C6.5 3.38333 6.7 3.28333 6.9 3.2L7.3 0H12.8L13.2 3.2C13.4167 3.28333 13.6208 3.38333 13.8125 3.5C14.0042 3.61667 14.1917 3.74167 14.375 3.875L17.35 2.625L20.1 7.375L17.525 9.325C17.5417 9.44167 17.55 9.55417 17.55 9.6625C17.55 9.77083 17.55 9.88333 17.55 10C17.55 10.1167 17.55 10.2292 17.55 10.3375C17.55 10.4458 17.5333 10.5583 17.5 10.675L20.075 12.625L17.325 17.375L14.375 16.125C14.1917 16.2583 14 16.3833 13.8 16.5C13.6 16.6167 13.4 16.7167 13.2 16.8L12.8 20H7.3V20M9.05 18H11.025L11.375 15.35C11.8917 15.2167 12.3708 15.0208 12.8125 14.7625C13.2542 14.5042 13.6583 14.1917 14.025 13.825L16.5 14.85L17.475 13.15L15.325 11.525C15.4083 11.2917 15.4667 11.0458 15.5 10.7875C15.5333 10.5292 15.55 10.2667 15.55 10C15.55 9.73333 15.5333 9.47083 15.5 9.2125C15.4667 8.95417 15.4083 8.70833 15.325 8.475L17.475 6.85L16.5 5.15L14.025 6.2C13.6583 5.81667 13.2542 5.49583 12.8125 5.2375C12.3708 4.97917 11.8917 4.78333 11.375 4.65L11.05 2H9.075L8.725 4.65C8.20833 4.78333 7.72917 4.97917 7.2875 5.2375C6.84583 5.49583 6.44167 5.80833 6.075 6.175L3.6 5.15L2.625 6.85L4.775 8.45C4.69167 8.7 4.63333 8.95 4.6 9.2C4.56667 9.45 4.55 9.71667 4.55 10C4.55 10.2667 4.56667 10.525 4.6 10.775C4.63333 11.025 4.69167 11.275 4.775 11.525L2.625 13.15L3.6 14.85L6.075 13.8C6.44167 14.1833 6.84583 14.5042 7.2875 14.7625C7.72917 15.0208 8.20833 15.2167 8.725 15.35L9.05 18V18M10.1 13.5C11.0667 13.5 11.8917 13.1583 12.575 12.475C13.2583 11.7917 13.6 10.9667 13.6 10C13.6 9.03333 13.2583 8.20833 12.575 7.525C11.8917 6.84167 11.0667 6.5 10.1 6.5C9.11667 6.5 8.2875 6.84167 7.6125 7.525C6.9375 8.20833 6.6 9.03333 6.6 10C6.6 10.9667 6.9375 11.7917 7.6125 12.475C8.2875 13.1583 9.11667 13.5 10.1 13.5Z" fill="currentColor"/>
                            </svg>
                        }
                    />
                </nav>
            </div>

            <div className="px-4 sm:px-6 border-t border-gray-100 pt-6">
                <div className="bg-[#F8FAFC] rounded-2xl flex items-center gap-3 p-3 cursor-pointer border border-gray-50 shadow-sm transition-colors hover:bg-gray-100">
                    <img
                        src={`https://api.dicebear.com/7.x/notionists/svg?seed=${avatarSeed}&backgroundColor=FFC107`}
                        alt={ime ?? 'Profil'}
                        className="w-10 h-10 rounded-full border border-gray-200 bg-white shrink-0"
                    />
                    <div className="flex flex-col truncate min-w-0">
                        <span className="text-[#0F172A] font-bold text-sm truncate">
                            {loading ? '…' : (ime ?? 'Korisnik')}
                        </span>
                        <span className="text-[#64748B] text-xs truncate">
                            {loading ? '…' : (email ?? '')}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function DashboardSidebar({
    mobileOpen = false,
    onMobileClose,
}: DashboardSidebarProps) {
    const close = onMobileClose ?? (() => {});

    const panelClass =
        'w-64 max-w-[85vw] h-full bg-white border-r border-gray-100 flex flex-col justify-between py-6';

    return (
        <>
            {/* Desktop sidebar */}
            <aside className={`hidden lg:flex shrink-0 sticky top-0 h-screen ${panelClass}`}>
                <SidebarContent />
            </aside>

            {/* Mobile drawer */}
            {mobileOpen ? (
                <div className="lg:hidden fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Navigacija">
                    <button
                        type="button"
                        className="absolute inset-0 bg-black/40"
                        aria-label="Zatvori meni"
                        onClick={close}
                    />
                    <aside className={`relative z-10 shadow-xl flex flex-col max-h-full overflow-y-auto ${panelClass}`}>
                        <div className="flex justify-end px-4 pb-2 lg:hidden">
                            <button
                                type="button"
                                onClick={close}
                                className="p-2 rounded-lg text-[#64748B] hover:bg-gray-100 hover:text-[#0F172A]"
                                aria-label="Zatvori meni"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </button>
                        </div>
                        <SidebarContent onNavigate={close} />
                    </aside>
                </div>
            ) : null}
        </>
    );
}
