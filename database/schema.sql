-- Run once in a new Supabase project. Amounts are integer cents.
begin;
create schema if not exists app_private;
revoke all on schema app_private from public, anon, authenticated;
create table public.users (
 id text primary key default gen_random_uuid()::text, auth_id uuid unique references auth.users(id) on delete set null,
 nickname text not null, phone text not null default '', wechat text not null default '', city text default '青岛市',
 bio text default '', specialties text default '', is_platform boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.merchants(id text primary key default gen_random_uuid()::text,name text not null,status text not null default '正常' check(status in ('正常','暂停','已到期')),expires_on date not null,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.stores(id text primary key default gen_random_uuid()::text,merchant_id text not null references public.merchants on delete restrict,name text not null,city text not null default '青岛市',address text default '',hours text default '',phone text default '',intro text default '',environment text default '',rooms text default '',activity text default '',created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.store_members(id text primary key default gen_random_uuid()::text,store_id text not null references public.stores on delete restrict,user_id text not null references public.users on delete restrict,role text not null check(role in ('admin','dm')),active boolean not null default true,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),unique(store_id,user_id,role));
create table public.store_customers(id text primary key default gen_random_uuid()::text,store_id text not null references public.stores on delete restrict,user_id text not null references public.users on delete restrict,is_member boolean not null default false,expires_on date,balance bigint not null default 0 check(balance between 0 and 100000000),created_at timestamptz not null default now(),updated_at timestamptz not null default now(),unique(store_id,user_id));
create table public.scripts(id text primary key default gen_random_uuid()::text,name text not null,players integer not null check(players between 1 and 30),gender text not null,duration integer not null check(duration>0),type text not null,difficulty text not null,publisher text not null,intro text not null,cover integer default 0,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.store_scripts(id text primary key default gen_random_uuid()::text,store_id text not null references public.stores on delete restrict,script_id text not null references public.scripts on delete restrict,price bigint not null check(price between 0 and 100000000),dm_ids text[] not null default '{}',visible boolean not null default true,is_new boolean not null default false,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),unique(store_id,script_id));
create table public.sessions(id text primary key default gen_random_uuid()::text,store_id text not null references public.stores on delete restrict,script_id text not null references public.scripts on delete restrict,dm_id text not null references public.users on delete restrict,date date not null,time time not null,expected integer not null check(expected between 1 and 30),price bigint not null check(price between 0 and 100000000),type text not null check(type in ('normal','recruitment')),status text not null check(status in ('draft','recruiting','confirmed','completed','cancelled','voided')),note text default '',void_reason text,completed_at timestamptz,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.session_participants(id text primary key default gen_random_uuid()::text,session_id text not null references public.sessions on delete restrict,user_id text not null references public.users on delete restrict,due bigint not null check(due between 0 and 100000000),actual bigint not null default 0 check(actual between 0 and 100000000),discount bigint not null default 0 check(discount between 0 and 100000000),note text default '',created_at timestamptz not null default now(),updated_at timestamptz not null default now(),unique(session_id,user_id));
create table public.session_payments(id text primary key default gen_random_uuid()::text,session_id text not null references public.sessions on delete restrict,participant_id text not null references public.session_participants on delete restrict,method text not null check(method in ('wechat','alipay','cash','balance','other')),amount bigint not null check(amount between 1 and 100000000),created_at timestamptz not null default now());
create table public.recruitment_applications(id text primary key default gen_random_uuid()::text,session_id text not null references public.sessions on delete restrict,user_id text not null references public.users on delete restrict,nickname text not null,phone text default '',wechat text default '',note text default '',status text not null default 'pending' check(status in ('pending','confirmed','rejected')),created_at timestamptz not null default now(),updated_at timestamptz not null default now(),check(length(trim(phone))+length(trim(wechat))>0));
create unique index application_active on public.recruitment_applications(session_id,user_id) where status<>'rejected';
create table public.balance_transactions(id text primary key default gen_random_uuid()::text,store_id text not null references public.stores on delete restrict,user_id text not null references public.users on delete restrict,operator_id text not null references public.users on delete restrict,session_id text references public.sessions on delete restrict,type text not null check(type in ('recharge','consume','gift','refund','correction')),delta bigint not null,before_balance bigint not null check(before_balance>=0),after_balance bigint not null check(after_balance>=0),payment_method text not null check(payment_method in ('wechat','alipay','cash','balance','other')),note text not null,created_at timestamptz not null default now(),check(after_balance=before_balance+delta));
create table public.commission_rules(id text primary key default gen_random_uuid()::text,store_id text not null references public.stores on delete restrict,dm_id text not null references public.users on delete restrict,kind text not null check(kind in ('fixed','per_player','percent','bonus')),amount bigint not null check(amount between 0 and 100000000),rate integer not null check(rate between 0 and 10000),threshold integer not null check(threshold between 0 and 30),extra bigint not null check(extra between 0 and 100000000),created_at timestamptz not null default now(),updated_at timestamptz not null default now(),unique(store_id,dm_id));
create table public.commission_records(id text primary key default gen_random_uuid()::text,session_id text not null unique references public.sessions on delete restrict,store_id text not null references public.stores on delete restrict,dm_id text not null references public.users on delete restrict,amount bigint not null check(amount>=0),snapshot jsonb not null,voided boolean not null default false,created_at timestamptz not null default now());
create table public.wage_adjustments(id text primary key default gen_random_uuid()::text,store_id text not null references public.stores on delete restrict,dm_id text not null references public.users on delete restrict,operator_id text not null references public.users on delete restrict,month text not null check(month~'^\d{4}-(0[1-9]|1[0-2])$'),type text not null check(type in ('subsidy','deduction')),amount bigint not null check(amount between 1 and 100000000),note text not null,created_at timestamptz not null default now());
create table public.audit_logs(id text primary key default gen_random_uuid()::text,operator_id text not null references public.users on delete restrict,store_id text references public.stores on delete restrict,action text not null,target_type text not null,target_id text not null,before_data jsonb,after_data jsonb,created_at timestamptz not null default now());
create table public.posts(id text primary key default gen_random_uuid()::text,user_id text not null references public.users on delete restrict,store_id text references public.stores on delete restrict,type text not null check(type in ('剧本体验','DM推荐','门店推荐','门店体验','门店吐槽','剧本讨论')),title text not null check(length(title) between 1 and 80),body text not null check(length(body) between 1 and 3000),hidden boolean not null default false,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.comments(id text primary key default gen_random_uuid()::text,post_id text not null references public.posts on delete restrict,user_id text not null references public.users on delete restrict,body text not null check(length(body) between 1 and 1000),official boolean not null default false,created_at timestamptz not null default now());
create table public.favorites(id text primary key default gen_random_uuid()::text,user_id text not null references public.users on delete restrict,target_type text not null check(target_type in ('post','script')),target_id text not null,post_id text references public.posts on delete restrict,script_id text references public.scripts on delete restrict,created_at timestamptz not null default now(),unique(user_id,target_type,target_id),check((target_type='post' and post_id is not null and post_id=target_id and script_id is null) or (target_type='script' and script_id is not null and script_id=target_id and post_id is null)));
create table public.likes(id text primary key default gen_random_uuid()::text,user_id text not null references public.users on delete restrict,target_type text not null default 'post' check(target_type='post'),target_id text not null references public.posts on delete restrict,created_at timestamptz not null default now(),unique(user_id,target_id));
create table public.reports(id text primary key default gen_random_uuid()::text,user_id text not null references public.users on delete restrict,post_id text not null references public.posts on delete restrict,reason text not null,status text not null default 'pending' check(status in ('pending','removed','dismissed')),created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create index sessions_store_date on public.sessions(store_id,date,status);
create index sessions_dm_date on public.sessions(dm_id,date);
create unique index sessions_dm_start_active on public.sessions(dm_id,date,time) where status in ('draft','recruiting','confirmed');
create index participants_user on public.session_participants(user_id,session_id);
create index payments_session on public.session_payments(session_id,method);
create index transactions_customer on public.balance_transactions(store_id,user_id,created_at);
create index applications_session on public.recruitment_applications(session_id,status);
create index commissions_dm on public.commission_records(store_id,dm_id);
create index audits_store on public.audit_logs(store_id,created_at);
create index comments_post on public.comments(post_id,created_at);
create index reports_status on public.reports(status);
create index members_user on public.store_members(user_id,store_id);
create index payments_participant on public.session_payments(participant_id);
create index applications_user on public.recruitment_applications(user_id,session_id);

create function app_private.actor() returns text language sql stable security definer set search_path='' as $$select id from public.users where auth_id=auth.uid()$$;
create function app_private.platform() returns boolean language sql stable security definer set search_path='' as $$select coalesce((select is_platform from public.users where id=app_private.actor()),false)$$;
create function app_private.admin(s text) returns boolean language sql stable security definer set search_path='' as $$select app_private.platform() or exists(select 1 from public.store_members where user_id=app_private.actor() and store_id=s and role='admin' and active)$$;
create function app_private.assert(ok boolean,message text) returns void language plpgsql set search_path='' as $$begin if not coalesce(ok,false) then raise exception '%',message;end if;end$$;
create function app_private.check_role(r text,s text) returns void language plpgsql security definer set search_path='' as $$begin
 perform app_private.assert(app_private.actor() is not null,'请登录并绑定业务用户');
 perform app_private.assert(r='player' or (r='platform' and app_private.platform()) or exists(select 1 from public.store_members where user_id=app_private.actor() and store_id=s and role=r and active),'没有该身份或门店权限');
end$$;
create function app_private.customer(s text,u text) returns void language sql set search_path='' as $$insert into public.store_customers(store_id,user_id) values(s,u) on conflict(store_id,user_id) do nothing$$;
create function app_private.ledger(s text,u text,d bigint,t text,n text,m text,sid text default null) returns void language plpgsql set search_path='' as $$declare b bigint;begin
 perform app_private.customer(s,u);select balance into b from public.store_customers where store_id=s and user_id=u for update;
 perform app_private.assert(b+d between 0 and 100000000,'玩家余额不足或金额超出范围');
 insert into public.balance_transactions(store_id,user_id,operator_id,session_id,type,delta,before_balance,after_balance,payment_method,note) values(s,u,app_private.actor(),sid,t,d,b,b+d,m,n);
 update public.store_customers set balance=b+d,updated_at=now() where store_id=s and user_id=u;
end$$;
create function app_private.audit(s text,a text,t text,i text,b jsonb,e jsonb) returns void language sql set search_path='' as $$insert into public.audit_logs(store_id,operator_id,action,target_type,target_id,before_data,after_data) values(s,app_private.actor(),a,t,i,b,e)$$;

-- Direct table writes are denied. Only checked RPCs mutate data.
do $$declare t text;begin
 foreach t in array array['users','merchants','stores','store_members','store_customers','scripts','store_scripts','sessions','session_participants','session_payments','recruitment_applications','balance_transactions','commission_rules','commission_records','wage_adjustments','audit_logs','posts','comments','favorites','reports','likes'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from anon, authenticated',t);
 end loop;
end$$;
-- RLS remains in force for future direct read grants; private tables default-deny.
create policy catalog_read on public.scripts for select to authenticated using(true);
create policy stores_read on public.stores for select to authenticated using(true);
create policy own_membership_read on public.store_customers for select to authenticated using(user_id=app_private.actor() or app_private.admin(store_id));
create policy own_ledger_read on public.balance_transactions for select to authenticated using(user_id=app_private.actor() or app_private.admin(store_id));
create policy commission_read on public.commission_records for select to authenticated using(dm_id=app_private.actor() or app_private.admin(store_id));
create policy commission_rule_read on public.commission_rules for select to authenticated using(dm_id=app_private.actor() or app_private.admin(store_id));

create function public.demo_read(p_role text,p_store text) returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;u text:=app_private.actor();a boolean;plat boolean; t text;rows jsonb;
begin
 perform app_private.check_role(p_role,p_store);a:=p_role='admin';plat:=p_role='platform';
 result:=jsonb_build_object('version',1,'current_user_id',u,'available_roles',(select jsonb_agg(role order by role) from (select 'player' role union select role from public.store_members where user_id=u and active union select 'platform' where app_private.platform()) roles),'available_contexts',(select jsonb_agg(jsonb_build_object('role',role,'store_id',store_id) order by role,store_id) from (select 'player'::text role,null::text store_id union select role,store_id from public.store_members where user_id=u and active union select 'platform',null where app_private.platform()) choices));
 result:=result||jsonb_build_object('users',(select coalesce(jsonb_agg(case when plat or x.id=u or a and exists(select 1 from public.store_customers c where c.user_id=x.id and c.store_id=p_store) then to_jsonb(x)-'auth_id'-'is_platform' else jsonb_build_object('id',x.id,'nickname',x.nickname,'city',x.city,'bio',x.bio,'specialties',x.specialties) end),'[]'::jsonb) from public.users x));
 foreach t in array array['merchants','stores','scripts'] loop
 execute format('select coalesce(jsonb_agg(to_jsonb(x)),''[]''::jsonb) from public.%I x',t) into rows;result:=result||jsonb_build_object(t,rows);
 end loop;
 result:=result||jsonb_build_object('store_members',(select coalesce(jsonb_agg(to_jsonb(x)),'[]'::jsonb) from public.store_members x where plat or x.user_id=u or a and x.store_id=p_store or x.role='dm' and x.active));
 result:=result||jsonb_build_object('store_scripts',(select coalesce(jsonb_agg(to_jsonb(x)),'[]'::jsonb) from public.store_scripts x where plat or x.visible or p_role in ('admin','dm') and x.store_id=p_store));
 result:=result||jsonb_build_object('sessions',(select coalesce(jsonb_agg(to_jsonb(s)||jsonb_build_object('time',to_char(s.time,'HH24:MI'))),'[]'::jsonb) from public.sessions s where plat or a and s.store_id=p_store or p_role='dm' and s.dm_id=u and s.store_id=p_store or p_role='player' and (s.type='recruitment' and s.status='recruiting' or exists(select 1 from public.session_participants p where p.session_id=s.id and p.user_id=u))));
 result:=result||jsonb_build_object('participant_counts',(select coalesce(jsonb_object_agg(session_id,n),'{}'::jsonb) from (select session_id,count(*) n from public.session_participants where session_id in(select value->>'id' from jsonb_array_elements(result->'sessions')) group by session_id) counts));
 result:=result||jsonb_build_object('session_participants',(select coalesce(jsonb_agg(case when plat or a and s.store_id=p_store or p_role='dm' and s.dm_id=u and s.store_id=p_store or p_role='player' and p.user_id=u then to_jsonb(p) else jsonb_build_object('id',p.id,'session_id',p.session_id,'user_id',null) end),'[]'::jsonb) from public.session_participants p join public.sessions s on s.id=p.session_id where plat or a and s.store_id=p_store or p_role='dm' and s.dm_id=u and s.store_id=p_store or p_role='player' and (p.user_id=u or s.type='recruitment' and s.status='recruiting')));
 result:=result||jsonb_build_object('session_payments',(select coalesce(jsonb_agg(to_jsonb(x)),'[]'::jsonb) from public.session_payments x join public.sessions s on s.id=x.session_id join public.session_participants p on p.id=x.participant_id where plat or a and s.store_id=p_store or p_role='dm' and s.dm_id=u and s.store_id=p_store or p_role='player' and p.user_id=u));
 foreach t in array array['store_customers','balance_transactions'] loop
 execute format('select coalesce(jsonb_agg(to_jsonb(x)),''[]''::jsonb) from public.%I x where $1 or $2 and store_id=$3 or $4=''player'' and user_id=$5',t) into rows using plat,a,p_store,p_role,u;result:=result||jsonb_build_object(t,rows);
 end loop;
 foreach t in array array['commission_rules','commission_records','wage_adjustments'] loop
 execute format('select coalesce(jsonb_agg(to_jsonb(x)),''[]''::jsonb) from public.%I x where $1 or $2 and store_id=$3 or $4=''dm'' and dm_id=$5 and store_id=$3',t) into rows using plat,a,p_store,p_role,u;result:=result||jsonb_build_object(t,rows);
 end loop;
 result:=result||jsonb_build_object('recruitment_applications',(select coalesce(jsonb_agg(to_jsonb(x)),'[]'::jsonb) from public.recruitment_applications x join public.sessions s on s.id=x.session_id where plat or a and s.store_id=p_store or x.user_id=u));
 result:=result||jsonb_build_object('audit_logs',(select coalesce(jsonb_agg(to_jsonb(x)),'[]'::jsonb) from public.audit_logs x where plat or a and store_id=p_store));
 result:=result||jsonb_build_object('posts',(select coalesce(jsonb_agg(to_jsonb(x)),'[]'::jsonb) from public.posts x where plat or not hidden));
 result:=result||jsonb_build_object('comments',(select coalesce(jsonb_agg(to_jsonb(x)),'[]'::jsonb) from public.comments x join public.posts p on p.id=x.post_id where plat or not p.hidden));
 result:=result||jsonb_build_object('favorites',(select coalesce(jsonb_agg(to_jsonb(x)),'[]'::jsonb) from public.favorites x where plat or user_id=u));
 result:=result||jsonb_build_object('likes',(select coalesce(jsonb_agg(to_jsonb(x)),'[]'::jsonb) from public.likes x));
 result:=result||jsonb_build_object('reports',(select coalesce(jsonb_agg(to_jsonb(x)),'[]'::jsonb) from public.reports x where plat));
 result:=result||jsonb_build_object('dm_counts',(select coalesce(jsonb_object_agg(dm_id,n),'{}'::jsonb) from (select dm_id,count(*) n from public.sessions where status='completed' group by dm_id) q));
 return result;
end$$;

create function public.demo_command(p_role text,p_store text,p_action text,p_payload jsonb) returns void language plpgsql security definer set search_path='' as $$
declare p jsonb:=p_payload;u text:=app_private.actor();s public.sessions%rowtype;r public.session_participants%rowtype;rule public.commission_rules%rowtype;application public.recruitment_applications%rowtype;post public.posts%rowtype;before_row jsonb;line jsonb;pay jsonb;amount bigint;delta bigint;revenue bigint:=0;cnt integer;sid text;tid text;target text;ids text[];is_admin boolean;
begin
 perform app_private.check_role(p_role,p_store);
 -- A small demo uses one transaction lock to serialize cross-account writes.
 -- Session and balance row locks also protect against direct SQL maintenance.
 perform pg_advisory_xact_lock(20261004);
 is_admin:=p_role in ('admin','platform') and app_private.admin(p_store);
 if p_action in ('customer','balance','player','player_update','session','rule','dm_permission','wage','store_script') then perform app_private.assert(p->>'store_id'=p_store,'门店不匹配');end if;
 if p_action in ('customer','balance','player','player_update','rule','dm_permission','wage','store_script','store') then perform app_private.assert(is_admin,'仅本店管理员可执行');end if;
 if p_action in ('participant','settle','void','session_status','session_update','apply') then
 select * into s from public.sessions where id=p->>'session_id' for update;perform app_private.assert(s.id is not null,'场次不存在');
 if p_action<>'apply' then perform app_private.assert((is_admin and s.store_id=p_store) or p_role='dm' and s.dm_id=u and s.store_id=p_store and p_action in ('participant','session_status','session_update'),'无权操作该场次');end if;
 end if;
 case p_action
 when 'customer' then
 perform app_private.assert(jsonb_typeof(p->'is_member')='boolean','会员状态必须为布尔值');
 perform app_private.customer(p_store,p->>'user_id');select to_jsonb(c) into before_row from public.store_customers c where store_id=p_store and user_id=p->>'user_id';
 perform app_private.assert(not (p->>'is_member')::boolean or nullif(p->>'expires_on','') is not null,'填写会员到期日期');
 update public.store_customers set is_member=(p->>'is_member')::boolean,expires_on=nullif(p->>'expires_on','')::date,updated_at=now() where store_id=p_store and user_id=p->>'user_id' returning id into tid;
 perform app_private.audit(p_store,'修改会员','store_customers',tid,before_row,(select to_jsonb(x) from public.store_customers x where id=tid));
 when 'balance' then
 amount:=(p->>'amount')::bigint;perform app_private.assert(amount between 1 and 100000000 and length(trim(p->>'note'))>0,'金额或备注无效');
 perform app_private.assert(p->>'payment_method'<>'balance' or p->>'type'='consume','余额不能作为充值支付方式');
 perform app_private.assert(p->>'type'<>'correction' or p->>'direction' in ('plus','minus'),'请选择后台修正方向');
 delta:=case when p->>'type'='consume' or p->>'type'='correction' and p->>'direction'='minus' then -amount else amount end;
 select to_jsonb(x) into before_row from public.store_customers x where store_id=p_store and user_id=p->>'user_id';
 perform app_private.ledger(p_store,p->>'user_id',delta,p->>'type',p->>'note',p->>'payment_method');
 select id into tid from public.store_customers where store_id=p_store and user_id=p->>'user_id';perform app_private.audit(p_store,'余额操作','store_customers',tid,before_row,(select to_jsonb(x) from public.store_customers x where id=tid));
 when 'player' then
 perform app_private.assert(length(trim(p->>'nickname'))>0,'昵称不能为空');insert into public.users(nickname,phone,wechat) values(p->>'nickname',coalesce(p->>'phone',''),coalesce(p->>'wechat','')) returning id into tid;perform app_private.customer(p_store,tid);
 when 'player_update' then
 perform app_private.assert(exists(select 1 from public.store_customers where store_id=p_store and user_id=p->>'user_id'),'玩家不属于本店');
 perform app_private.assert(length(trim(p->>'nickname'))>0,'昵称不能为空');
 perform app_private.assert((not (p?'phone') or jsonb_typeof(p->'phone')='string') and (not (p?'wechat') or jsonb_typeof(p->'wechat')='string'),'联系方式无效');
 select to_jsonb(x)-'auth_id'-'is_platform' into before_row from public.users x where id=p->>'user_id';
 update public.users set nickname=trim(p->>'nickname'),phone=coalesce(p->>'phone',phone),wechat=coalesce(p->>'wechat',wechat),updated_at=now() where id=p->>'user_id';
 perform app_private.audit(p_store,'修改玩家资料','users',p->>'user_id',before_row,(select to_jsonb(x)-'auth_id'-'is_platform' from public.users x where id=p->>'user_id'));
 when 'session' then
 perform app_private.assert(is_admin or p_role='dm','无权创建');target:=case when p_role='dm' then u else p->>'dm_id' end;
 perform app_private.assert(p_role<>'dm' or nullif(p->>'dm_id','') is null or p->>'dm_id'=u,'DM只能录入自己的场次');
 perform app_private.assert((not (p?'status') or p->>'status' in ('draft','active','confirmed','recruiting')) and (p->>'status' is distinct from 'recruiting' or p->>'type'='recruitment'),'场次状态无效');
 perform app_private.assert(exists(select 1 from public.store_members where store_id=p_store and user_id=target and role='dm' and active),'DM无效');
 perform app_private.assert(exists(select 1 from public.store_scripts where store_id=p_store and script_id=p->>'script_id' and target=any(dm_ids)),'DM没有该剧本开本权限');
 perform app_private.assert(not exists(select 1 from public.sessions where dm_id=target and date=(p->>'date')::date and time=(p->>'time')::time and status in ('draft','recruiting','confirmed')),'DM在该时间已有待开场次');
 insert into public.sessions(store_id,script_id,dm_id,date,time,expected,price,type,status,note) values(p_store,p->>'script_id',target,(p->>'date')::date,(p->>'time')::time,(p->>'expected')::integer,(p->>'price')::bigint,p->>'type',case when p->>'status'='draft' then 'draft' when p->>'type'='recruitment' then 'recruiting' else 'confirmed' end,coalesce(p->>'note',''));
 when 'session_update' then
 perform app_private.assert(s.status in ('draft','confirmed','recruiting') and not exists(select 1 from public.session_payments where session_id=s.id) and not exists(select 1 from public.commission_records where session_id=s.id),'已有财务记录或场次不可编辑');
 target:=case when p_role='dm' then u else p->>'dm_id' end;
 perform app_private.assert(p_role<>'dm' or nullif(p->>'dm_id','') is null or p->>'dm_id'=u,'DM只能录入自己的场次');
 perform app_private.assert(exists(select 1 from public.store_members where store_id=s.store_id and user_id=target and role='dm' and active),'DM无效');
 perform app_private.assert(exists(select 1 from public.store_scripts where store_id=s.store_id and script_id=p->>'script_id' and target=any(dm_ids)),'DM没有该剧本开本权限');
 perform app_private.assert((p->>'expected')::integer>=(select count(*) from public.session_participants where session_id=s.id),'预计人数不能少于现有玩家');
 perform app_private.assert(s.type<>'recruitment' or p->>'type'='recruitment' or not exists(select 1 from public.recruitment_applications where session_id=s.id and status='pending'),'仍有待处理报名，不能改为普通场次');
 perform app_private.assert((not (p?'status') or p->>'status' in ('draft','active','confirmed','recruiting')) and (p->>'status' is distinct from 'recruiting' or p->>'type'='recruitment'),'场次状态无效');
 sid:=case when p->>'status'='draft' or not (p?'status') and s.status='draft' then 'draft' when p->>'type'='recruitment' then 'recruiting' else 'confirmed' end;
 perform app_private.assert(not exists(select 1 from public.sessions where id<>s.id and dm_id=target and date=(p->>'date')::date and time=(p->>'time')::time and status in ('draft','recruiting','confirmed')),'DM在该时间已有待开场次');
 update public.sessions set script_id=p->>'script_id',dm_id=target,date=(p->>'date')::date,time=(p->>'time')::time,expected=(p->>'expected')::integer,price=(p->>'price')::bigint,type=p->>'type',status=sid,note=coalesce(p->>'note',''),updated_at=now() where id=s.id;
 perform app_private.audit(s.store_id,'修改场次','sessions',s.id,to_jsonb(s),(select to_jsonb(x) from public.sessions x where id=s.id));
 when 'participant' then
 perform app_private.assert(s.status in ('draft','confirmed','recruiting'),'场次不能添加玩家');perform app_private.assert((select count(*) from public.session_participants where session_id=s.id)<s.expected,'场次已满');perform app_private.customer(s.store_id,p->>'user_id');insert into public.session_participants(session_id,user_id,due,note) values(s.id,p->>'user_id',(p->>'due')::bigint,coalesce(p->>'note',''));
 when 'settle' then
 perform app_private.assert(s.status in ('confirmed','recruiting'),'只能结算有效未完成场次');select count(*) into cnt from public.session_participants where session_id=s.id;
 perform app_private.assert(cnt>0 and jsonb_array_length(p->'rows')=cnt,'玩家结算数据不完整');
 select array_agg(x->>'id') into ids from jsonb_array_elements(p->'rows') x;perform app_private.assert((select count(distinct x) from unnest(ids) x)=cnt,'玩家结算数据重复');
 for r in select * from public.session_participants where session_id=s.id order by id for update loop
 select x into line from jsonb_array_elements(p->'rows') x where x->>'id'=r.id;perform app_private.assert(line is not null,'玩家结算数据缺失');
 perform app_private.assert((line->>'actual')::bigint>=0 and (line->>'discount')::bigint>=0 and (line->>'actual')::bigint+(line->>'discount')::bigint=r.due,'消费与优惠之和不等于应收');
 perform app_private.assert((line->>'discount')::bigint=0 or length(trim(line->>'note'))>0,'填写优惠原因');
 perform app_private.assert((select coalesce(sum((x->>'amount')::bigint),0) from jsonb_array_elements(line->'payments') x)=(line->>'actual')::bigint,'组合支付不匹配');
 for pay in select * from jsonb_array_elements(line->'payments') loop
 amount:=(pay->>'amount')::bigint;perform app_private.assert(amount between 0 and 100000000 and pay->>'method' in ('wechat','alipay','cash','balance','other'),'支付记录无效');
 if amount>0 then insert into public.session_payments(session_id,participant_id,method,amount) values(s.id,r.id,pay->>'method',amount);if pay->>'method'='balance' then perform app_private.ledger(s.store_id,r.user_id,-amount,'consume','场次消费','balance',s.id);end if;end if;
 end loop;
 update public.session_participants set actual=(line->>'actual')::bigint,discount=(line->>'discount')::bigint,note=coalesce(line->>'note',''),updated_at=now() where id=r.id;revenue:=revenue+(line->>'actual')::bigint;
 end loop;
 select * into rule from public.commission_rules where store_id=s.store_id and dm_id=s.dm_id;perform app_private.assert(rule.id is not null,'请设置提成规则');
 amount:=case rule.kind when 'fixed' then rule.amount when 'per_player' then rule.amount*cnt when 'percent' then floor(revenue::numeric*rule.rate/10000)::bigint when 'bonus' then rule.amount+greatest(0,cnt-rule.threshold)*rule.extra end;
 insert into public.commission_records(session_id,store_id,dm_id,amount,snapshot) values(s.id,s.store_id,s.dm_id,amount,to_jsonb(rule));before_row:=to_jsonb(s);update public.sessions set status='completed',completed_at=now(),updated_at=now() where id=s.id;perform app_private.audit(s.store_id,'完成场次','sessions',s.id,before_row,(select to_jsonb(x) from public.sessions x where id=s.id));
 when 'void' then
 perform app_private.assert(s.status='completed' and length(trim(p->>'reason'))>0,'仅已完成场次可作废，原因必填');
 for line in select to_jsonb(x) from public.balance_transactions x where session_id=s.id and type='consume' order by user_id loop
 perform app_private.ledger(s.store_id,line->>'user_id',-(line->>'delta')::bigint,'refund','场次作废退回：'||(p->>'reason'),'balance',s.id);end loop;
 update public.commission_records set voided=true where session_id=s.id;update public.sessions set status='voided',void_reason=p->>'reason',updated_at=now() where id=s.id;perform app_private.audit(s.store_id,'作废场次','sessions',s.id,to_jsonb(s),(select to_jsonb(x) from public.sessions x where id=s.id));
 when 'session_status' then
 perform app_private.assert(s.status not in ('completed','voided','cancelled') and not exists(select 1 from public.session_payments where session_id=s.id) and not exists(select 1 from public.commission_records where session_id=s.id),'已有财务记录或已取消');
 if p->>'status'='delete' then perform app_private.assert(s.status='draft','只能删除草稿');delete from public.recruitment_applications where session_id=s.id;delete from public.session_participants where session_id=s.id;delete from public.sessions where id=s.id;
 else
 perform app_private.assert(p->>'status' in ('cancelled','confirmed','recruiting') and (p->>'status'<>'recruiting' or s.type='recruitment'),'状态无效');
 if p->>'status'<>'cancelled' then
 perform app_private.assert(exists(select 1 from public.store_members where store_id=s.store_id and user_id=s.dm_id and role='dm' and active),'DM无效');
 perform app_private.assert(exists(select 1 from public.store_scripts where store_id=s.store_id and script_id=s.script_id and s.dm_id=any(dm_ids)),'DM没有该剧本开本权限');end if;
 update public.sessions set status=p->>'status',updated_at=now() where id=s.id;end if;
 when 'apply' then
 perform app_private.assert(p_role='player' and s.status='recruiting','此场次不能报名');perform app_private.assert(length(trim(p->>'nickname'))>0,'昵称不能为空');perform app_private.assert((select count(*) from public.session_participants where session_id=s.id)<s.expected,'场次已满');perform app_private.assert(not exists(select 1 from public.session_participants where session_id=s.id and user_id=u),'已经上车');
 insert into public.recruitment_applications(session_id,user_id,nickname,phone,wechat,note) values(s.id,u,p->>'nickname',coalesce(p->>'phone',''),coalesce(p->>'wechat',''),coalesce(p->>'note',''));
 when 'confirm_application' then
 select * into application from public.recruitment_applications where id=p->>'id' for update;select * into s from public.sessions where id=application.session_id for update;
 perform app_private.assert(is_admin and s.store_id=p_store and application.status='pending' and s.status='recruiting','无权处理或报名已处理');
 if coalesce((p->>'reject')::boolean,false) then update public.recruitment_applications set status='rejected',updated_at=now() where id=application.id;else perform app_private.assert((select count(*) from public.session_participants where session_id=s.id)<s.expected,'场次已满');perform app_private.customer(s.store_id,application.user_id);insert into public.session_participants(session_id,user_id,due,note) values(s.id,application.user_id,s.price,application.note);update public.recruitment_applications set status='confirmed',updated_at=now() where id=application.id;end if;
 when 'rule' then
 perform app_private.assert(exists(select 1 from public.store_members where store_id=p_store and user_id=p->>'dm_id' and role='dm'),'DM无效');select to_jsonb(x) into before_row from public.commission_rules x where store_id=p_store and dm_id=p->>'dm_id';
 insert into public.commission_rules(store_id,dm_id,kind,amount,rate,threshold,extra) values(p_store,p->>'dm_id',p->>'kind',(p->>'amount')::bigint,(p->>'rate')::integer,(p->>'threshold')::integer,(p->>'extra')::bigint) on conflict(store_id,dm_id) do update set kind=excluded.kind,amount=excluded.amount,rate=excluded.rate,threshold=excluded.threshold,extra=excluded.extra,updated_at=now() returning id into tid;perform app_private.audit(p_store,'修改提成规则','commission_rules',tid,before_row,(select to_jsonb(x) from public.commission_rules x where id=tid));
 when 'dm_permission' then
 perform app_private.assert(jsonb_typeof(p->'active')='boolean','DM权限值必须为布尔值');
 select to_jsonb(x) into before_row from public.store_members x where id=p->>'id' and store_id=p_store and role='dm';perform app_private.assert(before_row is not null,'DM不属于本店');update public.store_members set active=(p->>'active')::boolean,updated_at=now() where id=p->>'id';perform app_private.audit(p_store,'修改DM权限','store_members',p->>'id',before_row,(select to_jsonb(x) from public.store_members x where id=p->>'id'));
 when 'wage' then
 perform app_private.assert(length(trim(p->>'note'))>0 and exists(select 1 from public.store_members where store_id=p_store and user_id=p->>'dm_id' and role='dm'),'原因或DM无效');insert into public.wage_adjustments(store_id,dm_id,operator_id,month,type,amount,note) values(p_store,p->>'dm_id',u,p->>'month',p->>'type',(p->>'amount')::bigint,p->>'note');
 when 'store_script' then
 select coalesce(array_agg(value),'{}'::text[]) into ids from jsonb_array_elements_text(p->'dm_ids');perform app_private.assert(not exists(select 1 from unnest(ids) id where not exists(select 1 from public.store_members where user_id=id and store_id=p_store and role='dm')),'DM不属于本店');
 insert into public.store_scripts(store_id,script_id,price,dm_ids,visible,is_new) values(p_store,p->>'script_id',(p->>'price')::bigint,ids,(p->>'visible')::boolean,(p->>'is_new')::boolean) on conflict(store_id,script_id) do update set price=excluded.price,dm_ids=excluded.dm_ids,visible=excluded.visible,is_new=excluded.is_new,updated_at=now();
 when 'store' then
 perform app_private.assert(p->>'id'=p_store,'门店不匹配');update public.stores set name=p->>'name',address=p->>'address',hours=p->>'hours',phone=p->>'phone',intro=p->>'intro',environment=p->>'environment',rooms=p->>'rooms',activity=p->>'activity',updated_at=now() where id=p_store;
 when 'post' then
 perform app_private.assert(p->>'body' !~ '(人肉|身份证|家庭住址)','请移除隐私信息');insert into public.posts(user_id,store_id,title,body,type) values(u,nullif(p->>'store_id',''),p->>'title',p->>'body',p->>'type');
 when 'comment' then
 select * into post from public.posts where id=p->>'post_id';perform app_private.assert(post.id is not null and not post.hidden,'帖子已下架');perform app_private.assert(not coalesce((p->>'official')::boolean,false) or is_admin and post.store_id=p_store,'无权官方回复');insert into public.comments(post_id,user_id,body,official) values(post.id,u,p->>'body',coalesce((p->>'official')::boolean,false));
 when 'favorite' then
 target:=p->>'target_type';tid:=p->>'target_id';perform app_private.assert(target in ('post','script'),'收藏类型无效');
 if target='post' then perform app_private.assert(exists(select 1 from public.posts where id=tid and not hidden),'帖子不存在');else perform app_private.assert(exists(select 1 from public.scripts where id=tid),'剧本不存在');end if;
 if exists(select 1 from public.favorites where user_id=u and target_id=tid and target_type=target) then delete from public.favorites where user_id=u and target_id=tid and target_type=target;else insert into public.favorites(user_id,target_type,target_id,post_id,script_id) values(u,target,tid,case when target='post' then tid end,case when target='script' then tid end);end if;
 when 'like' then
 tid:=p->>'target_id';perform app_private.assert(exists(select 1 from public.posts where id=tid and not hidden),'帖子不存在');if exists(select 1 from public.likes where user_id=u and target_id=tid) then delete from public.likes where user_id=u and target_id=tid;else insert into public.likes(user_id,target_id) values(u,tid);end if;
 when 'report' then
 perform app_private.assert(length(trim(p->>'reason'))>0,'举报原因不能为空');insert into public.reports(user_id,post_id,reason) values(u,p->>'post_id',p->>'reason');
 when 'moderate' then
 perform app_private.assert(p_role='platform' and app_private.platform(),'仅平台可处理');select to_jsonb(x) into before_row from public.reports x where id=p->>'id' and status='pending';perform app_private.assert(before_row is not null,'举报已处理');if (p->>'hide')::boolean then update public.posts set hidden=true,updated_at=now() where id=before_row->>'post_id';end if;update public.reports set status=case when (p->>'hide')::boolean then 'removed' else 'dismissed' end,updated_at=now() where id=p->>'id';perform app_private.audit(null,'处理举报','reports',p->>'id',before_row,(select to_jsonb(x) from public.reports x where id=p->>'id'));
 when 'merchant' then
 perform app_private.assert(p_role='platform' and app_private.platform(),'仅平台可修改订阅');update public.merchants set expires_on=(p->>'expires_on')::date,status=p->>'status',updated_at=now() where id=p->>'id';
 else raise exception '不支持的操作';
 end case;
end$$;
-- Functions otherwise default to executable by PUBLIC: explicitly restrict them.
revoke all on all functions in schema app_private from public,anon,authenticated;
revoke all on function public.demo_read(text,text) from public,anon;
revoke all on function public.demo_command(text,text,text,jsonb) from public,anon;
grant execute on function public.demo_read(text,text) to authenticated;
grant execute on function public.demo_command(text,text,text,jsonb) to authenticated;
commit;
