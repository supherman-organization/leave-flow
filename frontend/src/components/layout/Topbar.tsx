import { Bell, Settings, LogOut, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
      <h2 className="text-sm font-semibold text-slate-700">Leave Management</h2>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            placeholder="Rechercher…"
            className="w-56 rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-sm outline-none focus:border-blue-400"
          />
        </div>
        <button className="text-slate-400 hover:text-slate-600"><Bell size={18} /></button>
        <button className="text-slate-400 hover:text-slate-600"><Settings size={18} /></button>
        <div className="hidden text-right text-xs sm:block">
          <p className="font-semibold text-slate-700">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-slate-400">{user?.email}</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-red-600"
        >
          <LogOut size={16} /> <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}