import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { Role } from '../../types/user';

export default function RoleRoute({ allow }: { allow: Role[] }) {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    return allow.includes(user.role) ? <Outlet /> : <Navigate to="/dashboard" replace />;
}