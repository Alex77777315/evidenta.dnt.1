-- DNT CENTRAL – schema Supabase. Rulează în SQL Editor, o singură dată.
create type user_role as enum ('pending','super_admin','president','board_member','executive_member');
create type vol_status as enum ('candidat','activ','inactiv','suspendat','retras');

create table profiles(
  id uuid primary key references auth.users on delete cascade,
  email text, full_name text, role user_role not null default 'pending', created_at timestamptz default now());

create table branches(
  id uuid primary key default gen_random_uuid(),
  code text unique not null,            -- ex: GJ, B, CJ (folosit în numerele de registru)
  name text not null, county text, city text, founded_at date,
  president text, vice_presidents text, secretary text, notes text,
  archived boolean default false, created_at timestamptz default now());

create table departments(
  id uuid primary key default gen_random_uuid(),
  name text unique not null, head_name text,
  description text, objectives text, responsibilities text, rules text,
  archived boolean default false, created_at timestamptz default now());

create table volunteers(
  id uuid primary key default gen_random_uuid(),
  reg_number text unique,
  first_name text not null, last_name text not null, photo_url text,
  email text unique, phone text, county text, city text, birth_date date,
  registered_at date default current_date, accepted_at date,
  branch_id uuid references branches, department_id uuid references departments,
  position text, coordinator_id uuid references volunteers,
  status vol_status not null default 'candidat',
  contract_signed boolean default false, gdpr_consent boolean default false,
  parental_consent boolean default false,   -- necesar pentru minori
  notes text, archived boolean default false, created_at timestamptz default now());

create table volunteer_status_history(
  id uuid primary key default gen_random_uuid(),
  volunteer_id uuid not null references volunteers on delete cascade,
  status vol_status, position text, branch_id uuid, department_id uuid,
  changed_at timestamptz default now(), changed_by uuid);

-- registru per filială (branch_id null = registrul național)
create table register_entries(
  id uuid primary key default gen_random_uuid(),
  reg_number text unique,
  branch_id uuid references branches,
  kind text not null check (kind in ('intrare','iesire','hotarare','decizie','proces-verbal','adresa','cerere','contract','raport','alt')),
  entry_date date not null default current_date,
  doc_number text, counterparty text, subject text not null,
  department_id uuid references departments, responsible text,
  status text default 'inregistrat', file_url text, notes text,
  archived boolean default false, created_at timestamptz default now());

create table audit_logs(
  id bigint generated always as identity primary key,
  user_id uuid, action text, table_name text, record_id text, data jsonb, created_at timestamptz default now());

-- numerotare automată fără duplicate
create table reg_counters(scope text primary key, last int not null default 0);
create function next_no(p text) returns int language plpgsql security definer as $$
declare n int; begin
  insert into reg_counters values(p,1) on conflict(scope) do update set last=reg_counters.last+1 returning last into n; return n; end $$;

create function set_vol_no() returns trigger language plpgsql security definer as $$
begin if new.reg_number is null then
  new.reg_number:='DNT-V-'||to_char(now(),'YYYY')||'-'||lpad(next_no('V'||to_char(now(),'YYYY'))::text,4,'0'); end if; return new; end $$;
create trigger t_vol_no before insert on volunteers for each row execute function set_vol_no();

create function set_reg_no() returns trigger language plpgsql security definer as $$
declare c text:='NAT'; y text:=to_char(new.entry_date,'YYYY'); begin
  if new.branch_id is not null then select code into c from branches where id=new.branch_id; end if;
  if new.reg_number is null then
    new.reg_number:='REG-'||c||'-'||y||'-'||lpad(next_no('R'||c||y)::text,4,'0'); end if; return new; end $$;
create trigger t_reg_no before insert on register_entries for each row execute function set_reg_no();

-- istoric funcții/status
create function vol_hist() returns trigger language plpgsql security definer as $$
begin
  if tg_op='INSERT' or new.status is distinct from old.status or new.position is distinct from old.position
     or new.department_id is distinct from old.department_id or new.branch_id is distinct from old.branch_id then
    insert into volunteer_status_history(volunteer_id,status,position,branch_id,department_id,changed_by)
    values(new.id,new.status,new.position,new.branch_id,new.department_id,auth.uid()); end if; return new; end $$;
create trigger t_vol_hist after insert or update on volunteers for each row execute function vol_hist();

