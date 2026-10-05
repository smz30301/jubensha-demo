export const clientEnvNames=Object.freeze(['VITE_SUPABASE_URL','VITE_SUPABASE_PUBLISHABLE_KEY','VITE_SUPABASE_ANON_KEY']);
const vercelPublicEnvNames=Object.freeze([
  'VITE_VERCEL_ENV','VITE_VERCEL_TARGET_ENV','VITE_VERCEL_URL','VITE_VERCEL_BRANCH_URL','VITE_VERCEL_PROJECT_PRODUCTION_URL','VITE_VERCEL_HASH_SALT',
  'VITE_VERCEL_GIT_PROVIDER','VITE_VERCEL_GIT_REPO_SLUG','VITE_VERCEL_GIT_REPO_OWNER','VITE_VERCEL_GIT_REPO_ID','VITE_VERCEL_GIT_COMMIT_REF','VITE_VERCEL_GIT_COMMIT_SHA',
  'VITE_VERCEL_GIT_COMMIT_MESSAGE','VITE_VERCEL_GIT_COMMIT_AUTHOR_LOGIN','VITE_VERCEL_GIT_COMMIT_AUTHOR_NAME','VITE_VERCEL_GIT_PULL_REQUEST_ID',
]);

function value(input){
  if(input===undefined)return '';
  if(typeof input!=='string')throw new Error('Supabase配置必须为字符串');
  return input.trim();
}

export function normalizeConfig(input={}, {production=false}={}){
  const url=value(input.SUPABASE_URL),primary=value(input.SUPABASE_PUBLISHABLE_KEY),alias=value(input.SUPABASE_ANON_KEY);
  if(primary&&alias&&primary!==alias)throw new Error('Publishable Key与旧别名配置冲突，请只保留一项或填写相同值');
  const key=primary||alias;
  if(!url&&!key)return Object.freeze({SUPABASE_URL:'',SUPABASE_PUBLISHABLE_KEY:'',SUPABASE_ANON_KEY:''});
  if(!url||!key)throw new Error('数据库配置不完整，请同时填写Supabase URL和Publishable Key');
  if(!/^sb_publishable_[A-Za-z0-9_-]+$/.test(key))throw new Error('浏览器只允许Supabase Publishable Key，不接受Anon JWT、Service Role或Secret Key');
  let parsed;
  try{parsed=new URL(url);}catch{throw new Error('Supabase URL格式无效');}
  if(!['https:','http:'].includes(parsed.protocol)||parsed.username||parsed.password||parsed.search||parsed.hash)throw new Error('Supabase URL只能使用HTTP或HTTPS，不能包含账号、查询参数或片段');
  if(production&&parsed.protocol!=='https:')throw new Error('生产环境Supabase URL必须使用HTTPS');
  return Object.freeze({SUPABASE_URL:url.replace(/\/+$/,''),SUPABASE_PUBLISHABLE_KEY:key,SUPABASE_ANON_KEY:key});
}

export function createConfig(environment={},options={}){
  if(Object.keys(environment).some(name=>name.startsWith('VITE_')&&!clientEnvNames.includes(name)&&!vercelPublicEnvNames.includes(name)))throw new Error('发现未知VITE_环境变量，请只配置允许的Supabase公开变量');
  return normalizeConfig({SUPABASE_URL:environment.VITE_SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY:environment.VITE_SUPABASE_PUBLISHABLE_KEY,SUPABASE_ANON_KEY:environment.VITE_SUPABASE_ANON_KEY},options);
}

export const config=createConfig(import.meta.env??{}, {production:import.meta.env?.PROD===true});
