'use client';
import Shell from '@/components/Shell';
import Crud, { F } from '@/components/Crud';
const F_: F[] = [
  { key: 'last_name', label: 'Nume', req: true, list: true }, { key: 'first_name', label: 'Prenume', req: true, list: true },
  { key: 'status', label: 'Status', opts: ['candidat', 'activ', 'inactiv', 'suspendat', 'retras'], list: true },
  { key: 'branch_id', label: 'Filiala', from: { table: 'branches', label: 'name' }, list: true },
  { key: 'department_id', label: 'Departament', from: { table: 'departments', label: 'name' }, list: true },
  { key: 'position', label: 'Funcția', list: true },
  { key: 'coordinator_id', label: 'Coordonator direct', from: { table: 'volunteers', label: 'last_name' } },
  { key: 'email', label: 'E-mail', type: 'email', list: true }, { key: 'phone', label: 'Telefon' },
  { key: 'county', label: 'Județ' }, { key: 'city', label: 'Localitate' }, { key: 'birth_date', label: 'Data nașterii', type: 'date' },
  { key: 'registered_at', label: 'Data înscrierii', type: 'date' }, { key: 'accepted_at', label: 'Data acceptării', type: 'date' },
  { key: 'photo_url', label: 'Link fotografie' },
  { key: 'contract_signed', label: 'Contract de voluntariat semnat', type: 'checkbox' },
  { key: 'gdpr_consent', label: 'Consimțământ GDPR', type: 'checkbox' },
  { key: 'parental_consent', label: 'Acord părinți (minori)', type: 'checkbox' },
  { key: 'notes', label: 'Observații', type: 'textarea' }];
export default function P() { return <Shell><Crud table="volunteers" title="Registrul voluntarilor" fields={F_} filterBy="branch_id" /></Shell>; }
