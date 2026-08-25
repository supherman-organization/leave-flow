import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Lock, ShieldCheck } from 'lucide-react';
import { setPassword } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { getApiError } from '../services/api';

export default function SetPassword() {
    const navigate = useNavigate();
    const { user, setUser } = useAuth();

    const [newPassword, setNewPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (loading) return;

        if (newPassword.length < 8) {
        toast.error('Le mot de passe doit faire au moins 8 caractères');
        return;
        }
        if (newPassword !== confirm) {
        toast.error('Les mots de passe ne correspondent pas');
        return;
        }

        setLoading(true);
        try {
        await setPassword(newPassword);
        if (user) setUser({ ...user }); // mustSetPassword est côté back ; on repart proprement
        toast.success('Mot de passe défini avec succès');
        navigate('/dashboard', { replace: true });
        } catch (err) {
        toast.error(getApiError(err));
        } finally {
        setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-8 text-center">
            <ShieldCheck className="mx-auto text-blue-900" size={40} />
            <h1 className="mt-4 text-2xl font-bold text-blue-900">
                Définir votre mot de passe
            </h1>
            <p className="mt-2 text-sm text-slate-500">
                Première connexion : choisissez un mot de passe sécurisé.
            </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                Nouveau mot de passe
                </label>
                <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Au moins 8 caractères"
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                </div>
            </div>

            <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                Confirmer le mot de passe
                </label>
                <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="password"
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-900 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-60"
            >
                {loading ? 'Enregistrement…' : 'Valider le mot de passe'}
            </button>
            </form>
        </div>
        </div>
    );
}