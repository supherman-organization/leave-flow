import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

interface SortableThProps {
    label: string;
    active: boolean;
    dir: 'asc' | 'desc';
    onClick: () => void;
}

export default function SortableTh({ label, active, dir, onClick }: SortableThProps) {
    return (
        <th className="px-5 py-3 font-medium">
        <button onClick={onClick} className="inline-flex items-center gap-1 hover:text-slate-600">
            {label}
            {active ? (
            dir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
            ) : (
            <ChevronsUpDown size={14} className="text-slate-300" />
            )}
        </button>
        </th>
    );
}