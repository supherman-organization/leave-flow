import { useState, useMemo } from 'react';

export type SortDir = 'asc' | 'desc';

export function useSort<T>(items: T[], initialKey?: keyof T) {
    const [key, setKey] = useState<keyof T | undefined>(initialKey);
    const [dir, setDir] = useState<SortDir>('asc');

  function toggle(k: keyof T) {
    if (key === k) {
      setDir(dir === 'asc' ? 'desc' : 'asc');
    } else {
      setKey(k);
      setDir('asc');
    }
  }

  const sorted = useMemo(() => {
    if (!key) return items;
    const copy = [...items];
    copy.sort((a, b) => {
        const va = a[key];
        const vb = b[key];
        if (va == null) return 1;
        if (vb == null) return -1;
        if (va < vb) return dir === 'asc' ? -1 : 1;
        if (va > vb) return dir === 'asc' ? 1 : -1;
        return 0;
    });
    return copy;
  }, [items, key, dir]);

    return { sorted, key, dir, toggle };
}