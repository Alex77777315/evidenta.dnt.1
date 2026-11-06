'use client';
import Shell from '@/components/Shell';
import Crud, { F } from '@/components/Crud';
const F_: F[] = [
  { key: 'branch_id', label: 'Filiala (gol = registru național)', from: { table: 'branches', label: 'name' }, list: true },
  { key: 'kind', label: 'Tip', req: true, opts: ['intrare', 'iesire', 'hotarare', 'decizie', 'proces-verbal', 'adresa', 'cerere', 'contract', 'raport', 'alt'], list: true },
  { key: 'entry_date', label: 'Data', type: 'date', req: true, list: true }, { key: 'doc_number', label: 'Nr. document' },
  { key: 'subject', label: 'Subiect', req: true, list: true }, { key: 'counterparty', label: 'Emitent / destinatar', list: true },
  { key: 'department_id', label: 'Departament responsabil', from: { table: 'departments', label: 'name' } },
  { key: 'responsible', label: 'Persoană responsabilă' }, { key: 'status', label: 'Status', opts: ['inregistrat', 'in lucru', 'implementat', 'respins'], list: true },
  { key: 'file_url', label: 'Link document' }, { key: 'notes', label: 'Observații', type: 'textarea' }];
export default function P() { return <Shell><Crud table="register_entries" title="Registre (național și pe filiale)" fields={F_} filterBy="branch_id" /></Shell>; }
