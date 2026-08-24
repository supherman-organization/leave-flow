import { NavLink } from 'react-router-dom';
import {
  LayoutGrid, FileText, PlusCircle, CheckSquare,
  Calendar, Users, User, LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { Role } from '../../types/user';

interface NavItem {
  to: string; label: string; icon: typeof LayoutGrid;
  section: 'Mon Espace' | 'Administration'; roles: Role[];
}

const NAV: NavItem[] = [
  { to: '/dashboard',       label: 'Dashboard',                icon: LayoutGrid,  section: 'Mon Espace',     roles: ['employee', 'manager', 'hr'] },
  { to: '/my-requests',     label: 'Mes demandes',             icon: FileText,    section: 'Mon Espace',     roles: ['employee', 'manager', 'hr'] },
  { to: '/new-request',     label: 'Nouvelle demande',         icon: PlusCircle,  section: 'Mon Espace',     roles: ['employee', 'manager', 'hr'] },
  { to: '/manage-requests', label: 'Gestion des demandes',     icon: CheckSquare, section: 'Administration', roles: ['manager', 'hr'] },
  { to: '/global-calendar', label: 'Calendrier global',        icon: Calendar,    section: 'Administration', roles: ['employee', 'manager', 'hr'] },
  { to: '/user-management', label: 'Gestion des utilisateurs', icon: Users,       section: 'Administration', roles: ['hr'] },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  if (!user) return null;

  const visible = NAV.filter((i) => i.roles.includes(user.role));
  const sections = ['Mon Espace', 'Administration'] as const;

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
      isActive ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
    }`;

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white p-4 md:flex">
      <div className="mb-6 px-2">
        <h1 className="text-lg font-bold text-blue-900">SUP Herman</h1>
        <p className="text-xs text-slate-400">HR Portal</p>
      </div>

      <nav className="flex-1 space-y-6">
        {sections.map((section) => {
          const items = visible.filter((i) => i.section === section);
          if (items.length === 0) return null;
          return (
            <div key={section}>
              <p className="mb-2 px-3 text-xs font-semibold uppercase text-slate-400">
                {section}
              </p>
              {items.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} className={linkClass}>
                  <Icon size={18} /> {label}
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 pt-4">
        <NavLink to="/profile" className={linkClass}>
          <User size={18} /> Profil
        </NavLink>
        <button
          onClick={logout}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
        >
          <LogOut size={18} /> Déconnexion
        </button>
      </div>
    </aside>
  );
}