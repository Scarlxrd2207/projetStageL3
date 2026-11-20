import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, basculer } = useTheme();

  return (
    <button className="theme-toggle" onClick={basculer} title="Changer de thème">
      {theme === 'sombre' ? '☀ Mode clair' : '☾ Mode sombre'}
    </button>
  );
}