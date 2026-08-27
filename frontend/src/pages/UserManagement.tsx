import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { UserPlus, Pencil, KeyRound, Power, Search } from 'lucide-react';
import {
  listUsers, createUser, updateUser, setUserStatus, resetUserPassword,
   type CreateUserInput,
} from '../services/userService';
import { getApiError } from '../services/api';
import type { User, Role, UserSummary } from '../types/user';
import { ROLE_LABELS } from '../lib/constants';
import Modal from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';

const LIMIT = 8;
const ROLES: Role[] = ['employee', 'manager', 'hr'];

const emptyForm: CreateUserInput = {
    firstName: '', lastName: '', email: '', role: 'employee', manager: '', team: '',
};

export default function UserManagement() {
    const [data, setData] = useState<User[]>([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    const [managers, setManagers] = useState<User[]>([]);

    const [formOpen, setFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<CreateUserInput>(emptyForm);
    const [saving, setSaving] = useState(false);

    const [tempPassword, setTempPassword] = useState<string | null>(null);

    const load = useCallback(() => {
        setLoading(true);
        listUsers({ page, limit: LIMIT, search: search || undefined })
        .then((res) => {
            setData(res.data);
            setTotal(res.total);
            setTotalPages(res.totalPages);
        })
        .catch((err) => toast.error(getApiError(err)))
        .finally(() => setLoading(false));
    }, [page, search]);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { load(); }, [load]);

    useEffect(() => {
        listUsers({ page: 1, limit: 100, role: 'manager' })
        .then((res) => setManagers(res.data))
        .catch(() => {});
    }, []);

    function openCreate() {
        setEditingId(null);
        setForm(emptyForm);
        setFormOpen(true);
    }

    function openEdit(u: User) {
        setEditingId(u._id);
        setForm({
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        role: u.role,
        manager: typeof u.manager === 'object' && u.manager ? (u.manager as UserSummary)._id : '',
        team: u.team ?? '',
        });
        setFormOpen(true);
    }

    async function submitForm() {
        if (!form.firstName || !form.lastName || !form.email) {
        toast.error('Prénom, nom et email sont requis.');
        return;
        }
        setSaving(true);
        try {
        const payload = { ...form, manager: form.manager || undefined, team: form.team || undefined };
        if (editingId) {
            await updateUser(editingId, payload);
            toast.success('Utilisateur modifié');
        } else {
            const res = await createUser(payload);
            setTempPassword(res.temporaryPassword);
            toast.success('Utilisateur créé');
        }
        setFormOpen(false);
        load();
        } catch (err) {
        toast.error(getApiError(err));
        } finally {
        setSaving(false);
        }
    }

    async function toggleStatus(u: User) {
        try {
        await setUserStatus(u._id, !u.isActive);
        toast.success(u.isActive ? 'Compte désactivé' : 'Compte activé');
        load();
        } catch (err) { toast.error(getApiError(err)); }
    }

    async function handleReset(u: User) {
        try {
        const res = await resetUserPassword(u._id);
        setTempPassword(res.temporaryPassword);
        toast.success('Mot de passe réinitialisé');
        } catch (err) { toast.error(getApiError(err)); }
    }

    const inputClass =
        'w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

    return (
        <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
            <h1 className="text-2xl font-bold text-slate-800">Gestion des utilisateurs</h1>
            <p className="text-sm text-slate-500">Gérez les accès et rôles des collaborateurs.</p>
            </div>
            <button onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
            <UserPlus size={18} /> Créer un utilisateur
            </button>
        </div>

        {/* Recherche */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Rechercher (nom, email)…"
                className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
            />
            </div>
        </div>

        {/* Tableau */}
        <div className="rounded-xl border border-slate-200 bg-white">
            {loading ? (
            <Spinner />
            ) : data.length === 0 ? (
            <EmptyState message="Aucun utilisateur." />
            ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-400">
                    <th className="px-5 py-3 font-medium">Nom</th>
                    <th className="px-5 py-3 font-medium">Email</th>
                    <th className="px-5 py-3 font-medium">Rôle</th>
                    <th className="px-5 py-3 font-medium">Manager</th>
                    <th className="px-5 py-3 font-medium">Statut</th>
                    <th className="px-5 py-3 font-medium">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((u) => (
                    <tr key={u._id} className="border-b border-slate-50 last:border-0">
                        <td className="px-5 py-3 font-medium text-slate-700">{u.firstName} {u.lastName}</td>
                        <td className="px-5 py-3 text-slate-600">{u.email}</td>
                        <td className="px-5 py-3">
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                            {ROLE_LABELS[u.role]}
                        </span>
                        </td>
                        <td className="px-5 py-3 text-slate-600">
                        {typeof u.manager === 'object' && u.manager
                            ? `${(u.manager as UserSummary).firstName} ${(u.manager as UserSummary).lastName}`
                            : '—'}
                        </td>
                        <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${u.isActive ? 'text-green-600' : 'text-slate-400'}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${u.isActive ? 'bg-green-500' : 'bg-slate-400'}`} />
                            {u.isActive ? 'Actif' : 'Inactif'}
                        </span>
                        </td>
                        <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                            <button onClick={() => openEdit(u)} title="Modifier"
                            className="rounded-lg bg-slate-50 p-1.5 text-slate-500 hover:bg-slate-100">
                            <Pencil size={15} />
                            </button>
                            <button onClick={() => handleReset(u)} title="Réinitialiser le mot de passe"
                            className="rounded-lg bg-amber-50 p-1.5 text-amber-600 hover:bg-amber-100">
                            <KeyRound size={15} />
                            </button>
                            <button onClick={() => toggleStatus(u)} title={u.isActive ? 'Désactiver' : 'Activer'}
                            className={`rounded-lg p-1.5 ${u.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                            <Power size={15} />
                            </button>
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

        {/* Modale création / édition */}
        <Modal open={formOpen} onClose={() => setFormOpen(false)}
            title={editingId ? 'Modifier l\'utilisateur' : 'Créer un utilisateur'}>
            <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
                <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Prénom</label>
                <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={inputClass} />
                </div>
                <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Nom</label>
                <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={inputClass} />
                </div>
            </div>
            <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Rôle</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })} className={inputClass}>
                    {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                </select>
                </div>
                <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Équipe</label>
                <input value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })} placeholder="Ex : Backend" className={inputClass} />
                </div>
            </div>
            <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Manager responsable</label>
                <select value={form.manager} onChange={(e) => setForm({ ...form, manager: e.target.value })} className={inputClass}>
                <option value="">Aucun</option>
                {managers.map((m) => (
                    <option key={m._id} value={m._id}>{m.firstName} {m.lastName}</option>
                ))}
                </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setFormOpen(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                Annuler
                </button>
                <button onClick={submitForm} disabled={saving}
                className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60">
                {saving ? 'Enregistrement…' : editingId ? 'Enregistrer' : 'Créer'}
                </button>
            </div>
            </div>
        </Modal>

        {/* Modale mot de passe temporaire */}
        <Modal open={!!tempPassword} onClose={() => setTempPassword(null)} title="Mot de passe temporaire">
            <div className="space-y-3">
            <p className="text-sm text-slate-600">
                Communiquez ce mot de passe à l'utilisateur. Il devra le changer à sa première connexion.
            </p>
            <div className="rounded-lg bg-slate-100 p-3 text-center font-mono text-lg font-bold text-slate-800">
                {tempPassword}
            </div>
            <button
                onClick={() => { if (tempPassword) navigator.clipboard.writeText(tempPassword); toast.success('Copié'); }}
                className="w-full rounded-lg bg-blue-900 py-2 text-sm font-semibold text-white hover:bg-blue-800">
                Copier
            </button>
            </div>
        </Modal>
        </div>
    );
}