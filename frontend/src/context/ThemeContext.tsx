import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

export type Theme = 'sombre' | 'clair';

type ThemeContextType = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  basculer: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function themeInitial(): Theme {
  const valeur = localStorage.getItem('theme');
  return valeur === 'clair' || valeur === 'sombre' ? valeur : 'sombre';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(themeInitial);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const setTheme = useCallback((t: Theme) => setThemeState(t), []);
  const basculer = useCallback(
    () => setThemeState((t) => (t === 'sombre' ? 'clair' : 'sombre')),
    []
  );

  return (
    <ThemeContext.Provider value={{ theme, setTheme, basculer }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme doit être utilisé dans ThemeProvider');
  return ctx;
}