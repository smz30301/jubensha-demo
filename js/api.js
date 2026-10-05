import {config,normalizeConfig} from '../config.js';
import {DemoStore} from './store.js';
export const cloud=Boolean(config.SUPABASE_URL?.trim()||config.SUPABASE_PUBLISHABLE_KEY?.trim()||config.SUPABASE_ANON_KEY?.trim());
export class CloudStore {
  constructor(){
    try{this.session=JSON.parse(sessionStorage.getItem('script-auth-session')||'null');}catch{this.session=null;}
    this.token=this.session?.access_token||sessionStorage.getItem('script-auth-token');
    this.refreshing=null;
  }
  configuration(){
    const selected=normalizeConfig(config,{production:import.meta.env?.PROD===true});
    if(!selected.SUPABASE_URL||!selected.SUPABASE_PUBLISHABLE_KEY)throw new Error('数据库配置不完整，请同时填写Supabase URL和Publishable Key');
    return {url:selected.SUPABASE_URL,key:selected.SUPABASE_PUBLISHABLE_KEY};
  }
  saveSession(data){
    if(!data.access_token||!data.refresh_token)throw new Error('登录会话无效，请重新登录');
    this.session={access_token:data.access_token,refresh_token:data.refresh_token,expires_at:data.expires_at||Math.floor(Date.now()/1000)+data.expires_in};
    this.token=this.session.access_token;sessionStorage.setItem('script-auth-session',JSON.stringify(this.session));sessionStorage.removeItem('script-auth-token');
  }
  async refreshSession(){
    if(!this.session?.refresh_token)throw new Error('登录已过期，请重新登录');
    if(!this.refreshing)this.refreshing=(async()=>{
      try{this.saveSession(await this.request('/auth/v1/token?grant_type=refresh_token',{refresh_token:this.session.refresh_token},false));}
      catch(error){this.logout();throw error;}
      finally{this.refreshing=null;}
    })();
    return this.refreshing;
  }
  async request(path,body,auth=true,retry=true){
    const {url,key}=this.configuration();
    if(auth&&this.session?.expires_at<=Date.now()/1000+30)await this.refreshSession();
    if(auth&&!this.token)throw new Error('请先登录数据库账号');
    const sentToken=this.token;
    const response=await fetch(url+path,{method:'POST',headers:{'Content-Type':'application/json',apikey:key,...(auth?{Authorization:`Bearer ${sentToken}`}:{})},body:JSON.stringify(body)});
    // Only an authentication rejection is safe to retry; an uncertain write is never replayed.
    if(auth&&response.status===401&&retry){if(this.token===sentToken)await this.refreshSession();return this.request(path,body,auth,false);}
    const raw=await response.text();let data=null;
    if(raw){try{data=JSON.parse(raw);}catch{throw new Error('数据库返回了无效响应，请检查 Supabase URL');}}
    if(!response.ok){
      const message=response.status===401?'登录已过期，请重新登录':data?.message||data?.msg||'数据库操作失败';
      throw new Error(String(message).replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+|sb_(?:secret|publishable)_[A-Za-z0-9_-]+/g,'[已隐藏凭据]'));
    }
    return data;
  }
  async login(email,password){const r=await this.request('/auth/v1/token?grant_type=password',{email,password},false);this.saveSession(r);return r.user;}
  async load(c={role:'player',store_id:null}){return this.request('/rest/v1/rpc/demo_read',{p_role:c.role,p_store:c.store_id??null});}
  async command(c,action,payload){return this.request('/rest/v1/rpc/demo_command',{p_role:c.role,p_store:c.store_id,p_action:action,p_payload:payload});}
  logout(){this.token=null;this.session=null;sessionStorage.removeItem('script-auth-session');sessionStorage.removeItem('script-auth-token');}
}
export const api=cloud?new CloudStore():new DemoStore();
