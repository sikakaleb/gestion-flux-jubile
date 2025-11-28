'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="glass-card p-3 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center">
        <div className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="glass-card p-3 hover:bg-slate-700 dark:hover:bg-slate-700 hover:bg-slate-200 rounded-lg transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-slate-400 dark:text-slate-400 text-slate-600" />
      ) : (
        <Moon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
      )}
    </button>
  );
}
