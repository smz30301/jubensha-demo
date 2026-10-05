import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {cloudIdentity} from '../js/auth.js';

const source=await readFile(new URL('../js/api.js',import.meta.url),'utf8');
const publicConfig={SUPABASE_URL:'https://fictional-project.example.invalid',SUPABASE_PUBLISHABLE_KEY:'sb_publishable_fictional_client_key_not_real'};
const session={access_token:'fictional-access-token',refresh_token:'fictional-refresh-token',expires_in:3600,user:{id:'fictional-auth-user'}};
const admin={role:'admin',store_id:'fictional-store'};
let fixtureId=0;
const originalGlobals=new WeakMap();

function response(status,data){return {status,ok:status>=200&&status<300,text:async()=>data===undefined?'':JSON.stringify(data)};}
function memory(){
  const values=new Map();
  return {getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,String(value)),removeItem:key=>values.delete(key),values};
}
async function fixture(t,config=publicConfig){
  if(!originalGlobals.has(t)){
    const previous={sessionStorage:globalThis.sessionStorage,localStorage:globalThis.localStorage};originalGlobals.set(t,previous);
    t.after(()=>{for(const [key,value] of Object.entries(previous)){if(value===undefined)delete globalThis[key];else globalThis[key]=value;}originalGlobals.delete(t);});
  }
  const storage=memory();globalThis.sessionStorage=storage;globalThis.localStorage=memory();
  t.mock.method(globalThis,'fetch',async()=>{throw new Error('API测试禁止真实网络请求');});
  const configImport="import {config,normalizeConfig} from '../config.js';",storeImport="import {DemoStore} from './store.js';";
  assert.ok(source.includes(configImport)&&source.includes(storeImport),'API导入结构已变化，需要更新测试隔离入口');
  // Node has no Vite environment; only the pure validator is imported and runtime values are fictional.
  const configUrl='data:text/javascript;base64,'+Buffer.from(`export {normalizeConfig} from '${new URL('../config.js',import.meta.url).href}';export const config=`+JSON.stringify(config)+';').toString('base64');
  const isolated=source.replace(configImport,`import {config,normalizeConfig} from '${configUrl}';`).replace(storeImport,`import {DemoStore} from '${new URL('../js/store.js',import.meta.url).href}';`)+`\n//# sourceURL=api-test-fixture-${++fixtureId}.js\n`;
  const module=await import('data:text/javascript;base64,'+Buffer.from(isolated).toString('base64'));
  return {...module,store:new module.CloudStore(),storage};
}
async function signedIn(t){
  const f=await fixture(t);f.store.saveSession(session);return f;
}

test('密码登录发送必要字段并保存会话，不打印密码或令牌',async t=>{
  const {store,storage}=await fixture(t),logged=[];
  for(const method of ['log','warn','error'])t.mock.method(console,method,(...args)=>logged.push(args));
  let sent;
  t.mock.method(globalThis,'fetch',async(url,options)=>{sent={url,options};return response(200,session);});
  const user=await store.login('fictional-user@example.invalid','fictional-demo-password');
  assert.equal(user.id,session.user.id);
  assert.ok(sent.url.endsWith('/auth/v1/token?grant_type=password'));
  assert.deepEqual(JSON.parse(sent.options.body),{email:'fictional-user@example.invalid',password:'fictional-demo-password'});
  assert.equal(sent.options.headers.apikey,publicConfig.SUPABASE_PUBLISHABLE_KEY);
  assert.equal(sent.options.headers.Authorization,undefined);
  assert.equal(JSON.parse(storage.getItem('script-auth-session')).access_token,session.access_token);
  assert.equal(logged.length,0);
  store.logout();assert.equal(storage.values.size,0);
});

test('401仅刷新一次并使用新身份令牌重试原RPC',async t=>{
  const {store}=await signedIn(t);let calls=0,refreshes=0;const headers=[];
  t.mock.method(globalThis,'fetch',async(url,options)=>{
    if(url.includes('grant_type=refresh_token')){refreshes++;assert.deepEqual(JSON.parse(options.body),{refresh_token:session.refresh_token});return response(200,{...session,access_token:'fictional-renewed-access',refresh_token:'fictional-renewed-refresh'});}
    calls++;headers.push(options.headers.Authorization);return calls===1?response(401,{message:'expired'}):response(200,{current_user_id:'fictional-player'});
  });
  assert.equal((await store.load()).current_user_id,'fictional-player');
  assert.equal(refreshes,1);assert.equal(calls,2);
  assert.deepEqual(headers,['Bearer '+session.access_token,'Bearer fictional-renewed-access']);
});

