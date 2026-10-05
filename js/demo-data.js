import { today } from './utils.js';
export function demoData({date=today(),stamp=new Date().toISOString()}={}) {
  const m=date.slice(0,7);
  const row=(id,v)=>({id,created_at:stamp,...v});
  const users=Array.from({length:20},(_,i)=>row(`p${i+1}`,{nickname:i?'玩家'+(i+1):'张三',phone:'',wechat:'',city:'青岛市'}));
  users.push(...Array.from({length:6},(_,i)=>row(`d${i+1}`,{nickname:['小王','阿哲','小鹿','安安','大林','小夏'][i],phone:'',city:'青岛市',bio:'用线索串起故事，让每个人都参与其中。',specialties:'推理、欢乐、情感'})),row('a1',{nickname:'李店长',city:'青岛市'}),row('root',{nickname:'平台管理员',city:'青岛市'}));
  const merchants=[row('m1',{name:'XX剧本杀',expires_on:'2027-10-03',status:'正常'}),row('m2',{name:'YY剧本杀',expires_on:'2027-10-03',status:'正常'})];
  const stores=[row('s1',{merchant_id:'m1',name:'XX剧本杀·大学城店',city:'青岛市',address:'青岛市大学城体验街1号（虚构地址）',hours:'12:00–24:00',phone:'未提供',intro:'一间让故事发生的店。推理、情感与欢乐，每次到店都有新体验。',rooms:'推理室、沉浸室、欢乐室',environment:'独立包间、休息区、饮水区',activity:'会员新本体验优惠，具体以场次结算为准'}),row('s2',{merchant_id:'m1',name:'XX剧本杀·市南店',city:'青岛市',address:'市南体验街2号（虚构地址）',hours:'12:00–24:00',phone:'未提供',intro:'城市中心的故事空间',rooms:'两间独立房间',environment:'安静独立包间',activity:'工作日体验活动'}),row('s3',{merchant_id:'m2',name:'YY剧本杀·海岸店',city:'青岛市',address:'海岸体验街3号（虚构地址）',hours:'12:00–24:00',phone:'未提供',intro:'海边相聚，开一场好故事',rooms:'三间主题房间',environment:'主题休息区',activity:'新玩家体验活动'})];
  const store_members=[row('ma',{user_id:'a1',store_id:'s1',role:'admin',active:true}),...Array.from({length:6},(_,i)=>row('md'+i,{user_id:'d'+(i+1),store_id:'s'+(Math.floor(i/2)+1),role:'dm',active:true}))];
  const scripts=['年轮','城下辉','水镜','漓川怪谈簿','欢乐茶馆','长夜未明','山海','旧日来信','雪落无声','最后一班车'].map((name,i)=>row('b'+(i+1),{name,players:i%3+5,gender:'自由配置',duration:i%2+4,type:['推理','情感','欢乐'][i%3],difficulty:['入门','进阶','困难'][i%3],publisher:'演示发行方',intro:'仅用于流程体验的虚构资料。沿着人物与线索，探索故事背后的真相。',cover:i%4}));
  const store_scripts=stores.flatMap((s,si)=>scripts.slice(0,si===2?8:10).map((b,i)=>row(s.id+b.id,{store_id:s.id,script_id:b.id,price:12800+si*1000,dm_ids:['d'+(si*2+1),'d'+(si*2+2)],visible:true,is_new:i>6})));
  const store_customers=stores.flatMap(s=>users.slice(0,20).map((u,i)=>row(s.id+u.id,{store_id:s.id,user_id:u.id,is_member:i%3===0,expires_on:'2027-03-01',balance:0})));
  const balance_transactions=[];
  function ledger(store_id,user_id,delta,type,note,session_id=null,payment_method='cash') {const c=store_customers.find(c=>c.store_id===store_id&&c.user_id===user_id); balance_transactions.push(row('t'+(balance_transactions.length+1),{store_id,user_id,type,delta,before_balance:c.balance,after_balance:c.balance+delta,payment_method,note,operator_id:'a1',session_id}));c.balance+=delta;}
  ledger('s1','p1',50000,'recharge','现金充值');ledger('s1','p1',5000,'gift','活动赠送',null,'other'); ledger('s3','p1',10000,'recharge','现金充值');
  for(let i=2;i<=20;i++) ledger('s1','p'+i,50000,'recharge','演示初始充值');
  const commission_rules=Array.from({length:6},(_,i)=>row('r'+i,{store_id:'s'+(Math.floor(i/2)+1),dm_id:'d'+(i+1),kind:'fixed',amount:10000,rate:1000,threshold:6,extra:2000}));
  const sessions=[],session_participants=[],session_payments=[],commission_records=[];
  for(let i=0;i<22;i++) {const id='h'+i,dm_id=i<18?'d1':'d2',days=Math.max(1,Number(date.slice(-2))),dmIndex=i<18?i:i-18,day=String(dmIndex%days+1).padStart(2,'0'),slot=Math.floor(dmIndex/days),time=String(Math.floor((8*60+slot*45)/60)).padStart(2,'0')+':'+String((8*60+slot*45)%60).padStart(2,'0');const s=row(id,{store_id:'s1',script_id:'b'+(i%10+1),dm_id,date:m+'-'+day,time,expected:6,price:12800,type:'normal',status:'completed',note:'虚构月度统计样本，开始时间不代表完整排班',completed_at:`${m}-${day}T${time}:00+08:00`});sessions.push(s);
    for(let j=0;j<6;j++){const user_id=i<5&&j===0?'p1':'p'+(2+(i*6+j)%19),pid=id+'p'+j;const balance=i===0&&j===0?12800:0;session_participants.push(row(pid,{session_id:id,user_id,due:12800,actual:12800,discount:0,note:''}));session_payments.push(row(pid+'pay',{session_id:id,participant_id:pid,method:balance?'balance':['wechat','alipay','cash'][j%3],amount:12800}));if(balance)ledger('s1',user_id,-balance,'consume','《年轮》消费',id,'balance');}
    const amount=i<18?(i<6?11000:10000):10000;commission_records.push(row(id+'c',{session_id:id,store_id:'s1',dm_id,amount,snapshot:{kind:'fixed',amount},voided:false}));
  }
  ledger('s1','p1',-5000,'consume','演示其他消费',null,'balance');
  for(let i=0;i<4;i++)sessions.push(row('g'+i,{store_id:['s1','s1','s2','s3'][i],script_id:'b'+(i+1),dm_id:['d1','d2','d3','d5'][i],date,time:i%2?'14:00':'19:00',expected:6,price:12800,type:'recruitment',status:'recruiting',note:'还差两位，一起开本'}));
  for(let i=0;i<4;i++)for(let j=0;j<4;j++)session_participants.push(row(`gp${i}${j}`,{session_id:'g'+i,user_id:'p'+(j+2),due:12800,actual:0,discount:0,note:''}));
  const posts=Array.from({length:10},(_,i)=>row('post'+i,{user_id:'p'+(i+1),store_id:'s1',type:['剧本体验','DM推荐','门店推荐','门店体验','门店吐槽','剧本讨论'][i%6],title:['第一次体验推理本','小王的控场节奏很好','周末在大学城开本','关于情感本的讨论','希望休息区更安静'][i%5],body:'本帖为虚构测试内容。记录开本体验，欢迎理性讨论，请勿发布他人隐私。',hidden:false}));
  return {version:1,users,merchants,stores,store_members,store_customers,scripts,store_scripts,sessions,session_participants,session_payments,recruitment_applications:[],balance_transactions,commission_rules,commission_records,wage_adjustments:[],audit_logs:[],posts,comments:[],favorites:[],reports:[],likes:[]};
}
