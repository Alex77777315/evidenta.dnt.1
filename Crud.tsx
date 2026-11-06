'use client';
import { useCallback, useEffect, useState } from 'react';
import { sb } from '@/lib/supabase';
export type F = { key: string; label: string; type?: string; req?: boolean; opts?: string[]; from?: { table: string; label: string }; list?: boolean };
type O = Record<string, [string, string][]>;
export default function Crud({ table, title, fields, filterBy }: { table: string; title: string; fields: F[]; filterBy?: string }) {
  const [rows, setRows] = useState<any[]>([]); const [opts, setOpts] = useState<O>({});
  const [q, setQ] = useState(''); const [flt, setFlt] = useState(''); const [ed, setEd] = useState<any>(null); const [err, setErr] = useState('');
  const fl = filterBy ? fields.find(f => f.key === filterBy) : null;
  useEffect(() => { (async () => {
    const o: O = {};
    for (const f of fields) if (f.from) { const { data } = await sb.from(f.from.table).select('id,' + f.from.label).eq('archived', false); o[f.key] = (data || []).map((x: any) => [x.id, x[f.from!.label]]); }
    setOpts(o); })(); }, []);
  const load = useCallback(async () => {
    let r: any = sb.from(table).select('*').eq('archived', false).order('created_at', { ascending: false });
    if (filterBy && flt) r = r.eq(filterBy, flt);
    const { data, error } = await r; if (error) setErr(error.message); else setRows(data || []);
  }, [table, filterBy, flt]);
  useEffect(() => { load(); }, [load]);
  const show = (f: F, v: any) => f.type === 'checkbox' ? (v ? 'Da' : 'Nu') : f.from ? (opts[f.key]?.find(x => x[0] === v)?.[1] ?? '') : (v ?? '');
  const cols = fields.filter(f => f.list);
  const vis = rows.filter(r => !q || JSON.stringify(Object.values(r)).toLowerCase().includes(q.toLowerCase()));
  const save = async () => {
    setErr(''); const p: any = {};
    for (const f of fields) p[f.key] = f.type === 'checkbox' ? !!ed[f.key] : (ed[f.key] === '' || ed[f.key] === undefined ? null : ed[f.key]);
    const { error } = ed.id ? await sb.from(table).update(p).eq('id', ed.id) : await sb.from(table).insert(p);
    if (error) { setErr(error.message); return; } setEd(null); load();
  };
  const arch = async (id: string) => { if (!confirm('Arhivezi această înregistrare? Poate fi recuperată din baza de date.')) return;
    const { error } = await sb.from(table).update({ archived: true }).eq('id', id); if (error) setErr(error.message); else load(); };
  const csv = () => {
    const all = [{ key: 'reg_number', label: 'Nr.' } as F, ...fields];
    const esc = (v: any) => '"' + String(v ?? '').replace(/"/g, '""') + '"';
    const t = [all.map(f => esc(f.label)).join(',')].concat(vis.map(r => all.map(f => esc(show(f, r[f.key]))).join(','))).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeff' + t], { type: 'text/csv' })); a.download = table + '.csv'; a.click();
  };
  return <>
    <h2>{title}</h2>
    <div className="bar">
      <input placeholder="Caută…" value={q} onChange={e => setQ(e.target.value)} />
      {fl && <select value={flt} onChange={e => setFlt(e.target.value)}><option value="">Toate: {fl.label}</option>{opts[fl.key]?.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>}
      <button className="btn" onClick={() => setEd({})}>Adaugă</button>
      <button className="btn g" onClick={csv}>Export Excel (CSV)</button>
    </div>
    {err && <p className="err">{err}</p>}
    <div className="tw"><table><thead><tr><th>Nr.</th>{cols.map(c => <th key={c.key}>{c.label}</th>)}<th></th></tr></thead>
      <tbody>{vis.map(r => <tr key={r.id}><td>{r.reg_number || '—'}</td>{cols.map(c => <td key={c.key}>{show(c, r[c.key])}</td>)}
        <td><button className="btn s g" onClick={() => setEd(r)}>Editează</button> <button className="btn s g" onClick={() => arch(r.id)}>Arhivează</button></td></tr>)}
        {!vis.length && <tr><td colSpan={cols.length + 2}>Nicio înregistrare. Apasă „Adaugă”.</td></tr>}</tbody></table></div>
    {ed && <div className="modal"><div className="box"><h2>{ed.id ? 'Editează' : 'Adaugă'}</h2><div className="fg">
      {fields.map(f => f.type === 'checkbox'
        ? <label key={f.key} className="ck"><input type="checkbox" checked={!!ed[f.key]} onChange={e => setEd({ ...ed, [f.key]: e.target.checked })} />{f.label}</label>
        : <label key={f.key} style={f.type === 'textarea' ? { gridColumn: '1/-1' } : {}}>{f.label}{f.req && ' *'}
          {f.type === 'textarea' ? <textarea rows={3} value={ed[f.key] ?? ''} onChange={e => setEd({ ...ed, [f.key]: e.target.value })} />
            : (f.opts || f.from) ? <select value={ed[f.key] ?? ''} onChange={e => setEd({ ...ed, [f.key]: e.target.value })}><option value="">—</option>
              {(f.opts ? f.opts.map(o => [o, o]) : opts[f.key] || []).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
            : <input type={f.type || 'text'} required={f.req} value={ed[f.key] ?? ''} onChange={e => setEd({ ...ed, [f.key]: e.target.value })} />}</label>)}
    </div>{err && <p className="err">{err}</p>}
    <div className="bar" style={{ marginTop: 16 }}><button className="btn" onClick={save}>Salvează</button><button className="btn g" onClick={() => { setEd(null); setErr(''); }}>Anulează</button></div></div></div>}
  </>;
}
