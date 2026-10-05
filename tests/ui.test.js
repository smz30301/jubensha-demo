import test from 'node:test';
import assert from 'node:assert/strict';
import {demoData} from '../js/demo-data.js';
import {renderPage} from '../js/pages.js';

const db=demoData();
const views=[
  [{user_id:'a1',role:'admin',store_id:'s1'},'settings'],
  [{user_id:'p1',role:'player',store_id:null},'profile'],
];

test('数据库设置和个人页不提供清空演示数据入口',()=>{
  for(const [identity,page] of views){
    const html=renderPage(db,identity,page,{},true);
    assert.ok(!html.includes('data-action="reset"'));
    assert.ok(html.includes('Supabase 数据库模式'));
    assert.ok(html.includes('data-action="export"'));
  }
});

test('本地模式明确设备存储范围并保留演示重置入口',()=>{
  for(const [identity,page] of views){
    const html=renderPage(db,identity,page,{});
    assert.ok(html.includes('数据仅保存在本设备'));
    assert.ok(html.includes('DEMO ONLY'));
    assert.ok(html.includes('data-action="reset"'));
  }
});
