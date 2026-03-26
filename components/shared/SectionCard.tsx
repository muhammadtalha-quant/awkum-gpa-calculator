import React from 'react';
import { THEME } from '../../src/core/theme';

interface Props {
  title?: string;
  subtitle?: string;
  icon?: string;
  children?: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
  variant?: 'default' | 'nested';
  titleTag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

const SectionCard: React.FC<Props> = ({
  title,
  subtitle,
  icon,
  children,
  className = '',
  headerAction,
  variant = 'default',
  titleTag,
}) => {
  const isNested = variant === 'nested';

  return (
    <section
      className={`
      ${isNested ? 'bg-bg-surface-lowest' : 'bg-bg-surface'} 
      ${THEME.radius.card} 
      ${THEME.spacing.cardPadding} 
      border border-white/5 
      ${THEME.shadows.card} 
      relative overflow-hidden group 
      ${className}
    `}
    >
      {(title || icon) && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            {icon && (
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary transition-transform group-hover:scale-110">
                <span className="material-symbols-outlined text-2xl">{icon}</span>
              </div>
            )}
            <div>
              {title &&
                React.createElement(
                  titleTag || 'h3',
                  {
                    className:
                      'text-xl font-black font-headline text-white uppercase tracking-tight',
                  },
                  title,
                )}
              {subtitle && (
                <p className="text-[10px] font-bold font-label text-zinc-500 uppercase tracking-widest mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {headerAction && <div className="w-full md:w-auto">{headerAction}</div>}
        </div>
      )}
      {children}
    </section>
  );
};

export default SectionCard;
