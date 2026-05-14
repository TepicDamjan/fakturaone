import React from 'react';

interface FeatureCardProps {
    title: string;
    description: string;
    icon?: React.ReactNode;
    className?: string;
    /** Ako nije prosleđeno, trend badge se ne prikazuje. */
    trend?: string;
}

export default function FeatureDashboardCard({ title, description, icon, className = '', trend }: FeatureCardProps) {
    return (
        <div className={`bg-white rounded-[24px] p-7 flex flex-col justify-between border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] relative overflow-hidden flex-1 ${className}`}>
            {/* Background shape */}
            <div className="absolute -top-16 -right-16 w-56 h-56 bg-[#F8FAFC] rounded-full z-0"></div>

            {/* Top row */}
            <div className="flex justify-between items-start relative z-10 w-full mb-10">
                <div className="flex-shrink-0">
                    {icon}
                </div>

                {trend ? (
                    <div className="bg-[#ECFDF5] text-[#10B981] text-[13px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12.25 4.08333L7.58333 8.75L5.25 6.41667L1.75 9.91667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M8.75 4.08333H12.25V7.58333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {trend}
                    </div>
                ) : null}
            </div>

            {/* Bottom row */}
            <div className="flex flex-col relative z-10 gap-1.5">
                <span className="text-[#64748B] text-[15px] font-medium">
                    {description}
                </span>
                <span className="text-[#0F172A] text-[32px] font-extrabold tracking-tight leading-none">
                    {title}
                </span>
            </div>
        </div>
    );
}