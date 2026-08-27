import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PlusCircle } from 'lucide-react';
import { listMine, cancelRequest } from '../services/leaveRequestService';
import { getApiError } from '../services/api';
import type { LeaveRequest } from '../types/leave';
import { LEAVE_TYPE_LABELS } from '../lib/constants';
import { formatDate, formatDays } from '../lib/format';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import { useSort } from '../hooks/useSort';
import SortableTh from '../components/ui/SortableTh';

const LIMIT = 5;

export default function MyRequests() {
    const [data, setData] = useState<LeaveRequest[]>([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<'' | 'pending'>('');
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<LeaveRequest | null>(null);

    const load = useCallback(() => {
        setLoading(true);
        listMine({ page, limit: LIMIT, status: statusFilter || undefined })
        .then((res) => {
            setData(res.data);
            setTotal(res.total);
            setTotalPages(res.totalPages);
        })
        .catch((err) => toast.error(getApiError(err)))
        .finally(() => setLoading(false));
    }, [page, statusFilter]);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { load(); }, [load]);

    async function handleCancel(id: string) {
        try {
        await cancelRequest(id);
        toast.success('Demande annulée');
        setSelected(null);
        load();
        } catch (err) {
        toast.error(getApiError(err));
        }
    }
    const { sorted, key, dir, toggle } = useSort<LeaveRequest>(data);

    return (
        <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
            <h1 className="text-2xl font-bold text-slate-800">Mes demandes</h1>
            <p className="text-sm text-slate-500">Consultez et suivez l'état de vos demandes de congés.</p>
            </div>
            <Link to="/new-request" className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
            <PlusCircle size={18} /> Nouvelle demande
            </Link>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white">
            {/* Filtres */}
            <div className="flex gap-2 border-b border-slate-200 p-3">
            <button
                onClick={() => { setStatusFilter(''); setPage(1); }}
                className={`rounded-lg px-3 py-1.5 text-sm ${statusFilter === '' ? 'bg-blue-100 font-medium text-blue-700' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                Toutes
            </button>
            <button
                onClick={() => { setStatusFilter('pending'); setPage(1); }}
                className={`rounded-lg px-3 py-1.5 text-sm ${statusFilter === 'pending' ? 'bg-blue-100 font-medium text-blue-700' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                En attente
            </button>
            </div>

            {loading ? (
            <Spinner />
            ) : data.length === 0 ? (
            <EmptyState message="Aucune demande." />
            ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-400">
                        <SortableTh label="Type" active={key === 'type'} dir={dir} onClick={() => toggle('type')} />
                        <SortableTh label="Date de début" active={key === 'startDate'} dir={dir} onClick={() => toggle('startDate')} />
                        <SortableTh label="Date de fin" active={key === 'endDate'} dir={dir} onClick={() => toggle('endDate')} />
                        <SortableTh label="Jours" active={key === 'days'} dir={dir} onClick={() => toggle('days')} />
                        <SortableTh label="Statut" active={key === 'status'} dir={dir} onClick={() => toggle('status')} />
                        <th className="px-5 py-3 font-medium">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {sorted.map((r) => (
                    <tr key={r._id} className="border-b border-slate-50 last:border-0">
                        <td className="px-5 py-3 font-medium text-slate-700">{LEAVE_TYPE_LABELS[r.type]}</td>
                        <td className="px-5 py-3 text-slate-600">{formatDate(r.startDate)}</td>
                        <td className="px-5 py-3 text-slate-600">{formatDate(r.endDate)}</td>
                        <td className="px-5 py-3 text-slate-600">{r.days}</td>
                        <td className="px-5 py-3"><Badge status={r.status} /></td>
                        <td className="px-5 py-3">
                        <button onClick={() => setSelected(r)} className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50">
                            Détails
                        </button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            )}

            {!loading && total > 0 && (
            <Pagination page={page} totalPages={totalPages} total={total} limit={LIMIT} onPageChange={setPage} />
            )}
        </div>

        {/* Modale de détail */}
        <Modal open={!!selected} onClose={() => setSelected(null)} title="Détail de la demande">
            {selected && (
            <div className="space-y-3 text-sm">
                <Row label="Type" value={LEAVE_TYPE_LABELS[selected.type]} />
                <Row label="Début" value={formatDate(selected.startDate)} />
                <Row label="Fin" value={formatDate(selected.endDate)} />
                <Row label="Durée" value={formatDays(selected.days)} />
                <div className="flex justify-between">
                <span className="text-slate-500">Statut</span>
                <Badge status={selected.status} />
                </div>
                {selected.comment && <Row label="Votre commentaire" value={selected.comment} />}
                {selected.managerComment && (
                <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs font-semibold text-slate-500">Commentaire du manager</p>
                    <p className="mt-1 text-slate-700">{selected.managerComment}</p>
                </div>
                )}
                {selected.status === 'pending' && (
                <button
                    onClick={() => handleCancel(selected._id)}
                    className="mt-2 w-full rounded-lg border border-red-200 bg-red-50 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                >
                    Annuler cette demande
                </button>
                )}
            </div>
            )}
        </Modal>
        </div>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between">
        <span className="text-slate-500">{label}</span>
        <span className="font-medium text-slate-700">{value}</span>
        </div>
    );
}