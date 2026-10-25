-- campus bazaar database
-- paste this whole file into supabase -> SQL Editor -> Run (only once)

-- =========================================================
-- 1. profiles: the public, anonymous side of every student
-- =========================================================
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique
    check (username ~ '^[A-Za-z0-9_]{3,20}$')
    check (lower(username) not in ('admin', 'moderator', 'mod', 'support', 'campusbazaar', 'nsut')),
  bio text not null default '' check (char_length(bio) <= 160),
  avatar_url text,
  role text not null default 'student' check (role in ('student', 'admin')),
  created_at timestamptz not null default now()
);

-- used by lots of policies below. "security definer" lets it read profiles
-- even when the caller's own policies wouldn't allow it.
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- random anonymous username like CaffeinatedCompiler_417
create function public.random_username()
returns text
language plpgsql
set search_path = ''
as $$
declare
  adjectives text[] := array['Sleepy', 'Caffeinated', 'Chaotic', 'Lowkey', 'Spicy', 'Silent',
    'Midnight', 'Cosmic', 'Feral', 'Lucky', 'Turbo', 'Fuzzy', 'Sneaky', 'Wholesome', 'Grumpy'];
  nouns text[] := array['Panda', 'Compiler', 'Mango', 'Pigeon', 'Samosa', 'Byte', 'Otter',
    'Kernel', 'Noodle', 'Falcon', 'Pixel', 'Chai', 'Raccoon', 'Router', 'Penguin'];
  candidate text;
begin
  loop
    candidate := adjectives[1 + floor(random() * array_length(adjectives, 1))::int]
      || nouns[1 + floor(random() * array_length(nouns, 1))::int]
      || '_' || (10 + floor(random() * 990))::int;
    -- retry until we find one nobody has
    exit when not exists (select 1 from public.profiles where username = candidate);
  end loop;
  return candidate;
end;
$$;

-- runs every time someone signs up (google or anything else).
-- non-nsut emails are rejected HERE, inside the database,
-- so nobody can get around it by editing the frontend.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is null or lower(new.email) not like '%@nsut.ac.in' then
    raise exception 'only @nsut.ac.in emails can join campus bazaar';
  end if;

  -- we deliberately don't copy their real name or google photo
  insert into public.profiles (id, username)
  values (new.id, public.random_username());

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================
-- 2. listings: stuff for sale, giveaways and help requests
-- =========================================================
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  type text not null default 'offer' check (type in ('offer', 'request')),
  category text not null check (category in ('notes', 'books', 'electronics', 'hostel', 'help', 'other')),
  title text not null check (char_length(title) between 3 and 80),
  description text not null default '' check (char_length(description) <= 1000),
  price integer not null default 0 check (price between 0 and 100000),
  negotiable boolean not null default false,
  condition text check (condition in ('new', 'like_new', 'good', 'used')),
  notes_format text check (notes_format in ('hardcopy', 'softcopy')),
  images text[] not null default '{}' check (cardinality(images) <= 4),
  -- pending -> (ai check) -> active or flagged. active <-> sold. admins can remove.
  status text not null default 'pending' check (status in ('pending', 'active', 'flagged', 'sold', 'removed')),
  ai_verdict text check (ai_verdict in ('violates', 'safe', 'unsure')),
  ai_reason text,
  created_at timestamptz not null default now(),
  -- full text search over title + description
  search tsvector generated always as (
    to_tsvector('english', title || ' ' || description)
  ) stored
);

create index listings_search_idx on public.listings using gin (search);
create index listings_browse_idx on public.listings (status, category, created_at desc);
create index listings_seller_idx on public.listings (seller_id);

-- normal students can only flip their own listing between active and sold.
-- only the server (after the ai check) and admins can do anything else.
create function public.check_listing_status()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = old.status then
    return new;
  end if;
  if current_user in ('service_role', 'postgres', 'supabase_admin') or public.is_admin() then
    return new;
  end if;
  if (old.status = 'active' and new.status = 'sold') or (old.status = 'sold' and new.status = 'active') then
    return new;
  end if;
  raise exception 'you can''t change this listing''s status';
end;
$$;

create trigger listings_status_guard
  before update on public.listings
  for each row execute function public.check_listing_status();

-- =========================================================
-- 3. chat: one conversation per buyer per listing
-- =========================================================
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  buyer_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  seller_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (listing_id, buyer_id),
  check (buyer_id <> seller_id)
);

