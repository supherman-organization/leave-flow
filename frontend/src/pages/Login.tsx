import  { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getApiError } from '../services/api';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const { mustSetPassword } = await login(email, password);
      toast.success('Connexion réussie');
      navigate(mustSetPassword ? '/set-password' : '/dashboard', { replace: true });
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
          <p className="text-sm font-bold text-blue-900">SUP Herman</p>
          <h1 className="mt-4 text-3xl font-bold text-blue-900">Connexion</h1>
          <p className="mt-2 text-sm text-slate-500">
            Accédez à votre espace de gestion des congés
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Email professionnel
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="prenom.nom@supherman.com"
                className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-sm font-semibold text-slate-700">
                Mot de passe
              </label>
              <button
                type="button"
                onClick={() => toast('Contactez le service RH pour réinitialiser votre mot de passe.')}
                className="text-xs font-medium text-blue-600 hover:underline"
              >
                Mot de passe oublié ?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-900 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-60"
          >
            {loading ? 'Connexion…' : <>Se connecter <LogIn size={18} /></>}
          </button>
        </form>

        <div className="mt-6 border-t border-slate-200 pt-4 text-center text-xs text-slate-500">
          Les comptes sont créés par le service RH.
        </div>
      </div>
    </div>
  );
}