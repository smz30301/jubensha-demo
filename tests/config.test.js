import test from 'node:test';
import assert from 'node:assert/strict';
import {config,createConfig,normalizeConfig} from '../config.js';

const key='sb_publishable_fictional_config_key_not_real';
const env={VITE_SUPABASE_URL:'https://fictional-project.example.invalid/',VITE_SUPABASE_PUBLISHABLE_KEY:key};

test('原生Node没有Vite环境时仍可导入配置并默认为Demo',()=>{
  assert.equal(import.meta.env,undefined);
  assert.equal(config.SUPABASE_URL,'');assert.equal(config.SUPABASE_PUBLISHABLE_KEY,'');
  assert.ok(Object.isFrozen(config));
});

test('环境变量映射保留Publishable主字段及兼容别名并规范空白',()=>{
  const selected=createConfig({...env,VITE_SUPABASE_PUBLISHABLE_KEY:'  '+key+'  '});
  assert.equal(selected.SUPABASE_URL,env.VITE_SUPABASE_URL.slice(0,-1));
  assert.equal(selected.SUPABASE_PUBLISHABLE_KEY,key);assert.equal(selected.SUPABASE_ANON_KEY,key);
  assert.ok(Object.isFrozen(selected));
});

test('全空Demo与部分配置错误具有明确区别',()=>{
  assert.equal(createConfig({VITE_SUPABASE_URL:' ',VITE_SUPABASE_PUBLISHABLE_KEY:' '}).SUPABASE_URL,'');
  for(const environment of [{VITE_SUPABASE_URL:env.VITE_SUPABASE_URL},{VITE_SUPABASE_PUBLISHABLE_KEY:key}])assert.throws(()=>createConfig(environment),/配置不完整/);
});

test('旧变量只能使用Publishable且重复配置冲突明确失败',()=>{
  assert.equal(createConfig({VITE_SUPABASE_URL:env.VITE_SUPABASE_URL,VITE_SUPABASE_ANON_KEY:key}).SUPABASE_PUBLISHABLE_KEY,key);
  assert.equal(createConfig({...env,VITE_SUPABASE_ANON_KEY:key}).SUPABASE_PUBLISHABLE_KEY,key);
  assert.throws(()=>createConfig({...env,VITE_SUPABASE_ANON_KEY:'sb_publishable_fictional_different_key'}),/配置冲突/);
  assert.throws(()=>createConfig({VITE_SUPABASE_URL:env.VITE_SUPABASE_URL,VITE_SUPABASE_ANON_KEY:'fictional-legacy-anon-jwt'}),/只允许Supabase Publishable Key/);
});

test('未知VITE变量在构建入口被拒绝且错误不包含其值',()=>{
  const hidden='fictional-sensitive-test-value-never-real';
  let error;
  try{createConfig({...env,VITE_UNAPPROVED_VALUE:hidden});}catch(caught){error=caught;}
  assert.match(error?.message||'',/未知VITE_/);assert.equal(error.message.includes(hidden),false);
  assert.equal(createConfig({...env,SERVER_ONLY_SECRET:hidden}).SUPABASE_PUBLISHABLE_KEY,key);
});

test('Vercel精确公开metadata可通过校验但不会进入应用配置',()=>{
  const metadata={
    VITE_VERCEL_ENV:'preview',VITE_VERCEL_TARGET_ENV:'preview',VITE_VERCEL_URL:'fictional-preview.example.invalid',VITE_VERCEL_BRANCH_URL:'fictional-branch.example.invalid',VITE_VERCEL_PROJECT_PRODUCTION_URL:'fictional-production.example.invalid',VITE_VERCEL_HASH_SALT:'12345',
    VITE_VERCEL_GIT_PROVIDER:'github',VITE_VERCEL_GIT_REPO_SLUG:'fictional-repo',VITE_VERCEL_GIT_REPO_OWNER:'fictional-owner',VITE_VERCEL_GIT_REPO_ID:'12345',VITE_VERCEL_GIT_COMMIT_REF:'fictional-branch',VITE_VERCEL_GIT_COMMIT_SHA:'fictional-commit',
    VITE_VERCEL_GIT_COMMIT_MESSAGE:'fictional commit message',VITE_VERCEL_GIT_COMMIT_AUTHOR_LOGIN:'fictional-author',VITE_VERCEL_GIT_COMMIT_AUTHOR_NAME:'fictional-author',VITE_VERCEL_GIT_PULL_REQUEST_ID:'123',
  };
  assert.deepEqual(createConfig({...env,...metadata}),createConfig(env));
  assert.equal(createConfig(metadata).SUPABASE_URL,'');
  assert.throws(()=>createConfig({...env,VITE_VERCEL_SECRET_KEY:'fictional-forbidden-value'}),/未知VITE_/);
  assert.throws(()=>createConfig({...env,VITE_SUPABASE_SERVICE_ROLE:'fictional-forbidden-value'}),/未知VITE_/);
});

test('Secret和两种JWT在嵌入前拒绝，错误不回显输入',()=>{
  const forbidden=['sb_secret_fictional_config_key_not_real',...['anon','service_role'].map(role=>'e30.'+Buffer.from(JSON.stringify({role})).toString('base64url')+'.fictional-signature')];
  for(const bad of forbidden){let error;try{createConfig({...env,VITE_SUPABASE_PUBLISHABLE_KEY:bad});}catch(caught){error=caught;}assert.match(error?.message||'',/只允许Supabase Publishable Key/);assert.equal(error.message.includes(bad),false);}
});

test('正式配置必须HTTPS且URL不能携带账户或查询参数',()=>{
  const local={...env,VITE_SUPABASE_URL:'http://127.0.0.1:54321'};
  assert.ok(createConfig(local).SUPABASE_URL.startsWith('http://'));
  assert.throws(()=>createConfig(local,{production:true}),/必须使用HTTPS/);
  for(const url of ['ftp://fictional-project.example.invalid','https://fictional-user:fictional-password@fictional-project.example.invalid','https://fictional-project.example.invalid?fictional=value','https://fictional-project.example.invalid#fictional'])assert.throws(()=>createConfig({...env,VITE_SUPABASE_URL:url}),/账号、查询参数或片段/);
  assert.throws(()=>createConfig({...env,VITE_SUPABASE_URL:'invalid-url'}),/格式无效/);
});

test('配置输入类型校验与API规范器沿用同一Publishable白名单',()=>{
  assert.throws(()=>createConfig({...env,VITE_SUPABASE_PUBLISHABLE_KEY:123}),/必须为字符串/);
  assert.equal(normalizeConfig({SUPABASE_URL:env.VITE_SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY:key}).SUPABASE_PUBLISHABLE_KEY,key);
  assert.throws(()=>normalizeConfig({SUPABASE_URL:env.VITE_SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY:'fictional-untyped-key'}),/只允许Supabase Publishable Key/);
});
