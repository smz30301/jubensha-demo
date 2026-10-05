export const roles={player:{user_id:'p1',name:'玩家',nickname:'张三'},dm:{user_id:'d1',name:'DM',nickname:'小王'},admin:{user_id:'a1',name:'门店管理员',nickname:'李店长'},platform:{user_id:'root',name:'平台管理员',nickname:'平台管理员'}};
export function demoIdentity(role,store_id='s1'){if(!roles[role])throw new Error('身份不存在');return {user_id:roles[role].user_id,role,store_id};}
export function cloudIdentity(data,role,store_id=null){
  const identity=data.available_contexts?.find(c=>c.role===role&&(c.store_id??null)===(store_id??null));
  if(!identity||!data.current_user_id)throw new Error('账号没有该身份或门店权限');
  return {...identity,user_id:data.current_user_id};
}
