import { Plane } from 'lucide-react';

export function BrandLogo({ size = 'default' }: { size?: 'small' | 'default' | 'large' | 'compact' }) {
  const sizeClasses = {
    small: {
      container: 'gap-2',
      icon: 'w-8 h-8 p-1.5',
      title: 'text-base',
      subtitle: 'text-[9px]',
      acronym: 'text-xs',
      showFull: true,
    },
    compact: {
      container: 'gap-2',
      icon: 'w-9 h-9 p-1.5',
      title: 'text-lg',
      subtitle: 'text-[9px]',
      acronym: 'text-base',
      showFull: false,
    },
    default: {
      container: 'gap-3',
      icon: 'w-10 h-10 p-2',
      title: 'text-xl',
      subtitle: 'text-[10px]',
      acronym: 'text-sm',
      showFull: true,
    },
    large: {
      container: 'gap-4',
      icon: 'w-14 h-14 p-3',
      title: 'text-3xl',
      subtitle: 'text-xs',
      acronym: 'text-base',
      showFull: true,
    },
  };

  const classes = sizeClasses[size];

  return (
    <div className={`flex items-center ${classes.container}`}>
      <div className={`bg-blue-600 ${classes.icon} rounded-lg shadow-lg flex-shrink-0`}>
        <Plane className="w-full h-full text-white" />
      </div>

      <div>
        {classes.showFull ? (
          <>
            <div className="flex items-baseline gap-2">
              <h1 className={`${classes.title} font-bold text-slate-900 dark:text-white tracking-tight leading-none`}>
                Gestion du flux international Jubilé
              </h1>
              <span className={`${classes.acronym} font-semibold text-slate-600 dark:text-slate-400`}>
                GFIJ
              </span>
            </div>
            <div className={`${classes.subtitle} text-slate-600 dark:text-slate-400 font-medium tracking-wide uppercase`}>
              Système de gestion des transferts
            </div>
          </>
        ) : (
          <h1 className={`${classes.acronym} font-black text-slate-900 dark:text-white tracking-tight`}>
            GFIJ
          </h1>
        )}
      </div>
    </div>
  );
}
