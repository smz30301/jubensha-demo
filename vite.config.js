import {defineConfig,loadEnv} from 'vite';
import {createConfig} from './config.js';

export default defineConfig(({command,mode,isPreview})=>{
  createConfig(loadEnv(mode,process.cwd(),'VITE_'),{production:command==='build'||Boolean(isPreview)});
  return {
    envPrefix:'VITE_SUPABASE_',
    server:{host:'127.0.0.1',port:5173,strictPort:true},
    preview:{host:'127.0.0.1',port:4173,strictPort:true},
    build:{outDir:'dist',sourcemap:false},
  };
});
