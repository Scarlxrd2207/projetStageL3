import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { ThemeProvider } from './context/ThemeContext';
import { LangueProvider } from './context/LangueContext';
import { PanierProvider } from './context/PanierContext';
import './styles/theme-soam.css';
import './styles/formulaires.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <LangueProvider>
        <PanierProvider>
          <App />
        </PanierProvider>
      </LangueProvider>
    </ThemeProvider>
  </StrictMode>,
);