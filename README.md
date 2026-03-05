# Web Profile Template (Next.js + Supabase)

Template website profil personal dengan dashboard admin dan workflow draft/publish.

## Stack
- Next.js (App Router)
- Tailwind CSS
- Supabase Postgres + Storage

## Fitur
- Halaman publik profil dari data Supabase
- Dashboard admin untuk kelola semua section konten
- Media library (upload dan pick)
- Draft, preview (`/admin/preview`), publish, restore revision
- Analytics dasar (page views dan click events)
- Pengaturan kredensial admin
- Setup Supabase dari UI admin (set URL/key + test connection)
- Factory reset dari admin untuk kembali ke kondisi kosong

## Environment Variables
Salin `.env.example` ke `.env.local`:

```bash
cp .env.example .env.local
```

Direkomendasikan:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_SESSION_SECRET`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

Kalau tidak diisi, Supabase tetap bisa dikonfigurasi dari halaman `/admin/login`.

## Setup Supabase
1. Buka SQL Editor di Supabase.
2. Jalankan file [`supabase/schema.sql`](./supabase/schema.sql).
3. Pastikan bucket `profile-assets` tersedia dan public.

## Login Admin Awal
- Default template:
  - Username: `admin`
  - Password: `admin`
- Kredensial ini bisa diubah dari menu `Admin Settings`.
- Dari `/admin/login`, user bisa:
  - isi URL + key Supabase,
  - tes koneksi,
  - simpan konfigurasi.

Catatan: konfigurasi dari UI disimpan ke file `.runtime-config.json` di server. Untuk platform filesystem read-only (mis. Vercel), gunakan environment variables saat deploy.

## Empty State
Saat data masih kosong, halaman publik akan menampilkan instruksi setup dan tombol masuk admin, bukan error page.

## Reset Data Lama (Opsional)
Kalau project Supabase kamu sebelumnya sudah berisi data, kosongkan dulu:

```sql
truncate table
  experiences,
  education,
  organizations,
  skills,
  portfolio_projects,
  content_revisions,
  admin_users,
  page_views,
  event_clicks
restart identity cascade;

update site_profile
set
  name = '',
  role = '',
  location = '',
  email = '',
  phone = '',
  linkedin = '',
  avatar_url = '',
  cv_url = '',
  summary = '{}',
  core_focus = '{}',
  hire_modal_title = 'Let''s Work Together',
  hire_modal_subtitle = 'Choose your preferred contact method.',
  whatsapp_template = 'Hello, I would like to discuss an opportunity.',
  email_subject = 'Opportunity Discussion',
  email_template = 'Hello, I would like to discuss an opportunity.'
where id = 1;
```

## Development
```bash
npm install
npm run dev
```

Endpoint lokal:
- Public: [http://localhost:3000](http://localhost:3000)
- Admin login: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- Draft preview: [http://localhost:3000/admin/preview](http://localhost:3000/admin/preview)