-- audit log automat
create function audit() returns trigger language plpgsql security definer as $$
begin insert into audit_logs(user_id,action,table_name,record_id,data)
  values(auth.uid(),tg_op,tg_table_name,coalesce((to_jsonb(new)->>'id'),(to_jsonb(old)->>'id')),to_jsonb(coalesce(new,old))); return coalesce(new,old); end $$;
create trigger a1 after insert or update or delete on volunteers for each row execute function audit();
create trigger a2 after insert or update or delete on branches for each row execute function audit();
create trigger a3 after insert or update or delete on departments for each row execute function audit();
create trigger a4 after insert or update or delete on register_entries for each row execute function audit();
create trigger a5 after update on profiles for each row execute function audit();

-- profil automat la înregistrare (rol 'pending' = fără acces)
create function new_user() returns trigger language plpgsql security definer as $$
begin insert into profiles(id,email) values(new.id,new.email); return new; end $$;
create trigger on_auth_user after insert on auth.users for each row execute function new_user();

-- ACCES DOAR BOARD
create function is_board() returns boolean language sql security definer stable as $$
  select exists(select 1 from profiles where id=auth.uid() and role in ('super_admin','president','board_member','executive_member')) $$;
create function is_admin() returns boolean language sql security definer stable as $$
  select exists(select 1 from profiles where id=auth.uid() and role in ('super_admin','president')) $$;

alter table profiles enable row level security;
alter table branches enable row level security;
alter table departments enable row level security;
alter table volunteers enable row level security;
alter table volunteer_status_history enable row level security;
alter table register_entries enable row level security;
alter table audit_logs enable row level security;
alter table reg_counters enable row level security;

create policy p_prof_read on profiles for select using (id=auth.uid() or is_board());
create policy p_prof_upd on profiles for update using (is_admin());
create policy p_br on branches for all using (is_board()) with check (is_board());
create policy p_dep on departments for all using (is_board()) with check (is_board());
create policy p_vol on volunteers for all using (is_board()) with check (is_board());
create policy p_hist on volunteer_status_history for select using (is_board());
create policy p_reg on register_entries for all using (is_board()) with check (is_board());
create policy p_audit on audit_logs for select using (is_admin());

-- DEPARTAMENTE (editabile din aplicație)
insert into departments(name,description,objectives,responsibilities,rules) values
('Secretariat','Evidența oficială a organizației.','Registre complete și la zi; ședințe documentate.','Registrul de intrare/ieșire; procese-verbale; arhivă; convocări.','Fiecare document primește număr unic; procesele-verbale se redactează în 5 zile de la ședință.'),
('Finanțe','Gestiunea financiară și transparența.','Buget anual; raportare corectă.','Buget; evidența cheltuielilor; rapoarte financiare; colaborare cu Comisia de Cenzori.','Orice cheltuială are aprobare și document justificativ.'),
('Organizare Internă','Funcționarea structurilor și filialelor.','Filiale active și coordonate.','Înființarea filialelor; relația cu filialele; proceduri interne.','Filialele raportează lunar către nivelul național.'),
('Relații Externe','Colaborări externe și rețele de tineret.','Parteneriate internaționale.','Contacte cu organizații externe; reprezentare; schimburi de experiență.','Comunicarea externă oficială se aprobă de Biroul Executiv.'),
('Proiecte','Planificarea și derularea proiectelor.','Proiecte finalizate la termen.','Dezvoltare proiecte; coordonarea echipelor; rapoarte de proiect.','Fiecare proiect are coordonator, buget estimat și raport final.'),
('Parteneriate și Sponsorizări','Atragerea de parteneri și finanțare.','Rețea stabilă de parteneri.','Negociere; contracte de parteneriat; relația cu sponsorii.','Contractele se semnează doar după aprobarea Consiliului Director.'),
('Advocacy și Comunicare Juridică','Reprezentarea intereselor tinerilor.','Poziții publice și consultanță juridică.','Campanii de advocacy; avize juridice; relația cu instituțiile.','Pozițiile publice sunt aprobate de Biroul Executiv.'),
('Resurse Umane','Voluntari: primire, repartizare, dezvoltare.','Voluntari implicați și evaluați periodic.','Validarea cererilor; repartizarea; evaluări; adeverințe; evidența orelor.','Pentru minori este obligatoriu acordul părinților; datele personale nu se publică.');
