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
                {rightContent ? (
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
                        {rightContent}
                    </div>
                ) : null}
            </div>
        </header>
    );
}
