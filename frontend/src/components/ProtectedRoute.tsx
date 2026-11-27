import type { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
<<<<<<< HEAD
import { lireSession } from '../utils/session';
=======
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28

type Props = {
  children: ReactElement;
  roles?: string[];
};

export default function ProtectedRoute({ children, roles }: Props) {
<<<<<<< HEAD
  const session = lireSession();
  if (!session) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(session.role)) return <Navigate to="/login" replace />;
=======
  const stocke = localStorage.getItem('utilisateur');
  if (!stocke) return <Navigate to="/login" replace />;

  const utilisateur = JSON.parse(stocke);
  if (roles && !roles.includes(utilisateur.role)) {
    return <Navigate to="/login" replace />;
  }
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  return children;
}