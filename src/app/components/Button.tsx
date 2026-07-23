interface ButtonProps {
    backgroundColor: string;
    textColor?: string;
    children: React.ReactNode;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    className?: string;
}

export default function Button({
    backgroundColor,
    textColor = '#ffffff',
    children,
    onClick,
    type = 'button',
    disabled = false,
    className = '',
}: ButtonProps) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            style={{ backgroundColor, color: textColor }}
            className={`flex flex-row gap-1 justify-center items-center px-4 py-2 rounded font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
            {children}
        </button>
    );
}
