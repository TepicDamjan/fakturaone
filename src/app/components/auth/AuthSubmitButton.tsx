import Button from '@/app/components/Button';
import type { ComponentProps } from 'react';

type AuthSubmitButtonProps = Omit<ComponentProps<typeof Button>, 'backgroundColor' | 'textColor'> & {
    showArrow?: boolean;
};

export default function AuthSubmitButton({
    children,
    showArrow = true,
    className = '',
    ...props
}: AuthSubmitButtonProps) {
    return (
        <Button
            backgroundColor="#00E5FF"
            textColor="#05070A"
            className={`group landing-glow-btn flex w-full flex-row items-center justify-center gap-2 rounded-xl py-3.5 text-base font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_36px_rgba(0,229,255,0.5)] ${className}`}
            {...props}
        >
            {children}
            {showArrow ? (
                <span aria-hidden className="auth-btn-arrow text-lg leading-none">
                    →
                </span>
            ) : null}
        </Button>
    );
}
