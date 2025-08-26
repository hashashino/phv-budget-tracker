import { useMemo } from 'react';
import { useColorScheme } from './useColorScheme';

/**
 * Hook to generate dynamic Tailwind classes based on theme and state
 */
export function useTailwind() {
  const { isDark, colorScheme } = useColorScheme();

  const tw = useMemo(() => ({
    // Dynamic theme classes
    bg: isDark ? 'bg-slate-900' : 'bg-slate-50',
    bgCard: isDark ? 'bg-slate-800' : 'bg-white',
    bgInput: isDark ? 'bg-slate-700' : 'bg-slate-50',
    text: isDark ? 'text-white' : 'text-slate-800',
    textMuted: isDark ? 'text-slate-300' : 'text-slate-600',
    textSubtle: isDark ? 'text-slate-400' : 'text-slate-500',
    border: isDark ? 'border-slate-700' : 'border-slate-200',
    divider: isDark ? 'border-slate-600' : 'border-slate-200',
    
    // Button variants
    btnPrimary: `bg-primary-900 ${isDark ? 'bg-primary-600' : 'bg-primary-900'}`,
    btnSecondary: `bg-secondary-500 ${isDark ? 'bg-secondary-400' : 'bg-secondary-600'}`,
    btnGhost: `${isDark ? 'bg-slate-700/50' : 'bg-slate-100'}`,
    
    // Status colors (consistent across themes)
    success: 'bg-emerald-500',
    danger: 'bg-red-500', 
    warning: 'bg-amber-500',
    info: 'bg-blue-500',
    
    // Financial colors
    earning: 'text-emerald-600 dark:text-emerald-400',
    expense: 'text-red-600 dark:text-red-400',
    neutral: 'text-slate-600 dark:text-slate-300',
    
    // Shadow variants
    shadowSoft: 'shadow-sm shadow-slate-200/50 dark:shadow-slate-900/50',
    shadowMedium: 'shadow-md shadow-slate-200/60 dark:shadow-slate-900/60',
    shadowStrong: 'shadow-lg shadow-slate-200/70 dark:shadow-slate-900/70',
    
    // Glassmorphism effects
    glass: `backdrop-blur-md ${isDark ? 'bg-slate-800/80' : 'bg-white/80'}`,
    glassCard: `backdrop-blur-lg ${isDark ? 'bg-slate-800/90' : 'bg-white/90'}`,
    
    // Interactive states
    pressable: `active:scale-95 transition-transform duration-100`,
    hover: `${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`,
    
    // Utility generators
    spacing: (size: string) => `p-${size} m-${size}`,
    rounded: (size: string = 'lg') => `rounded-${size}`,
    
  }), [isDark, colorScheme]);

  // Class name builder utility
  const cn = (...classes: (string | undefined | null | false)[]): string => {
    return classes.filter(Boolean).join(' ');
  };

  // Conditional class utility
  const clx = (condition: boolean, trueClass: string, falseClass?: string): string => {
    return condition ? trueClass : (falseClass || '');
  };

  return {
    tw,
    cn,
    clx,
    isDark,
    colorScheme,
  };
}