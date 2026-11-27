import type { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { lireSession } from '../utils/session';

type Props = {
  children: ReactElement;
  roles?: string[];
};

export default function ProtectedRoute({ children, roles }: Props) {
  const session = lireSession();
  if (!session) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(session.role)) return <Navigate to="/login" replace />;
  return children;
}