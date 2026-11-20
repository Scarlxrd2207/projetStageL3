import type { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';

type Props = {
  children: ReactElement;
  roles?: string[];
};

export default function ProtectedRoute({ children, roles }: Props) {
  const stocke = localStorage.getItem('utilisateur');
  if (!stocke) return <Navigate to="/login" replace />;

  const utilisateur = JSON.parse(stocke);
  if (roles && !roles.includes(utilisateur.role)) {
    return <Navigate to="/login" replace />;
  }
  return children;
}