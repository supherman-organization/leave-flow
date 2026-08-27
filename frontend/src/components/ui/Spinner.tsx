export default function Spinner({ label = 'Chargement…' }: { label?: string }) {
    return (
        <div className="flex items-center justify-center gap-2 p-8 text-sm text-slate-400">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
        {label}
        </div>
    );
}