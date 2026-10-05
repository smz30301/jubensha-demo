export const uid = () => crypto.randomUUID();
export const now = () => new Date().toISOString();
export const today = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai' }).format(new Date());
export const month = () => today().slice(0, 7);
export function validMonth(v) { return typeof v==='string'&&/^\d{4}-(0[1-9]|1[0-2])$/.test(v)&&Number(v.slice(0,4))>0; }
export function validDate(v) { if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v)||!validMonth(v.slice(0,7)))return false;const [y,m,d]=v.split('-').map(Number),days=[31,y%4===0&&(y%100!==0||y%400===0)?29:28,31,30,31,30,31,31,30,31,30,31];return d>=1&&d<=days[m-1]; }
export function validTime(v) { return typeof v==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(v); }
export function monthEnd(value=month()) { if(!validMonth(value))throw new Error('月份无效');const [y,m]=value.split('-').map(Number),days=new Date(Date.UTC(y,m,0)).getUTCDate();return value+'-'+String(days).padStart(2,'0'); }
export const formatTime = value => new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(value));
export const money = n => '¥' + (n / 100).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export function cents(v) { if (!/^\d+(\.\d{1,2})?$/.test(String(v))) throw new Error('金额必须是非负数，最多两位小数'); const [a,b=''] = String(v).split('.'); const n=Number(a)*100+Number(b.padEnd(2,'0')); if (!Number.isSafeInteger(n) || n>100000000) throw new Error('金额超出范围'); return n; }
export const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const sum = (rows, key) => rows.reduce((n,r) => n+(r[key]||0),0);
export const label = {draft:'草稿',recruiting:'拼场中',confirmed:'已确认',completed:'已完成',cancelled:'已取消',voided:'已作废',pending:'待商家确认',rejected:'已拒绝',removed:'已下架',dismissed:'已驳回',wechat:'微信',alipay:'支付宝',cash:'现金',balance:'余额',other:'其他',recharge:'充值',consume:'消费',gift:'商家赠送',refund:'退款',correction:'后台修正',fixed:'固定金额/场',per_player:'按人数',percent:'消费额百分比',bonus:'固定金额 + 超员奖励'};
