create extension if not exists pgcrypto;

create table if not exists site_profile (
  id int primary key default 1 check (id = 1),
  name text not null,
  role text not null,
  location text not null,
  email text not null,
  phone text not null,
  linkedin text not null,
  avatar_url text not null,
  cv_url text not null,
  summary text[] not null default '{}',
  core_focus text[] not null default '{}',
  hire_modal_title text not null default 'Hire Me',
  hire_modal_subtitle text not null default 'Choose your preferred contact method.',
  whatsapp_template text not null default 'Hello, I would like to discuss an opportunity.',
  email_subject text not null default 'Opportunity Discussion',
  email_template text not null default 'Hello, I would like to discuss an opportunity.',
  updated_at timestamptz not null default now()
);

create table if not exists experiences (
  id bigint generated always as identity primary key,
  role text not null,
  company text not null,
  period text not null,
  location text not null,
  description text[] not null default '{}',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists education (
  id bigint generated always as identity primary key,
  institution text not null,
  degree text not null,
  period text not null,
  description text,
  achievements text[] not null default '{}',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists organizations (
  id bigint generated always as identity primary key,
  role text not null,
  organization text not null,
  period text not null,
  description text[] not null default '{}',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists skills (
  id bigint generated always as identity primary key,
  category text not null,
  name text not null,
  icon text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists portfolio_projects (
  id text primary key,
  title text not null,
  description text not null,
  long_description text,
  challenge text,
  solution text,
  features text[] not null default '{}',
  tech_stack_details jsonb not null default '[]'::jsonb,
  gallery text[] not null default '{}',
  tags text[] not null default '{}',
  image text not null,
  type text not null default 'web' check (type in ('web', 'pdf', 'video', 'app')),
  status text not null default 'published' check (status in ('published', 'maintenance', 'under_uploading')),
  url text,
  pdf_url text,
  video_url text,
  role text,
  timeline text,
  maintenance_title text,
  maintenance_icon text,
  maintenance_header text,
  maintenance_body text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists admin_users (
  id bigint generated always as identity primary key,
  username text unique not null,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists content_revisions (
  id bigint generated always as identity primary key,
  status text not null check (status in ('draft', 'published', 'archived')),
  snapshot jsonb not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists page_views (
  id bigint generated always as identity primary key,
  path text not null,
  referrer text,
  user_agent text,
  viewed_at timestamptz not null default now()
);

create table if not exists event_clicks (
  id bigint generated always as identity primary key,
  event_name text not null,
  path text not null,
  metadata jsonb not null default '{}'::jsonb,
  clicked_at timestamptz not null default now()
);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists site_profile_updated_at on site_profile;
create trigger site_profile_updated_at
before update on site_profile
for each row execute function set_updated_at();

drop trigger if exists experiences_updated_at on experiences;
create trigger experiences_updated_at
before update on experiences
for each row execute function set_updated_at();

drop trigger if exists education_updated_at on education;
create trigger education_updated_at
before update on education
for each row execute function set_updated_at();

drop trigger if exists organizations_updated_at on organizations;
create trigger organizations_updated_at
before update on organizations
for each row execute function set_updated_at();

drop trigger if exists skills_updated_at on skills;
create trigger skills_updated_at
before update on skills
for each row execute function set_updated_at();

drop trigger if exists portfolio_updated_at on portfolio_projects;
create trigger portfolio_updated_at
before update on portfolio_projects
for each row execute function set_updated_at();

drop trigger if exists admin_users_updated_at on admin_users;
create trigger admin_users_updated_at
before update on admin_users
for each row execute function set_updated_at();

drop trigger if exists content_revisions_updated_at on content_revisions;
create trigger content_revisions_updated_at
before update on content_revisions
for each row execute function set_updated_at();

insert into storage.buckets (id, name, public)
values ('profile-assets', 'profile-assets', true)
on conflict (id) do nothing;

insert into site_profile (
  id,
  name,
  role,
  location,
  email,
  phone,
  linkedin,
  avatar_url,
  cv_url
)
values (
  1,
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  ''
)
on conflict (id) do nothing;
