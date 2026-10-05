import {readFile,writeFile} from 'node:fs/promises';
import {demoData} from '../js/demo-data.js';
import {today} from '../js/utils.js';
const target=new URL('../database/seed.sql',import.meta.url),checking=process.argv.includes('--check');
const saved=checking?await readFile(target,'utf8'):null;
const snapshot=checking?JSON.parse(saved.match(/^-- Demo snapshot: (.+)$/m)?.[1]||'null'):{date:today(),stamp:new Date().toISOString()};
if(!snapshot)throw new Error('种子缺少生成日期，请在需要刷新测试样本时运行 node tools/seed.js');
const data=demoData(snapshot);
data.users=data.users.map(u=>({...u,is_platform:u.id==='root'}));
const order=['users','merchants','stores','store_members','scripts','store_scripts','store_customers','sessions','session_participants','session_payments','recruitment_applications','balance_transactions','commission_rules','commission_records','wage_adjustments','audit_logs','posts','comments','favorites','reports','likes'];
let sql='-- Generated fictional demo data; safe to rerun without overwriting existing rows.\n-- Generate only when intentionally refreshing seed dates: node tools/seed.js\n-- Demo snapshot: '+JSON.stringify(snapshot)+'\n-- Bind existing Supabase Auth UUIDs to users.auth_id in SQL Editor; never store passwords here.\nbegin;\n';
for(const t of order)if(data[t].length){const cols=[...new Set(data[t].flatMap(Object.keys))];const json=JSON.stringify(data[t]).replaceAll("'","''");sql+=`insert into public.${t} (${cols.join(',')}) select ${cols.join(',')} from jsonb_populate_recordset(null::public.${t}, '${json}'::jsonb) on conflict do nothing;\n`;}
sql+='commit;\n';
if(checking){if(saved!==sql)throw new Error('seed.sql 与 demo-data.js 不一致');console.log('seed.sql 与演示数据一致');}
else{await writeFile(target,sql,'utf8');console.log('database/seed.sql 已生成');}
