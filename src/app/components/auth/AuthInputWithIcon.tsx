import type { InputHTMLAttributes, ReactNode } from 'react';
import { authInputClass, authLabelClass } from './authStyles';

interface AuthInputWithIconProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon: ReactNode;
    id: string;
    revealClassName?: string;
}

export default function AuthInputWithIcon({
    label,
    icon,
    id,
    className = '',
    revealClassName = '',
    ...inputProps
}: AuthInputWithIconProps) {
    return (
        <div className={`auth-field-group flex flex-col gap-1.5 ${revealClassName}`}>
            <label htmlFor={id} className={authLabelClass}>
                {label}
            </label>
            <div className="relative">
                <span className="auth-input-icon pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 transition-colors duration-300">
                    {icon}
                </span>
                <input
                    id={id}
                    className={`${authInputClass} pl-11 ${className}`}
                    {...inputProps}
                />
            </div>
        </div>
    );
}
