import { Bell, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface TopbarProps {
    onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
    const { user } = useAuth();

    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
        <div className="flex items-center gap-3">
            <button onClick={onMenuClick} className="text-slate-500 hover:text-slate-700 md:hidden">
            <Menu size={22} />
            </button>
            <h2 className="text-sm font-semibold text-slate-700">Gestion des congés</h2>
        </div>

        <div className="flex items-center gap-3">
            <button className="text-slate-400 hover:text-slate-600"><Bell size={18} /></button>
            <div className="hidden text-right text-xs sm:block">
            <p className="font-semibold text-slate-700">{user?.firstName} {user?.lastName}</p>
            <p className="text-slate-400">{user?.email}</p>
            </div>
        </div>
        </header>
    );
}