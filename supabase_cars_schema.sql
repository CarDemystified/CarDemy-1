-- database/cars_schema_setup.sql
-- Run this SQL in your Supabase SQL Editor to bootstrap the cars listing table.

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Create the cars table
create table if not exists public.cars (
  id uuid default gen_random_uuid() primary key,
  make text not null,
  model text not null,
  year integer not null,
  price numeric not null,
  mileage integer not null default 0,
  image_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.cars enable row level security;

-- Row Level Security (RLS) Policies
-- Policy 1: Allows anyone (anonymous & authenticated) to read/view car listings.
create policy "Allow public read access to cars" 
  on public.cars for select using (true);

-- Policy 2: Allows authenticated admins to perform insert, update, or delete operations.
-- Adjust this to match your authentication setup (e.g. checking presence in an 'admins' table like check auth.uid())
create policy "Allow admins to manage cars"
  on public.cars for all using (
    exists (
      select 1 from public.admins where id = auth.uid()
    )
  );

-- Create performance indexes for key query parameters
create index if not exists cars_make_idx on public.cars (make);
create index if not exists cars_price_idx on public.cars (price);
create index if not exists cars_year_idx on public.cars (year);
create index if not exists cars_created_at_idx on public.cars (created_at desc);

-- Insert some high-quality diagnostic car list seeds
insert into public.cars (make, model, year, price, mileage, image_url) values 
  ('Porsche', '911 GT3 RS', 2023, 275000, 1850, 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=800'),
  ('Audi', 'R8 V10 Plus', 2021, 189000, 8400, 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=800'),
  ('Chevrolet', 'Corvette Z06', 2023, 115000, 1200, 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800'),
  ('Ford', 'Mustang Shelby GT500', 2022, 89000, 4500, 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=800'),
  ('BMW', 'M4 Competition', 2022, 83500, 12400, 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800'),
  ('Mercedes-Benz', 'AMG GT C', 2021, 142000, 6200, 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=800')
on conflict do nothing;
