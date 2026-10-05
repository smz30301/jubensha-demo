import {demoData} from './demo-data.js';
import {apply,context,visible} from './domain.js';
export const KEY='script-store-demo-v1';
export class DemoStore {
  constructor(storage){try{this.storage=storage??globalThis.localStorage;if(!this.storage.getItem(KEY))this.save(demoData());}catch(error){throw new Error(error.message?.startsWith('本地数据保存失败')?error.message:'无法使用本地存储。请允许浏览器保存数据，并通过 HTTP Server 打开演示。');}this.read();}
  read(){try{const d=JSON.parse(this.storage.getItem(KEY));if(d?.version!==1||!['users','sessions','store_customers','balance_transactions','session_payments','commission_records'].every(k=>Array.isArray(d[k])))throw new Error();return d;}catch{throw new Error('本地演示数据无法读取。请检查浏览器存储权限；数据损坏时先导出备份，再重置演示数据。');}}
  save(data){try{this.storage.setItem(KEY,JSON.stringify(data));}catch{throw new Error('本地数据保存失败。请检查浏览器存储权限或剩余空间；本次操作未保存。');}}
  async load(c){const db=this.read();return visible(db,context(db,c.user_id,c.role,c.store_id));}
  async command(c,action,payload){const run=()=>{const before=this.storage.getItem(KEY),copy=this.read();apply(copy,context(copy,c.user_id,c.role,c.store_id),action,payload);if(this.storage.getItem(KEY)!==before)throw new Error('演示数据已被其他窗口修改，请刷新后重试。');this.save(copy);};if(typeof window!=='undefined'&&globalThis.navigator?.locks?.request)await navigator.locks.request(KEY,run);else run();}
  reset(){this.save(demoData());}
}
