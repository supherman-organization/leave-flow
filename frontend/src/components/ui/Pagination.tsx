import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    page: number;
    totalPages: number;
    total: number;
    limit: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({
    page, totalPages, total, limit, onPageChange,
    }: PaginationProps) {
    const from = total === 0 ? 0 : (page - 1) * limit + 1;
    const to = Math.min(page * limit, total);

    return (
        <div className="flex items-center justify-between px-5 py-3 text-sm text-slate-500">
        <span>Affichage {from} à {to} sur {total}</span>
        <div className="flex items-center gap-1">
            <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="rounded-lg border border-slate-200 p-1.5 disabled:opacity-40 hover:bg-slate-50"
            >
            <ChevronLeft size={16} />
            </button>
            <span className="px-2">{page} / {Math.max(totalPages, 1)}</span>
            <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="rounded-lg border border-slate-200 p-1.5 disabled:opacity-40 hover:bg-slate-50"
            >
            <ChevronRight size={16} />
            </button>
        </div>
        </div>
    );
}