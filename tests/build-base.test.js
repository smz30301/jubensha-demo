import test from 'node:test';
import assert from 'node:assert/strict';
import viteConfig from '../vite.config.js';

const build={command:'build',mode:'test',isPreview:false};
const dev={command:'serve',mode:'test',isPreview:false};
const preview={command:'serve',mode:'test',isPreview:true};

test.beforeEach(t=>{
  const previous=process.env.PAGES_BASE_PATH;
  delete process.env.PAGES_BASE_PATH;
  t.after(()=>{if(previous===undefined)delete process.env.PAGES_BASE_PATH;else process.env.PAGES_BASE_PATH=previous;});
});

test('未配置Pages基础路径时构建、开发和预览均使用根路径',()=>{
  for(const context of [build,dev,preview])assert.equal(viteConfig(context).base,'/');
});

test('构建和预览使用当前仓库路径，仓库改名无需修改业务代码',()=>{
  for(const base of ['/jubensha-demo/','/renamed_repo.v2/','/.demo-repo/']){
    process.env.PAGES_BASE_PATH=base;
    assert.equal(viteConfig(build).base,base);
    assert.equal(viteConfig(preview).base,base);
  }
  process.env.PAGES_BASE_PATH='/';
  assert.equal(viteConfig(build).base,'/');
  assert.equal(viteConfig(preview).base,'/');
});

test('开发服务始终使用根路径并忽略部署路径变量',()=>{
  for(const base of ['/jubensha-demo/','missing-slashes','https://fictional.example.invalid/repo/']){
    process.env.PAGES_BASE_PATH=base;
    assert.equal(viteConfig(dev).base,'/');
  }
});

test('构建和预览拒绝非法URL、查询、片段、父路径及不规范斜线',()=>{
  for(const base of ['', 'repo/', '/repo', 'repo', '//repo/', '/repo/sub/', '/./', '/../', '/repo/../', '/%2e%2e/', '/repo/?x=1', '/repo/#section', '/repo\\/', '/中文/', ' /repo/ ', 'https://fictional.example.invalid/repo/']){
    process.env.PAGES_BASE_PATH=base;
    for(const context of [build,preview])assert.throws(()=>viteConfig(context),/PAGES_BASE_PATH/);
  }
});

test('Pages基础路径不会扩大客户端环境变量前缀',()=>{
  process.env.PAGES_BASE_PATH='/jubensha-demo/';
  const config=viteConfig(build);
  assert.equal(config.envPrefix,'VITE_SUPABASE_');
  assert.equal(config.define,undefined);
  assert.equal(config.build.outDir,'dist');
});
