import {readdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
for(const dir of ['js','tools','tests'])for(const name of await readdir(dir)){if(name.endsWith('.js')){const r=spawnSync(process.execPath,['--check',`${dir}/${name}`],{encoding:'utf8'});if(r.status){console.error(r.stderr);process.exit(1);}}}
for(const file of ['config.js','vite.config.js']){const r=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(r.status){console.error(r.stderr);process.exit(1);}}
console.log('JavaScript 语法检查通过');
