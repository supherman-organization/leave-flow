import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CalendarDays, Clock, PlusCircle, Inbox } from 'lucide-react';
import { getDashboard } from '../services/dashboardService';
import { getApiError } from '../services/api';
import type { DashboardResponse } from '../types/dashboard';
import { useAuth } from '../context/AuthContext';
import { LEAVE_TYPE_LABELS } from '../lib/constants';
import { formatRange, formatDays, formatDate } from '../lib/format';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';

export default function Dashboard() {
    const { user } = useAuth();
    const [data, setData] = useState<DashboardResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getDashboard()
        .then(setData)
        .catch((err) => toast.error(getApiError(err)))
        .finally(() => setLoading(false));
    }, []);

    if (loading) return <Spinner label="Chargement du tableau de bord…" />;
    if (!data) return <EmptyState message="Aucune donnée disponible." />;

    const isReviewer = data.role === 'manager' || data.role === 'hr';

    return (
        <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
            <h1 className="text-2xl font-bold text-slate-800">Bonjour, {user?.firstName}</h1>
            <p className="text-sm text-slate-500">Voici un aperçu de vos congés et demandes.</p>
            </div>
            <Link
            to="/new-request"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
            <PlusCircle size={18} /> Nouvelle demande
            </Link>
        </div>

        {/* Cartes résumé */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <SummaryCard
            icon={<CalendarDays size={18} />}
            label="JOURS RESTANTS"
            value={`${data.balance.cp}`}
            hint={`CP · ${data.balance.rtt} RTT`}
            />
            <SummaryCard
            icon={<Clock size={18} />}
            label="DEMANDES EN COURS"
            value={`${data.myPendingCount}`}
            hint="en attente de validation"
            />
            {isReviewer ? (
            <SummaryCard
                icon={<Inbox size={18} />}
                label="À TRAITER"
                value={`${data.pendingToReview ?? 0}`}
                hint="demandes à valider"
            />
            ) : (
            <UpcomingCard leaves={data.upcomingLeaves} />
            )}
        </div>

        {/* Prochains congés (pleine largeur pour reviewer) */}
        {isReviewer && data.upcomingLeaves.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-slate-700">Vos prochains congés</h3>
            <div className="flex flex-wrap gap-3">
                {data.upcomingLeaves.map((l) => (
                <div key={l._id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
                    <p className="font-medium text-slate-700">{LEAVE_TYPE_LABELS[l.type]}</p>
                    <p className="text-xs text-slate-500">{formatRange(l.startDate, l.endDate)}</p>
                </div>
                ))}
            </div>
            </div>
        )}

        {/* Demandes récentes */}
        <div className="rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-700">Demandes récentes</h3>
            <Link to="/my-requests" className="text-xs font-medium text-blue-600 hover:underline">
                Voir tout
            </Link>
            </div>

            {data.recentRequests.length === 0 ? (
            <EmptyState message="Aucune demande pour le moment." />
            ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-400">
                    <th className="px-5 py-3 font-medium">Type</th>
                    <th className="px-5 py-3 font-medium">Période</th>
                    <th className="px-5 py-3 font-medium">Durée</th>
                    <th className="px-5 py-3 font-medium">Date de demande</th>
                    <th className="px-5 py-3 font-medium">Statut</th>
                    </tr>
                </thead>
                <tbody>
                    {data.recentRequests.map((r) => (
                    <tr key={r._id} className="border-b border-slate-50 last:border-0">
                        <td className="px-5 py-3 font-medium text-slate-700">
                        {LEAVE_TYPE_LABELS[r.type]}
                        </td>
                        <td className="px-5 py-3 text-slate-600">
                        {formatRange(r.startDate, r.endDate)}
                        </td>
                        <td className="px-5 py-3 text-slate-600">{formatDays(r.days)}</td>
                        <td className="px-5 py-3 text-slate-600">{formatDate(r.createdAt)}</td>
                        <td className="px-5 py-3"><Badge status={r.status} /></td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            )}
        </div>
        </div>
    );
}

function SummaryCard({
    icon, label, value, hint,
    }: { icon: React.ReactNode; label: string; value: string; hint: string }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase text-slate-400">{label}</p>
            <span className="text-slate-400">{icon}</span>
        </div>
        <p className="mt-4 text-3xl font-bold text-slate-800">{value}</p>
        <p className="text-xs text-slate-400">{hint}</p>
        </div>
    );
}

function UpcomingCard({ leaves }: { leaves: DashboardResponse['upcomingLeaves'] }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="mb-3 text-xs font-semibold uppercase text-slate-400">Prochains congés</p>
        {leaves.length === 0 ? (
            <p className="text-sm text-slate-400">Aucun congé à venir.</p>
        ) : (
            <div className="space-y-2">
            {leaves.slice(0, 2).map((l) => (
                <div key={l._id} className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{LEAVE_TYPE_LABELS[l.type]}</span>
                <span className="text-xs text-slate-500">{formatRange(l.startDate, l.endDate)}</span>
                </div>
            ))}
            </div>
        )}
        </div>
    );
}