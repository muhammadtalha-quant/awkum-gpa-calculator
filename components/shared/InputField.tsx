import React from 'react';

interface Props {
  value: string | number;
  onChange: (val: string) => void;
  onBlur?: () => void;
  type?: 'text' | 'number';
  placeholder?: string;
  label?: string;
  className?: string;
  error?: boolean;
  mono?: boolean;
  align?: 'left' | 'center' | 'right';
  disabled?: boolean;
  dataTestId?: string;
}

const InputField: React.FC<Props> = ({
  value,
  onChange,
  onBlur,
  type = 'text',
  placeholder,
  label,
  className = '',
  error = false,
  mono = false,
  align = 'left',
  disabled = false,
  dataTestId,
}) => {
  return (
    <div className={`space-y-2 w-full ${className}`}>
      {label && (
        <label className="block text-[9px] font-black font-label text-zinc-600 uppercase tracking-widest ml-1">
          {label}
        </label>
      )}
      <div
        className={`
        relative group rounded-xl bg-black/20 border transition-all duration-300
        ${error ? 'border-error/50 shadow-[0_0_10px_rgba(239,68,68,0.1)]' : 'border-white/5 focus-within:border-primary/50'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-white/10'}
      `}
      >
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          onFocus={(e) => e.target.select()}
          placeholder={placeholder}
          disabled={disabled}
          data-testid={dataTestId}
          className={`
            w-full bg-transparent outline-none p-3 
            font-black text-sm text-white transition-colors
            placeholder:text-zinc-800
            ${mono ? 'font-mono' : 'font-headline'}
            ${align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'}
          `}
        />
      </div>
    </div>
  );
};

export default InputField;
