-- SQL Schema Setup for Foreclosed Auto Deals Market
-- Copy and run this script in your Supabase SQL Editor.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create admins table
create table if not exists public.admins (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null unique,
  name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create settings table
create table if not exists public.settings (
  id text primary key default 'global_settings',
  company_name text not null default 'Foreclosed Auto Deals',
  whatsapp text not null default '',
  phone text not null default '',
  email text not null default '',
  address text not null default '',
  logo_url text,
  social_links jsonb not null default '{}'::jsonb,
  footer_content text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert default settings if they don't exist
insert into public.settings (id, company_name, whatsapp, phone, email, address, social_links)
values (
  'global_settings', 
  'Foreclosed Auto Deals', 
  'https://wa.me/15555550199', 
  '+1 (555) 555-0199', 
  'assets@foreclosedautodeals.com', 
  '4420 Sovereign Way, Suite 100, Miami, FL 33130',
  '{"facebook": "https://facebook.com", "instagram": "https://instagram.com", "twitter": "https://twitter.com", "youtube": "https://youtube.com"}'::jsonb
) on conflict (id) do nothing;

-- 3. Create vehicles table
create table if not exists public.vehicles (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  make text not null,
  model text not null,
  year integer not null,
  mileage integer not null default 0,
  price numeric not null,
  location text not null default 'Miami, FL',
  description text,
  status text not null default 'ACTIVE',
  featured_image text,
  video_url text,
  cta_link text,
  cta_text text default 'Inquire via WhatsApp',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create vehicle_images table
create table if not exists public.vehicle_images (
  id uuid default gen_random_uuid() primary key,
  vehicle_id uuid references public.vehicles(id) on delete cascade not null,
  image_url text not null,
  sort_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Create blog_posts table
create table if not exists public.blog_posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text not null unique,
  content text not null,
  category text default 'Uncategorized',
  featured_image text,
  seo_title text,
  meta_description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================

-- Enable RLS for all tables
alter table public.admins enable row level security;
alter table public.settings enable row level security;
alter table public.vehicles enable row level security;
alter table public.vehicle_images enable row level security;
alter table public.blog_posts enable row level security;

-- Policy helper: Is current user an administrator?
-- Checked using existence in the admins table matching the authenticated user ID.

-- Admins Table Policies
create policy "Allow public read-only access to admins metadata if needed" 
  on public.admins for select using (true);
  
create policy "Allow authenticated setup of the first admin"
  on public.admins for insert with check (
    -- Only permit if no admins exist or if current user is registering themselves.
    (select count(*) from public.admins) = 0 or auth.uid() = id
  );

create policy "Allow admins to manage admin accounts"
  on public.admins for all using (
    exists (select 1 from public.admins where id = auth.uid())
  );

-- Settings Table Policies
create policy "Allow public read access to settings" 
  on public.settings for select using (true);

create policy "Allow admins to modify settings" 
  on public.settings for all using (
    exists (select 1 from public.admins where id = auth.uid())
  );

-- Vehicles Table Policies
create policy "Allow public read access to vehicles" 
  on public.vehicles for select using (true);

create policy "Allow admins to manage vehicles" 
  on public.vehicles for all using (
    exists (select 1 from public.admins where id = auth.uid())
  );

-- Vehicle Images Table Policies
create policy "Allow public read access to vehicle_images" 
  on public.vehicle_images for select using (true);

create policy "Allow admins to manage vehicle_images" 
  on public.vehicle_images for all using (
    exists (select 1 from public.admins where id = auth.uid())
  );

-- Blog Posts Table Policies
create policy "Allow public read access to blog_posts" 
  on public.blog_posts for select using (true);

create policy "Allow admins to manage blog_posts" 
  on public.blog_posts for all using (
    exists (select 1 from public.admins where id = auth.uid())
  );

-- =========================================================
-- STORAGE BUCKETS SETUP GUIDE
-- =========================================================
-- You should manually create the following storage buckets in the Supabase Dashboard:
-- 1. 'vehicle-images' (make public)
-- 2. 'vehicle-videos' (make public)
-- 3. 'blog-images' (make public)
-- 4. 'company-assets' (make public)
-- Ensure they are set to Public, or create a public read policy for storage.objects:
-- e.g., create policy "Public Access" on storage.objects for select using (bucket_id in ('vehicle-images', 'vehicle-videos', 'blog-images', 'company-assets'));