test('刷新后仍返回401时停止重试',async t=>{
  const {store}=await signedIn(t);let calls=0,refreshes=0;
  t.mock.method(globalThis,'fetch',async url=>{if(url.includes('grant_type=refresh_token')){refreshes++;return response(200,session);}calls++;return response(401,{message:'expired'});});
  await assert.rejects(()=>store.load(),/登录已过期/);
  assert.equal(refreshes,1);assert.equal(calls,2);
});

test('并发请求共享一次到期会话刷新',async t=>{
  const {store}=await signedIn(t);store.session.expires_at=1;let refreshes=0,reads=0;
  t.mock.method(globalThis,'fetch',async url=>{if(url.includes('grant_type=refresh_token')){refreshes++;await new Promise(resolve=>setTimeout(resolve,2));return response(200,session);}reads++;return response(200,{});});
  await Promise.all([store.load(),store.load()]);
  assert.equal(refreshes,1);assert.equal(reads,2);
});

test('只接受Publishable Key并拒绝Secret、Service Role及Anon JWT',async t=>{
  const {store}=await fixture(t);assert.equal(store.configuration().key,publicConfig.SUPABASE_PUBLISHABLE_KEY);
  for(const forbidden of ['sb_secret_fictional_test_key_not_real',...['service_role','anon'].map(role=>'e30.'+Buffer.from(JSON.stringify({role})).toString('base64url')+'.fictional-signature')]){
    const f=await fixture(t,{...publicConfig,SUPABASE_PUBLISHABLE_KEY:forbidden});
    assert.throws(()=>f.store.configuration(),/只允许Supabase Publishable Key/);
  }
  const alias=await fixture(t,{SUPABASE_URL:publicConfig.SUPABASE_URL,SUPABASE_ANON_KEY:publicConfig.SUPABASE_PUBLISHABLE_KEY});
  assert.equal(alias.store.configuration().key,publicConfig.SUPABASE_PUBLISHABLE_KEY);
});

test('网络失败及数据库失败均不重复发送财务写入',async t=>{
  const {store}=await signedIn(t);let writes=0;
  t.mock.method(globalThis,'fetch',async()=>{writes++;throw new Error('fictional network unavailable');});
  await assert.rejects(()=>store.command(admin,'balance',{}),/network unavailable/);assert.equal(writes,1);
  writes=0;t.mock.method(globalThis,'fetch',async()=>{writes++;return response(500,{message:'fictional transaction failed'});});
  await assert.rejects(()=>store.command(admin,'settle',{}),/transaction failed/);assert.equal(writes,1);
});

test('RPC成功但响应正文为空时正常返回null',async t=>{
  const {store}=await signedIn(t);t.mock.method(globalThis,'fetch',async()=>response(204));
  assert.equal(await store.command(admin,'balance',{}),null);
});

test('云端上下文只能选择数据库授予的角色及门店',()=>{
  const data={current_user_id:'fictional-business-user',available_contexts:[{role:'player',store_id:null},{role:'dm',store_id:'fictional-store-2'},{role:'admin',store_id:'fictional-store-3'}]};
  assert.deepEqual(cloudIdentity(data,'player'),{role:'player',store_id:null,user_id:data.current_user_id});
  assert.equal(cloudIdentity(data,'dm','fictional-store-2').store_id,'fictional-store-2');
  assert.throws(()=>cloudIdentity(data,'dm','fictional-store-3'),/没有该身份或门店权限/);
  assert.throws(()=>cloudIdentity(data,'platform'),/没有该身份或门店权限/);
});

test('部分云配置明确报错，只有两个配置均空才使用本地模式',async t=>{
  for(const config of [{...publicConfig,SUPABASE_PUBLISHABLE_KEY:''},{...publicConfig,SUPABASE_URL:''}]){
    const f=await fixture(t,config);assert.equal(f.cloud,true);assert.ok(f.api instanceof f.CloudStore);
    await assert.rejects(()=>f.store.load(),/数据库配置不完整/);
  }
  const local=await fixture(t,{SUPABASE_URL:'',SUPABASE_PUBLISHABLE_KEY:''});
  assert.equal(local.cloud,false);assert.equal(local.api instanceof local.CloudStore,false);
});
