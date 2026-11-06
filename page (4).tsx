'use client';
import Shell from '@/components/Shell';
import Crud, { F } from '@/components/Crud';
const F_: F[] = [
  { key: 'name', label: 'Denumire', req: true, list: true }, { key: 'code', label: 'Cod scurt (ex: GJ)', req: true, list: true },
  { key: 'county', label: 'Județ', list: true }, { key: 'city', label: 'Localitate', list: true }, { key: 'founded_at', label: 'Data înființării', type: 'date' },
  { key: 'president', label: 'Președinte', list: true }, { key: 'vice_presidents', label: 'Vicepreședinți' }, { key: 'secretary', label: 'Secretar' },
  { key: 'notes', label: 'Observații', type: 'textarea' }];
export default function P() { return <Shell><Crud table="branches" title="Filiale" fields={F_} /></Shell>; }
