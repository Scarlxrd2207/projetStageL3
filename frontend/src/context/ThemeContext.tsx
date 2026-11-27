<<<<<<< HEAD
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

export type Theme = 'sombre' | 'clair';

type ThemeContextType = {
  theme: Theme;
  setTheme: (t: Theme) => void;
=======
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

type Theme = 'sombre' | 'clair';

type ThemeContextType = {
  theme: Theme;
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  basculer: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

<<<<<<< HEAD
function themeInitial(): Theme {
  const valeur = localStorage.getItem('theme');
  return valeur === 'clair' || valeur === 'sombre' ? valeur : 'sombre';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(themeInitial);
=======
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('theme') as Theme) ?? 'sombre'
  );
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

<<<<<<< HEAD
  const setTheme = useCallback((t: Theme) => setThemeState(t), []);
  const basculer = useCallback(
    () => setThemeState((t) => (t === 'sombre' ? 'clair' : 'sombre')),
    []
  );

  return (
    <ThemeContext.Provider value={{ theme, setTheme, basculer }}>
=======
  function basculer() {
    setTheme((t) => (t === 'sombre' ? 'clair' : 'sombre'));
  }

  return (
    <ThemeContext.Provider value={{ theme, basculer }}>
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
      {children}
    </ThemeContext.Provider>
  );
}

<<<<<<< HEAD
export function useTheme(): ThemeContextType {
=======
export function useTheme() {
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme doit être utilisé dans ThemeProvider');
  return ctx;
}