create index conversations_buyer_idx on public.conversations (buyer_id);
create index conversations_seller_idx on public.conversations (seller_id);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  content text not null check (char_length(trim(content)) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index messages_conversation_idx on public.messages (conversation_id, created_at);

-- is the logged in user the buyer or seller in this conversation?
create function public.is_member(convo_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.conversations
    where id = convo_id
      and (select auth.uid()) in (buyer_id, seller_id)
  );
$$;

-- =========================================================
-- 4. reports: filled in by the server, read by admins
-- =========================================================
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  target_type text not null check (target_type in ('listing', 'message')),
  -- "set null" so deleting the listing/message doesn't make the report disappear
  listing_id uuid references public.listings (id) on delete set null,
  message_id uuid references public.messages (id) on delete set null,
  -- who wrote the reported thing (so mods can spot repeat offenders)
  reported_user_id uuid references public.profiles (id) on delete set null,
  reason text not null check (reason in ('scam', 'prohibited', 'academic_dishonesty', 'harassment', 'sexual', 'spam', 'other')),
  details text not null default '' check (char_length(details) <= 500),
  -- copy of what was reported, so admins can still see it if it gets deleted
  content_snapshot text not null,
  ai_verdict text check (ai_verdict in ('violates', 'safe', 'unsure')),
  ai_category text,
  ai_confidence real,
  ai_reason text,
  status text not null default 'open' check (status in ('open', 'dismissed', 'actioned')),
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

-- one report per person per thing
create unique index reports_one_per_listing on public.reports (reporter_id, listing_id) where listing_id is not null;
create unique index reports_one_per_message on public.reports (reporter_id, message_id) where message_id is not null;
create index reports_queue_idx on public.reports (status, created_at);

-- =========================================================
-- 5. who can touch what (table + column permissions)
-- supabase gives everyone full table access by default,
-- so we take it all back and hand out only what's needed.
-- =========================================================
revoke all on public.profiles, public.listings, public.conversations, public.messages, public.reports
  from anon, authenticated;

grant select on public.profiles to anon, authenticated;
-- students can change these 3 columns and nothing else (so nobody makes themselves admin)
grant update (username, bio, avatar_url) on public.profiles to authenticated;

grant select on public.listings to anon, authenticated;
grant insert (type, category, title, description, price, negotiable, condition, notes_format, images)
  on public.listings to authenticated;
grant update (status) on public.listings to authenticated;
grant delete on public.listings to authenticated;

grant select, insert (listing_id, seller_id) on public.conversations to authenticated;
grant select, insert (conversation_id, content) on public.messages to authenticated;
grant select, update (status, reviewed_by, reviewed_at) on public.reports to authenticated;

-- =========================================================
-- 6. row level security: which ROWS each person can touch
-- =========================================================
alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.reports enable row level security;

-- profiles: anyone can see usernames, you can only edit yourself
create policy "profiles are public" on public.profiles
  for select using (true);
create policy "edit your own profile" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- listings: everyone sees live ones, you also see your own, admins see everything
create policy "see live listings" on public.listings
  for select using (
    status in ('active', 'sold')
    or seller_id = (select auth.uid())
    or (select public.is_admin())
  );
create policy "post as yourself" on public.listings
  for insert to authenticated
  with check (seller_id = (select auth.uid()) and status = 'pending');
create policy "update your own listing" on public.listings
  for update to authenticated
  using (seller_id = (select auth.uid()) or (select public.is_admin()));
create policy "delete your own listing" on public.listings
  for delete to authenticated
  using (seller_id = (select auth.uid()) or (select public.is_admin()));

-- conversations: only the buyer and seller can see a chat
create policy "see your chats" on public.conversations
  for select to authenticated
  using ((select auth.uid()) in (buyer_id, seller_id));
create policy "start a chat on someone else's live listing" on public.conversations
  for insert to authenticated
  with check (
    buyer_id = (select auth.uid())
    and exists (
      select 1 from public.listings l
      where l.id = listing_id
        and l.seller_id = conversations.seller_id
        and l.seller_id <> (select auth.uid())
        and l.status = 'active'
    )
  );

-- messages: read and send only inside your own chats
create policy "read messages in your chats" on public.messages
  for select to authenticated
  using ((select public.is_member(conversation_id)));
create policy "send messages in your chats" on public.messages
  for insert to authenticated
  with check (sender_id = (select auth.uid()) and (select public.is_member(conversation_id)));
-- no policy for admins on purpose: even admins can't read private chats.
-- they only see the copy saved in a report, and the server deletes it if needed.

-- reports: only admins can read or update them
create policy "admins read reports" on public.reports
  for select to authenticated using ((select public.is_admin()));
create policy "admins update reports" on public.reports
  for update to authenticated using ((select public.is_admin()));

-- =========================================================
-- 7. realtime: push new messages to the open chat window.
-- realtime follows the rls rules above, so you only get your own chats.
-- =========================================================
alter publication supabase_realtime add table public.messages;

-- =========================================================
-- 8. storage: listing photos + avatars
-- files go in a folder named after your user id, e.g. listing-images/<your-id>/abc.webp
-- =========================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('listing-images', 'listing-images', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']),
  ('avatars', 'avatars', true, 1048576, array['image/jpeg', 'image/png', 'image/webp']);

create policy "upload into your own folder" on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('listing-images', 'avatars')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
create policy "replace files in your own folder" on storage.objects
  for update to authenticated
  using (
    bucket_id in ('listing-images', 'avatars')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
create policy "delete files in your own folder" on storage.objects
  for delete to authenticated
  using (
    bucket_id in ('listing-images', 'avatars')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
