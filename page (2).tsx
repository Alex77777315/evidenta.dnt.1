'use client';
import { useState } from 'react';
import { sb } from '@/lib/supabase';
export default function Login() {
  const [e, setE] = useState(''); const [p, setP] = useState(''); const [m, setM] = useState('');
  const go = async (ev: React.FormEvent) => { ev.preventDefault();
    const { error } = await sb.auth.signInWithPassword({ email: e, password: p });
    if (error) setM('E-mail sau parolă greșită.'); else location.href = '/dashboard'; };
  return <div className="login"><form onSubmit={go}><h2 style={{ margin: 0 }}>DNT CENTRAL</h2><small style={{ color: '#9DB0D3' }}>One Organization. One System. One Direction.</small>
    <label>E-mail<input type="email" required value={e} onChange={x => setE(x.target.value)} /></label>
    <label>Parolă<input type="password" required value={p} onChange={x => setP(x.target.value)} /></label>
    <button className="btn">Intră în cont</button><p className="err">{m}</p></form></div>;
}
