import { useEffect, useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { Lock, CalendarCheck, Clock, Monitor } from 'lucide-react';
import { getProfile, changePassword, type ProfileResponse } from '../services/profileService';
import { getApiError } from '../services/api';
import { ROLE_LABELS } from '../lib/constants';
import type { UserSummary } from '../types/user';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Profile() {
    const [data, setData] = useState<ProfileResponse | null>(null);
    const [loading, setLoading] = useState(true);

    const [current, setCurrent] = useState('');
    const [next, setNext] = useState('');
    const [confirm, setConfirm] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        getProfile()
        .then(setData)
        .catch((err) => toast.error(getApiError(err)))
        .finally(() => setLoading(false));
    }, []);

    async function handleChangePassword(e: FormEvent) {
        e.preventDefault();
        if (saving) return;
        if (next.length < 8) { toast.error('Le nouveau mot de passe doit faire au moins 8 caractères.'); return; }
        if (next !== confirm) { toast.error('Les mots de passe ne correspondent pas.'); return; }

        setSaving(true);
        try {
        await changePassword(current, next);
        toast.success('Mot de passe mis à jour');
        setCurrent(''); setNext(''); setConfirm('');
        } catch (err) {
        toast.error(getApiError(err));
        } finally {
        setSaving(false);
        }
    }

    if (loading) return <div className="p-6 text-slate-400">Chargement du profil…</div>;
    if (!data) return <div className="p-6 text-slate-400">Profil indisponible.</div>;

    const { user, balance } = data;
    const managerName = typeof user.manager === 'object' && user.manager
        ? `${(user.manager as UserSummary).firstName} ${(user.manager as UserSummary).lastName}`
        : '—';

    const inputClass =
        'w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

    return (
        <div className="space-y-6">
        <div>
            <h1 className="text-2xl font-bold text-slate-800">Profil Utilisateur</h1>
            <p className="text-sm text-slate-500">Gérez vos informations personnelles et votre sécurité.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Colonne principale */}
            <div className="space-y-6 lg:col-span-2">
            {/* Infos */}
            <div className="rounded-xl border border-slate-200 bg-white p-6">
                <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
                    {user.firstName[0]}{user.lastName[0]}
                </div>
                <div>
                    <p className="text-lg font-semibold text-slate-800">{user.firstName} {user.lastName}</p>
                    <p className="text-sm text-slate-500">{ROLE_LABELS[user.role]}{user.team ? ` · ${user.team}` : ''}</p>
                </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Email professionnel" value={user.email} />
                <Field label="Rôle" value={ROLE_LABELS[user.role]} />
                <Field label="Équipe" value={user.team || '—'} />
                <Field label="Manager direct" value={managerName} />
                </div>
            </div>

            {/* Sécurité */}
            <div className="rounded-xl border border-slate-200 bg-white p-6">
                <div className="mb-4 flex items-center gap-2">
                <Lock size={18} className="text-slate-600" />
                <h3 className="text-base font-semibold text-slate-800">Sécurité &amp; Mot de passe</h3>
                </div>
                <form onSubmit={handleChangePassword} className="space-y-3">
                <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Mot de passe actuel</label>
                    <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required className={inputClass} />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Nouveau mot de passe</label>
                    <input type="password" value={next} onChange={(e) => setNext(e.target.value)} required className={inputClass} />
                    </div>
                    <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Confirmer</label>
                    <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required className={inputClass} />
                    </div>
                </div>
                <button type="submit" disabled={saving}
                    className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60">
                    {saving ? 'Mise à jour…' : 'Mettre à jour le mot de passe'}
                </button>
                </form>
            </div>
            </div>

            {/* Colonne latérale */}
            <div className="space-y-6">
            {/* Soldes */}
            <div className="rounded-xl border border-slate-200 bg-white p-6">
                <h3 className="mb-4 text-base font-semibold text-slate-800">Soldes actuels</h3>
                <div className="space-y-3">
                <BalanceCard icon={<CalendarCheck size={18} />} label="Congés Payés (CP)" value={balance.cp} />
                <BalanceCard icon={<Clock size={18} />} label="RTT" value={balance.rtt} />
                </div>
            </div>

            {/* Historique de connexion */}
            {user.loginHistory && user.loginHistory.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-white p-6">
                <h3 className="mb-4 text-base font-semibold text-slate-800">Historique de connexion</h3>
                <div className="space-y-3">
                    {user.loginHistory.map((h, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                        <Monitor size={16} className="mt-0.5 shrink-0 text-slate-400" />
                        <div>
                        <p className="text-slate-700">
                            {format(parseISO(h.date), 'dd MMM yyyy · HH:mm', { locale: fr })}
                        </p>
                        {h.ip && <p className="text-xs text-slate-400">IP : {h.ip}</p>}
                        </div>
                    </div>
                    ))}
                </div>
                </div>
            )}
            </div>
        </div>
        </div>
    );
}

function Field({ label, value }: { label: string; value: string }) {
    return (
        <div>
        <p className="text-xs font-semibold uppercase text-slate-400">{label}</p>
        <p className="mt-1 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">{value}</p>
        </div>
    );
    }

function BalanceCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
    return (
        <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
        <div className="flex items-center gap-2">
            <span className="text-blue-600">{icon}</span>
            <span className="text-sm text-slate-600">{label}</span>
        </div>
        <span className="text-xl font-bold text-slate-800">{value} <span className="text-xs font-normal text-slate-400">jours</span></span>
        </div>
    );
}