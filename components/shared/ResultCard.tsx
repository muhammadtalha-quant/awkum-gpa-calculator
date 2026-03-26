import React from 'react';

interface Props {
  value: string | number;
  label: string;
  badge?: {
    label: string;
    color: string;
  } | null;
  icon?: string;
  action?: React.ReactNode;
  subtitle?: string;
  dataTestId?: string;
}

const ResultCard: React.FC<Props> = ({
  value,
  label,
  badge,
  icon,
  action,
  subtitle,
  dataTestId,
}) => {
  return (
    <section
      data-testid={dataTestId}
      className="bg-bg-surface rounded-3xl p-4 sm:p-6 border border-white/5 shadow-glow relative overflow-hidden group"
    >
      {icon && (
        <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity">
          <span className="material-symbols-outlined text-8xl text-primary">{icon}</span>
        </div>
      )}

      <div className="flex flex-col items-center justify-center text-center relative z-10 py-4">
        <p className="text-[10px] font-black font-label text-zinc-500 uppercase tracking-[0.4em] mb-4">
          {label}
        </p>
        {subtitle && (
          <p className="text-[11px] font-bold text-zinc-400 mb-6 italic opacity-80 leading-relaxed px-4">
            {subtitle}
          </p>
        )}
        <div className="relative group/score">
          <span className="text-5xl xs:text-6xl sm:text-8xl font-black font-headline text-white tracking-tighter text-shadow-glow drop-shadow-2xl transition-transform duration-700 group-hover/score:scale-105 inline-block">
            {value}
          </span>
          {badge && (
            <div className="absolute -top-4 -right-1/2 translate-x-1/2 w-max sm:-right-8 sm:translate-x-0">
              <div
                className={`px-3 py-1 rounded-full text-[8px] font-black uppercase border animate-bounce-slow shadow-soft backdrop-blur-md ${badge.color}`}
              >
                {badge.label}
              </div>
            </div>
          )}
        </div>

        {action && <div className="mt-8 w-full">{action}</div>}
      </div>
    </section>
  );
};

export default ResultCard;
