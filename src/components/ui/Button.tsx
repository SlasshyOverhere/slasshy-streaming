import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive' | 'shimmer';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  isLoading = false,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-95";
  
  const variants = {
    primary: "bg-gradient-to-br from-red-600 to-red-700 text-white shadow-lg shadow-red-500/25 hover:from-red-500 hover:to-red-600 hover:shadow-red-500/40 border border-red-500/20",
    secondary: "bg-white/10 text-white shadow-sm hover:bg-white/20 backdrop-blur-sm border border-white/10",
    ghost: "hover:bg-white/10 text-neutral-300 hover:text-white",
    outline: "border border-white/20 bg-transparent text-neutral-300 hover:bg-white/5 hover:text-white hover:border-white/40 shadow-sm",
    destructive: "bg-red-900/50 text-red-200 border border-red-900 hover:bg-red-900/70",
    shimmer: "relative overflow-hidden bg-neutral-950 border border-white/10 text-white shadow-2xl transition-colors hover:bg-neutral-900"
  };

  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-5 py-2",
    lg: "h-12 rounded-xl px-8 text-base",
    icon: "h-10 w-10",
  };

  const loadingContent = (
    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
  );

  const content = isLoading ? loadingContent : children;

  if (variant === 'shimmer') {
    return (
      <button
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={isLoading || props.disabled}
        {...props}
      >
        <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent z-0" />
        <span className="relative z-10 flex items-center justify-center">{content}</span>
      </button>
    );
  }

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {content}
    </button>
  );
};