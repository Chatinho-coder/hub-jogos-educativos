-- Run this in Supabase SQL editor

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.group_members (
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  user_email text not null,
  role text not null default 'member' check (role in ('owner','admin','member')),
  created_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create table if not exists public.group_invites (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  email text not null,
  invited_by uuid not null references auth.users(id) on delete cascade,
  token text not null unique,
  accepted_by uuid references auth.users(id),
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.group_invites enable row level security;

drop policy if exists groups_select_member on public.groups;
create policy groups_select_member on public.groups
for select using (
  exists (
    select 1 from public.group_members gm
    where gm.group_id = groups.id and gm.user_id = auth.uid()
  )
);

drop policy if exists groups_insert_owner on public.groups;
create policy groups_insert_owner on public.groups
for insert with check (owner_id = auth.uid());

drop policy if exists group_members_select_member on public.group_members;
create policy group_members_select_member on public.group_members
for select using (
  exists (
    select 1 from public.group_members gm
    where gm.group_id = group_members.group_id and gm.user_id = auth.uid()
  )
);

drop policy if exists group_members_insert_admin on public.group_members;
create policy group_members_insert_admin on public.group_members
for insert with check (
  exists (
    select 1 from public.group_members gm
    where gm.group_id = group_members.group_id
      and gm.user_id = auth.uid()
      and gm.role in ('owner','admin')
  )
);

drop policy if exists group_members_update_owner on public.group_members;
create policy group_members_update_owner on public.group_members
for update using (
  exists (
    select 1 from public.group_members gm
    where gm.group_id = group_members.group_id
      and gm.user_id = auth.uid()
      and gm.role = 'owner'
  )
);

drop policy if exists group_invites_select_admin on public.group_invites;
create policy group_invites_select_admin on public.group_invites
for select using (
  exists (
    select 1 from public.group_members gm
    where gm.group_id = group_invites.group_id
      and gm.user_id = auth.uid()
      and gm.role in ('owner','admin')
  )
);

drop policy if exists group_invites_insert_admin on public.group_invites;
create policy group_invites_insert_admin on public.group_invites
for insert with check (
  exists (
    select 1 from public.group_members gm
    where gm.group_id = group_invites.group_id
      and gm.user_id = auth.uid()
      and gm.role in ('owner','admin')
  )
);

create or replace function public.accept_group_invite(invite_token text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite public.group_invites;
  v_email text;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  select * into v_invite
  from public.group_invites
  where token = invite_token and accepted_at is null
  limit 1;

  if v_invite.id is null then
    raise exception 'invite_not_found_or_used';
  end if;

  select email into v_email from auth.users where id = auth.uid();

  if lower(coalesce(v_email,'')) <> lower(v_invite.email) then
    raise exception 'invite_email_mismatch';
  end if;

  insert into public.group_members(group_id, user_id, user_email, role)
  values (v_invite.group_id, auth.uid(), v_email, 'member')
  on conflict (group_id, user_id) do nothing;

  update public.group_invites
  set accepted_by = auth.uid(), accepted_at = now()
  where id = v_invite.id;
end;
$$;

grant execute on function public.accept_group_invite(text) to anon, authenticated;
