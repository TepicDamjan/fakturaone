'use client';

import React from 'react';
import { useDashboardNav } from '@/app/components/DashboardNavContext';

interface DashboardHeaderProps {
    title: string;
    subtitle?: string;
    rightContent?: React.ReactNode;
}

export default function DashboardHeader({ title, subtitle, rightContent }: DashboardHeaderProps) {
    const nav = useDashboardNav();
    const showMenu = nav && !nav.sidebarHidden;

    return (
        <header className="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sticky top-0 z-20 w-full shrink-0">
            <div className="flex items-start gap-3 min-w-0">
                {showMenu ? (
                    <button
                        type="button"
                        onClick={nav.openMobileMenu}
                        className="lg:hidden shrink-0 p-2 -ml-1 rounded-lg text-[#64748B] hover:bg-gray-100 hover:text-[#0F172A] transition-colors"
                        aria-label="Otvori meni"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                ) : null}
                <div className="min-w-0">
                    <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] truncate">{title}</h1>
                    {subtitle ? (
                        <p className="text-sm text-[#64748B] mt-0.5 sm:mt-1 line-clamp-2">{subtitle}</p>
                    ) : null}
                </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-6 shrink-0 self-end sm:self-auto">
                <button
                    type="button"
                    className="relative text-[#64748B] hover:text-[#0F172A] transition-colors p-1"
                    aria-label="Notifikacije"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                        <path d="M18 8A6 6 0 0 0 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full" />
                </button>

                {rightContent ? (
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
                        {rightContent}
                    </div>
                ) : null}
            </div>
        </header>
    );
}
