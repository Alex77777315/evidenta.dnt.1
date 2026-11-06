'use client';
import { useEffect, useState } from 'react';
import { sb } from '@/lib/supabase';
import Shell from '@/components/Shell';
const T: [string, string][] = [['head_name', 'Director / coordonator'], ['description', 'Descriere'], ['objectives', 'Obiective'], ['responsibilities', 'Responsabilități'], ['rules', 'Reguli']];
export default function P() {
  const [d, setD] = useState<any[]>([]); const [m, setM] = useState('');
  useEffect(() => { sb.from('departments').select('*').eq('archived', false).order('name').then(({ data }) => setD(data || [])); }, []);
  const set = (i: number, k: string, v: string) => setD(d.map((x, j) => j === i ? { ...x, [k]: v } : x));
  const save = async (x: any) => { const p: any = {}; T.forEach(([k]) => p[k] = x[k]); const { error } = await sb.from('departments').update(p).eq('id', x.id); setM(error ? error.message : 'Salvat: ' + x.name); };
  return <Shell><h2>Departamente</h2>{m && <p className="err">{m}</p>}
    {d.map((x, i) => <details key={x.id}><summary>{x.name}</summary><div className="fg" style={{ marginTop: 14 }}>
      {T.map(([k, l]) => <label key={k} style={k === 'head_name' ? {} : { gridColumn: '1/-1' }}>{l}
        {k === 'head_name' ? <input value={x[k] ?? ''} onChange={e => set(i, k, e.target.value)} /> : <textarea rows={3} value={x[k] ?? ''} onChange={e => set(i, k, e.target.value)} />}</label>)}
    </div><button className="btn" style={{ marginTop: 12 }} onClick={() => save(x)}>Salvează</button></details>)}</Shell>;
}
