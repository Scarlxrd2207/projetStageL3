import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { ThemeProvider } from './context/ThemeContext';
<<<<<<< HEAD
import { LangueProvider } from './context/LangueContext';
import { PanierProvider } from './context/PanierContext';
import './styles/theme-soam.css';
import './styles/formulaires.css';
=======
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
<<<<<<< HEAD
      <LangueProvider>
        <PanierProvider>
          <App />
        </PanierProvider>
      </LangueProvider>
=======
      <App />
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
    </ThemeProvider>
  </StrictMode>,
);