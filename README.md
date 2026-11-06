# DNT CENTRAL
*One Organization. One System. One Direction.*

Platformă internă DNT (acces **doar board**) + site public (`public/site.html`).
Stack: Next.js 14, TypeScript, Supabase (Auth + PostgreSQL + RLS).

## Ce include
- Voluntari cu fișă completă, număr de înregistrare automat (`DNT-V-2026-0001`), istoric de funcții/status automat, arhivare, căutare, filtru pe filială, export CSV (deschis în Excel)
- Filiale (cu cod scurt)
- Registre național și pe filială, numerotare automată fără duplicate (`REG-GJ-2026-0001`)
- Departamente cu descriere, obiective, responsabilități și reguli, editabile
- Dashboard cu cifre reale din baza de date
- Audit log automat (vizibil doar pentru președinte / super admin)
- Securitate prin RLS: doar rolurile board văd datele

## Configurare (o singură dată)
1. Creează un proiect gratuit pe https://supabase.com
2. SQL Editor → lipește tot `supabase/schema.sql` → Run
3. Authentication → Users → Add user (e-mail + parolă) pentru fiecare membru board
4. Dă-ți rolul de administrator (SQL Editor):
   `update profiles set role='super_admin' where email='emailul-tau@exemplu.ro';`
   Pentru ceilalți: `president`, `board_member` sau `executive_member`. Rolul `pending` nu are acces.
5. Settings → API → copiază URL și anon key în `.env.local` (vezi `.env.example`)
6. `npm install` și `npm run dev` → http://localhost:3000

## Publicare
Vercel → Import din GitHub → adaugă cele 2 variabile de mediu → Deploy.
Site-ul public static este la `/site.html`.

## Date personale
Nu stoca CNP. Pentru minori bifează „Acord părinți”. Activează backup-urile în Supabase.

## Următoarele etape
Încărcare documente (Storage), ședințe, proiecte, orele de voluntariat, adeverințe PDF/DOCX, notificări, roluri pe filială.
