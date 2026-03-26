import React from 'react';

interface Props {
  onClick: () => void;
  children: React.ReactNode;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  className?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  dataTestId?: string;
}

const ActionButton: React.FC<Props> = ({
  onClick,
  children,
  icon,
  variant = 'primary',
  className = '',
  disabled = false,
  fullWidth = false,
  dataTestId,
}) => {
  const variants = {
    primary: 'bg-primary text-on-primary shadow-glow hover:shadow-primary/40',
    secondary: 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white border border-white/5',
    danger: 'bg-error/10 text-error hover:bg-error/20 border border-error/20',
    ghost: 'bg-transparent text-zinc-500 hover:text-primary transition-colors',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid={dataTestId}
      className={`
        relative px-6 py-3 rounded-2xl flex items-center justify-center gap-3 
        text-[10px] font-black font-label uppercase tracking-widest 
        transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
        ${fullWidth ? 'w-full' : ''}
        ${variants[variant]}
        ${className}
      `}
    >
      {icon && <span className="material-symbols-outlined text-[18px]">{icon}</span>}
      {children}
    </button>
  );
};

export default ActionButton;
