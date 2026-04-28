import React from 'react';

interface FeatureCardProps {
    title: string;
    description: string;
    icon?: React.ReactNode;
    className?: string;
}

export default function FeatureCard({ title, description, icon, className = '' }: FeatureCardProps) {
    return (
        <div className={`bg-[#F8FAFC] rounded-[32px] p-10 flex flex-col items-start gap-8 border border-gray-100/50 max-w-[420px] ${className}`}>
            <div className="bg-[#EBF3FC] w-16 h-16 rounded-2xl flex items-center justify-center text-blue-600 mb-2">
                {icon || (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
            </div>

            <div className="flex flex-col items-start gap-3">
                <h3 className="text-[#0F172A] text-2xl font-bold tracking-tight text-left">
                    {title}
                </h3>
                <p className="text-[#475569] text-lg leading-relaxed text-left">
                    {description}
                </p>
            </div>
        </div>
    );
}
