import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold text-slate-700">404 — Page introuvable</h1>
      <Link to="/dashboard" className="text-blue-600 hover:underline">
        Retour au tableau de bord
      </Link>
    </div>
  );
}