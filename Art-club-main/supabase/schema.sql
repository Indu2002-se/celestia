-- Create a secure schema for our app
create schema if not exists "public";

-- Enable Row Level Security
alter table "public"."profiles" enable row level security;
alter table "public"."events" enable row level security;
alter table "public"."bookings" enable row level security;

-- Create profiles table
create table if not exists "public"."profiles" (
  "id" uuid references auth.users on delete cascade not null primary key,
  "full_name" text,
  "phone" text,
  "avatar_url" text,
  "created_at" timestamptz default now(),
  "updated_at" timestamptz default now()
);

-- Create events table
create table if not exists "public"."events" (
  "id" uuid default uuid_generate_v4() primary key,
  "title" text not null,
  "description" text,
  "full_description" text,
  "date" timestamptz not null,
  "end_time" timestamptz,
  "venue" text,
  "address" text,
  "price" numeric(10,2) not null default 0,
  "capacity" integer not null default 0,
  "image_url" text,
  "featured_image_1" text,
  "featured_image_2" text,
  "category" text,
  "organizer" text,
  "created_at" timestamptz default now(),
  "updated_at" timestamptz default now(),
  "is_published" boolean default true
);

-- Create bookings table with expanded fields
create table if not exists "public"."bookings" (
  "id" uuid default uuid_generate_v4() primary key,
  "user_id" uuid references auth.users on delete set null,
  "event_id" uuid references public.events on delete cascade not null,
  "reference_number" text not null,
  "tickets_count" integer not null default 1,
  "total_price" numeric(10,2) not null,
  "status" text not null default 'pending',
  "customer_name" text not null,
  "customer_email" text not null,
  "customer_phone" text,
  "special_requirements" text,
  "event_title" text,
  "event_date" timestamptz,
  "event_location" text,
  "payment_intent_id" text,
  "email_sent" boolean default false,
  "created_at" timestamptz default now(),
  "updated_at" timestamptz default now()
);

-- Create an index for faster lookups by reference number
create index if not exists "bookings_reference_number_idx" on "public"."bookings" ("reference_number");

-- Create policies for profiles
create policy "Users can view their own profile"
  on "public"."profiles"
  for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on "public"."profiles"
  for update
  using (auth.uid() = id);

-- Create policies for events
create policy "Anyone can view published events"
  on "public"."events"
  for select
  using (is_published = true);

-- Create policies for bookings
create policy "Users can view their own bookings"
  on "public"."bookings"
  for select
  using (auth.uid() = user_id);

create policy "Users can create bookings"
  on "public"."bookings"
  for insert
  with check (true);  -- Allow any authenticated user to create bookings

-- Create a function to update the updated_at timestamp
create or replace function "public"."update_timestamp"()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers to update the updated_at timestamp
create trigger "profiles_updated_at"
before update on "public"."profiles"
for each row execute procedure "public"."update_timestamp"();

create trigger "events_updated_at"
before update on "public"."events"
for each row execute procedure "public"."update_timestamp"();

create trigger "bookings_updated_at"
before update on "public"."bookings"
for each row execute procedure "public"."update_timestamp"(); 