import { useState, useMemo, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UploadCloud, Send } from 'lucide-react';
import { createRequest } from '../services/leaveRequestService';
import { getApiError } from '../services/api';
import { countLeaveDays } from '../lib/leaveDays';
import { LEAVE_TYPE_LABELS } from '../lib/constants';
import type { LeaveType, DayPeriod } from '../types/leave';

const TYPES = Object.keys(LEAVE_TYPE_LABELS) as LeaveType[];

export default function NewRequest() {
    const navigate = useNavigate();
    const [type, setType] = useState<LeaveType | ''>('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [startPeriod, setStartPeriod] = useState<DayPeriod>('morning');
    const [endPeriod, setEndPeriod] = useState<DayPeriod>('afternoon');
    const [comment, setComment] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const days = useMemo(() => {
        if (!startDate || !endDate) return 0;
        return countLeaveDays(new Date(startDate), new Date(endDate), startPeriod, endPeriod);
    }, [startDate, endDate, startPeriod, endPeriod]);

    const dateError =
        startDate && endDate && new Date(endDate) < new Date(startDate)
        ? 'La date de fin est antérieure à la date de début.'
        : '';

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (loading) return;
        if (!type) { toast.error('Veuillez choisir un type de congé.'); return; }
        if (dateError) { toast.error(dateError); return; }
        if (days <= 0) { toast.error('La durée demandée est nulle (week-end ou demi-journées).'); return; }

        const fd = new FormData();
        fd.append('type', type);
        fd.append('startDate', startDate);
        fd.append('endDate', endDate);
        fd.append('startPeriod', startPeriod);
        fd.append('endPeriod', endPeriod);
        if (comment) fd.append('comment', comment);
        if (file) fd.append('justificatif', file);

        setLoading(true);
        try {
        await createRequest(fd);
        toast.success('Demande soumise avec succès');
        navigate('/my-requests', { replace: true });
        } catch (err) {
        toast.error(getApiError(err));
        } finally {
        setLoading(false);
        }
    }

    const inputClass =
        'w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

    return (
        <div className="space-y-6">
        <div>
            <h1 className="text-2xl font-bold text-slate-800">Nouvelle demande de congés</h1>
            <p className="text-sm text-slate-500">Remplissez le formulaire pour soumettre votre demande.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 lg:col-span-2">
            <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Type de congé *</label>
                <select value={type} onChange={(e) => setType(e.target.value as LeaveType)} className={inputClass}>
                <option value="">Sélectionnez un type</option>
                {TYPES.map((t) => (
                    <option key={t} value={t}>{LEAVE_TYPE_LABELS[t]}</option>
                ))}
                </select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Date de début *</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
                <div className="mt-2 flex gap-4 text-sm">
                    <label className="flex items-center gap-1">
                    <input type="radio" checked={startPeriod === 'morning'} onChange={() => setStartPeriod('morning')} /> Matin
                    </label>
                    <label className="flex items-center gap-1">
                    <input type="radio" checked={startPeriod === 'afternoon'} onChange={() => setStartPeriod('afternoon')} /> Après-midi
                    </label>
                </div>
                </div>
                <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Date de fin *</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
                <div className="mt-2 flex gap-4 text-sm">
                    <label className="flex items-center gap-1">
                    <input type="radio" checked={endPeriod === 'morning'} onChange={() => setEndPeriod('morning')} /> Matin
                    </label>
                    <label className="flex items-center gap-1">
                    <input type="radio" checked={endPeriod === 'afternoon'} onChange={() => setEndPeriod('afternoon')} /> Après-midi
                    </label>
                </div>
                </div>
            </div>

            {dateError && <p className="text-sm text-red-600">{dateError}</p>}

            <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Commentaire (optionnel)</label>
                <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Ajoutez un motif ou une précision…"
                className={inputClass}
                />
            </div>

            <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Justificatif (si nécessaire)</label>
                <label className="flex cursor-pointer flex-col items-center gap-1 rounded-lg border border-dashed border-slate-300 bg-slate-50 py-6 text-center text-sm text-slate-500 hover:bg-slate-100">
                <UploadCloud size={22} className="text-slate-400" />
                {file ? <span className="font-medium text-slate-700">{file.name}</span> : 'Téléverser un fichier'}
                <span className="text-xs text-slate-400">PNG, JPG, PDF jusqu'à 5 Mo</span>
                <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.pdf"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
                </label>
            </div>

            <div className="flex justify-end gap-3">
                <button type="button" onClick={() => navigate('/my-requests')} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                Annuler
                </button>
                <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60">
                {loading ? 'Envoi…' : <>Soumettre la demande <Send size={16} /></>}
                </button>
            </div>
            </form>

            {/* Résumé */}
            <div className="h-fit rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="text-base font-semibold text-slate-800">Résumé</h3>
            <div className="mt-4 flex items-baseline justify-between">
                <span className="text-sm text-slate-500">Jours décomptés</span>
                <span className="text-3xl font-bold text-slate-800">{days}</span>
            </div>
            <p className="text-xs text-slate-400">Total pour cette demande</p>
            <div className="mt-6 rounded-lg bg-blue-50 p-3 text-xs text-slate-600">
                Les week-ends ne sont pas décomptés. Le calcul final est confirmé par le serveur à la soumission.
            </div>
            </div>
        </div>
        </div>
    );
}