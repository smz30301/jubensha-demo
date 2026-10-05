import {defineConfig,loadEnv} from 'vite';
import {createConfig} from './config.js';

export default defineConfig(({command,mode,isPreview})=>{
  const production=command==='build'||Boolean(isPreview);
  const base=production?(process.env.PAGES_BASE_PATH??'/'):'/';
  if(base!=='/'&&!/^\/(?!\.{1,2}\/)[A-Za-z0-9._-]+\/$/.test(base))throw new Error('PAGES_BASE_PATH必须为/或/ASCII仓库名/，不能包含URL、查询参数或父路径');
  createConfig(loadEnv(mode,process.cwd(),'VITE_'),{production});
  return {
    base,
    envPrefix:'VITE_SUPABASE_',
    server:{host:'127.0.0.1',port:5173,strictPort:true},
    preview:{host:'127.0.0.1',port:4173,strictPort:true},
    build:{outDir:'dist',sourcemap:false},
  };
});
