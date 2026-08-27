import { Inbox } from 'lucide-react';
import type{ ReactNode } from 'react';

export default function EmptyState({ message, action }: { message: string; action?: ReactNode }) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 p-10 text-center">
        <Inbox size={32} className="text-slate-300" />
        <p className="text-sm text-slate-400">{message}</p>
        {action}
        </div>
    );
}