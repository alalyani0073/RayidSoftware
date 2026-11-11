import { useCallback, useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function useModalityWorklist() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('open');
  const [page, setPage] = useState({ items: [], has_more: false });
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const request = useRef(0);
  const load = useCallback(async (cursor) => {
    const version = ++request.current;
    setLoading(true);
    const term = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const filter = { status: status === 'open' ? { $in: ['queued', 'in_progress'] } : 'completed', ...(term ? { $or: ['patient_name', 'patient_ref', 'protocol_name'].map(field => ({ [field]: { $regex: term, $options: 'i' } })) } : {}) };
    const [next, total] = await Promise.all([base44.entities.Exam.filter(filter, { sort: '-exam_date', limit: 25, ...(cursor ? { cursor } : {}) }), base44.entities.Exam.count(filter)]);
    if (version !== request.current) return;
    setPage(previous => ({ ...next, items: cursor ? [...previous.items, ...next.items] : next.items }));
    setCount(total);
    setLoading(false);
  }, [query, status]);
  useEffect(() => { const timer = setTimeout(() => load(), 200); return () => { clearTimeout(timer); request.current++; }; }, [load]);
  return { items: page.items, query, setQuery, status, setStatus, count, loading, reload: () => load(), hasMore: page.has_more, loadMore: () => load(page.next_cursor) };
}