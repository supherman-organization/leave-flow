import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Check, X, Eye, Search } from 'lucide-react';
import  { listAll, approveRequest, refuseRequest, overrideStatus} from '../services/leaveRequestService';
import { getApiError } from '../services/api';
import type { LeaveRequest, LeaveType, LeaveStatus } from '../types/leave';
import { LEAVE_TYPE_LABELS, STATUS_LABELS } from '../lib/constants';
import { formatRange, formatDays, userName } from '../lib/format';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';

const LIMIT = 8;
const TYPES = Object.keys(LEAVE_TYPE_LABELS) as LeaveType[];
const STATUSES = Object.keys(STATUS_LABELS) as LeaveStatus[];

export default function ManageRequests() {
    const { user } = useAuth();
    const isHR = user?.role === 'hr';

    const [data, setData] = useState<LeaveRequest[]>([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);

    // Filtres
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [type, setType] = useState('');
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');

    // Modales
    const [refusing, setRefusing] = useState<LeaveRequest | null>(null);
    const [refuseComment, setRefuseComment] = useState('');
    const [overriding, setOverriding] = useState<LeaveRequest | null>(null);
    const [overrideValue, setOverrideValue] = useState<LeaveStatus>('approved');
    const [overrideComment, setOverrideComment] = useState('');
    const [detail, setDetail] = useState<LeaveRequest | null>(null);

    const load = useCallback(() => {
        setLoading(true);
        listAll({
        page, limit: LIMIT,
        status: status || undefined,
        type: type || undefined,
        from: from || undefined,
        to: to || undefined,
        })
        .then((res) => {
            setData(res.data);
            setTotal(res.total);
            setTotalPages(res.totalPages);
        })
        .catch((err) => toast.error(getApiError(err)))
        .finally(() => setLoading(false));
    }, [page, status, type, from, to]);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { load(); }, [load]);

    // Recherche employé côté client (le back filtre par id, on affine sur le nom affiché)
    const visible = search
        ? data.filter((r) => userName(r.user).toLowerCase().includes(search.toLowerCase()))
        : data;

    async function handleApprove(id: string) {
        try {
        await approveRequest(id);
        toast.success('Demande validée');
        load();
        } catch (err) { toast.error(getApiError(err)); }
    }

    async function submitRefuse() {
        if (!refusing) return;
        if (!refuseComment.trim()) { toast.error('Le commentaire est obligatoire pour un refus.'); return; }
        try {
        await refuseRequest(refusing._id, refuseComment.trim());
        toast.success('Demande refusée');
        setRefusing(null); setRefuseComment('');
        load();
        } catch (err) { toast.error(getApiError(err)); }
    }

    async function submitOverride() {
        if (!overriding) return;
        try {
        await overrideStatus(overriding._id, overrideValue, overrideComment.trim() || undefined);
        toast.success('Statut modifié');
        setOverriding(null); setOverrideComment('');
        load();
        } catch (err) { toast.error(getApiError(err)); }
    }

    const selectClass =
        'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500';

    return (
        <div className="space-y-6">
        <div>
            <h1 className="text-2xl font-bold text-slate-800">Gestion des demandes</h1>
            <p className="text-sm text-slate-500">Traitez et suivez les demandes de congés de vos collaborateurs.</p>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-3 rounded-xl border border-slate-200 bg-white p-4">
            <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un collaborateur"
                className="rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
            />
            </div>
            <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className={selectClass}>
            <option value="">Tous les statuts</option>
            {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
            <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className={selectClass}>
            <option value="">Tous les types</option>
            {TYPES.map((t) => <option key={t} value={t}>{LEAVE_TYPE_LABELS[t]}</option>)}
            </select>
            <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} className={selectClass} />
            <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} className={selectClass} />
        </div>

        {/* Tableau */}
        <div className="rounded-xl border border-slate-200 bg-white">
            {loading ? (
            <p className="p-5 text-sm text-slate-400">Chargement…</p>
            ) : visible.length === 0 ? (
            <p className="p-5 text-sm text-slate-400">Aucune demande.</p>
            ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-400">
                    <th className="px-5 py-3 font-medium">Collaborateur</th>
                    <th className="px-5 py-3 font-medium">Type</th>
                    <th className="px-5 py-3 font-medium">Dates</th>
                    <th className="px-5 py-3 font-medium">Durée</th>
                    <th className="px-5 py-3 font-medium">Statut</th>
                    <th className="px-5 py-3 font-medium">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {visible.map((r) => (
                    <tr key={r._id} className="border-b border-slate-50 last:border-0">
                        <td className="px-5 py-3 font-medium text-slate-700">{userName(r.user)}</td>
                        <td className="px-5 py-3 text-slate-600">{LEAVE_TYPE_LABELS[r.type]}</td>
                        <td className="px-5 py-3 text-slate-600">{formatRange(r.startDate, r.endDate)}</td>
                        <td className="px-5 py-3 text-slate-600">{formatDays(r.days)}</td>
                        <td className="px-5 py-3"><Badge status={r.status} /></td>
                        <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                            {r.status === 'pending' && (
                            <>
                                <button onClick={() => handleApprove(r._id)} title="Valider"
                                className="rounded-lg bg-green-50 p-1.5 text-green-600 hover:bg-green-100">
                                <Check size={16} />
                                </button>
                                <button onClick={() => setRefusing(r)} title="Refuser"
                                className="rounded-lg bg-red-50 p-1.5 text-red-600 hover:bg-red-100">
                                <X size={16} />
                                </button>
                            </>
                            )}
                            <button onClick={() => setDetail(r)} title="Détails"
                            className="rounded-lg bg-slate-50 p-1.5 text-slate-500 hover:bg-slate-100">
                            <Eye size={16} />
                            </button>
                            {isHR && (
                            <button onClick={() => { setOverriding(r); setOverrideValue(r.status); }}
                                className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50">
                                Modifier
                            </button>
                            )}
                        </div>
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

        {/* Modale refus */}
        <Modal open={!!refusing} onClose={() => { setRefusing(null); setRefuseComment(''); }} title="Refuser la demande">
            <div className="space-y-3">
            <p className="text-sm text-slate-600">
                Refus de la demande de <strong>{refusing && userName(refusing.user)}</strong>. Un commentaire est obligatoire.
            </p>
            <textarea
                value={refuseComment}
                onChange={(e) => setRefuseComment(e.target.value)}
                rows={3}
                placeholder="Motif du refus…"
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
            <div className="flex justify-end gap-2">
                <button onClick={() => { setRefusing(null); setRefuseComment(''); }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                Annuler
                </button>
                <button onClick={submitRefuse}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
                Confirmer le refus
                </button>
            </div>
            </div>
        </Modal>

        {/* Modale override RH */}
        <Modal open={!!overriding} onClose={() => { setOverriding(null); setOverrideComment(''); }} title="Modifier le statut (RH)">
            <div className="space-y-3">
            <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Nouveau statut</label>
                <select value={overrideValue} onChange={(e) => setOverrideValue(e.target.value as LeaveStatus)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500">
                {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>
            </div>
            <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Commentaire (optionnel)</label>
                <textarea
                value={overrideComment}
                onChange={(e) => setOverrideComment(e.target.value)}
                rows={2}
                placeholder="Précision ou correction…"
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
            </div>
            <div className="rounded-lg bg-amber-50 p-2 text-xs text-amber-700">
                Note : la modification manuelle du statut ne recrédite pas automatiquement le solde de congés.
            </div>
            <div className="flex justify-end gap-2">
                <button onClick={() => { setOverriding(null); setOverrideComment(''); }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                Annuler
                </button>
                <button onClick={submitOverride}
                className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
                Enregistrer
                </button>
            </div>
            </div>
        </Modal>

        {/* Modale détail */}
        <Modal open={!!detail} onClose={() => setDetail(null)} title="Détail de la demande">
            {detail && (
            <div className="space-y-3 text-sm">
                <Row label="Collaborateur" value={userName(detail.user)} />
                <Row label="Type" value={LEAVE_TYPE_LABELS[detail.type]} />
                <Row label="Période" value={formatRange(detail.startDate, detail.endDate)} />
                <Row label="Durée" value={formatDays(detail.days)} />
                <div className="flex justify-between">
                <span className="text-slate-500">Statut</span>
                <Badge status={detail.status} />
                </div>
                {detail.comment && <Row label="Commentaire employé" value={detail.comment} />}
                {detail.managerComment && (
                <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs font-semibold text-slate-500">Commentaire du manager</p>
                    <p className="mt-1 text-slate-700">{detail.managerComment}</p>
                </div>
                )}
                {detail.justificatif && (
                <p className="text-xs text-slate-500">Justificatif joint : {detail.justificatif}</p>
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