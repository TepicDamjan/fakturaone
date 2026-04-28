import React from 'react';

interface NotificationCardProps {
    title: string;
    message: string;
    icon?: React.ReactNode;
    className?: string;
}

export default function NotificationCard({ title, message, icon, className = '' }: NotificationCardProps) {
    return (
        <div className={`max-w-[210px] bg-white rounded-xl shadow-xl shadow-gray-200/50 p-3 pr-4 flex flex-row items-center justify-center gap-4 ${className}`}>
            {icon || (
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="40" height="40" rx="20" fill="#137FEC" fillOpacity="0.1" />
                    <path d="M19 21H13V19H19V13H21V19H27V21H21V27H19V21V21" fill="#137FEC" />
                </svg>
            )}

            <div className='flex flex-col items-center justify-center'>
                <p className='text-[#64748B]'>
                    {title}
                </p>
                <p className='text-fcrna'>
                    {message}
                </p>
            </div>

        </div>
    );
}
