import {sum} from './utils.js';
const localDate=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai'});
export function finance(db,filter={}) {
  const sessions=db.sessions.filter(s=>s.status==='completed'&&(!filter.store_id||s.store_id===filter.store_id)&&(!filter.from||s.date>=filter.from)&&(!filter.to||s.date<=filter.to)&&(!filter.dm_id||s.dm_id===filter.dm_id)&&(!filter.script_id||s.script_id===filter.script_id));
  const selected=filter.method?sessions.filter(s=>db.session_payments.some(p=>p.session_id===s.id&&p.method===filter.method)):sessions;
  const ids=selected.map(s=>s.id),participants=db.session_participants.filter(p=>ids.includes(p.session_id)),payments=db.session_payments.filter(p=>ids.includes(p.session_id));
  const result={count:selected.length,players:participants.length,due:sum(participants,'due'),revenue:sum(participants,'actual'),discount:sum(participants,'discount'),selectedPayments:sum(payments.filter(p=>!filter.method||p.method===filter.method),'amount')};
  for(const method of ['wechat','alipay','cash','balance','other'])result[method]=sum(payments.filter(p=>p.method===method),'amount');
  result.recharge=sum(db.balance_transactions.filter(t=>t.type==='recharge'&&(!filter.store_id||t.store_id===filter.store_id)&&(!filter.from||localDate.format(new Date(t.created_at))>=filter.from)&&(!filter.to||localDate.format(new Date(t.created_at))<=filter.to)&&(!filter.method||t.payment_method===filter.method)),'delta');return result;
}
export function wages(db,store_id,month,dm_id){const valid=db.sessions.filter(s=>s.store_id===store_id&&s.status==='completed'&&s.date.startsWith(month)&&(!dm_id||s.dm_id===dm_id)).map(s=>s.id);const records=db.commission_records.filter(r=>valid.includes(r.session_id)&&!r.voided),adjustments=db.wage_adjustments.filter(r=>r.store_id===store_id&&r.month===month&&(!dm_id||r.dm_id===dm_id));const base=sum(records,'amount'),subsidy=sum(adjustments.filter(r=>r.type==='subsidy'),'amount'),deduction=sum(adjustments.filter(r=>r.type==='deduction'),'amount');return {count:records.length,base,subsidy,deduction,total:base+subsidy-deduction,records,adjustments};}
