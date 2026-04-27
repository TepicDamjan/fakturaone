import React from 'react';

interface DashboardHeaderProps {
    title: string;
    subtitle?: string;
    rightContent?: React.ReactNode;
}

export default function DashboardHeader({ title, subtitle, rightContent }: DashboardHeaderProps) {
    return (
        <header className="bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between sticky top-0 z-10 w-full">
            <div>
                <h1 className="text-2xl font-bold text-[#0F172A]">{title}</h1>
                {subtitle && <p className="text-sm text-[#64748B] mt-1">{subtitle}</p>}
            </div>

            <div className="flex items-center gap-6">
                {/* Notifications */}
                <button className="relative text-[#64748B] hover:text-[#0F172A] transition-colors" aria-label="Notifikacije">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 8A6 6 0 0 0 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {/* Red dot indicator */}
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                </button>

                {rightContent}
            </div>
        </header>
    );
}
