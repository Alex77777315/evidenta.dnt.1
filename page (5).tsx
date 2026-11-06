'use client';
import { useEffect, useState } from 'react';
import { sb } from '@/lib/supabase';
import Shell from '@/components/Shell';
const cnt = async (t: string, f?: (q: any) => any) => { let q: any = sb.from(t).select('*', { count: 'exact', head: true }).eq('archived', false); if (f) q = f(q); const { count } = await q; return count ?? 0; };
export default function D() {
  const [s, setS] = useState<[string, number][]>([]);
  useEffect(() => { (async () => {
    const r = await Promise.all([cnt('volunteers'), cnt('volunteers', q => q.eq('status', 'activ')), cnt('volunteers', q => q.eq('status', 'candidat')), cnt('volunteers', q => q.eq('status', 'inactiv')),
      cnt('branches'), cnt('departments'), cnt('register_entries')]);
    setS([['Voluntari total', r[0]], ['Voluntari activi', r[1]], ['Cereri în așteptare', r[2]], ['Voluntari inactivi', r[3]], ['Filiale', r[4]], ['Departamente', r[5]], ['Înregistrări în registre', r[6]]]); })(); }, []);
  return <Shell><h2>Dashboard</h2><div className="cards">{s.map(([l, n]) => <div className="c" key={l}><b>{n}</b>{l}</div>)}</div></Shell>;
}
