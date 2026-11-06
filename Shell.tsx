'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { sb } from '@/lib/supabase';
const NAV = [['/dashboard','Dashboard'],['/volunteers','Voluntari'],['/branches','Filiale'],['/registers','Registre'],['/departments','Departamente']];
export default function Shell({ children }: { children: React.ReactNode }) {
  const [s, setS] = useState<'load'|'no'|'ok'>('load'); const path = usePathname();
  useEffect(() => { (async () => {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) { location.href = '/login'; return; }
    const { data } = await sb.rpc('is_board'); setS(data ? 'ok' : 'no');
  })(); }, []);
  const out = async () => { await sb.auth.signOut(); location.href = '/login'; };
  if (s === 'load') return <p style={{ padding: 30 }}>Se încarcă…</p>;
  if (s === 'no') return <div className="login"><div className="box"><h2>Acces interzis</h2><p>Contul tău nu are rol de board. Cere unui administrator să îți atribuie accesul.</p><button className="btn" onClick={out}>Deconectare</button></div></div>;
  return <div className="app"><aside className="side"><h1>DNT CENTRAL</h1><small>Acces board</small>
    {NAV.map(([h, l]) => <Link key={h} href={h} className={path === h ? 'on' : ''}>{l}</Link>)}
    <button className="btn g" style={{ marginTop: 'auto' }} onClick={out}>Deconectare</button></aside>
    <main className="main">{children}</main></div>;
}
