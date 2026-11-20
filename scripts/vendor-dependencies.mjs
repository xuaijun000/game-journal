import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
let locked={};
try{locked=JSON.parse(await readFile(resolve(root,'js/vendor/manifest.json'),'utf8'));}catch{}
await mkdir(resolve(root,'js/vendor'),{recursive:true});
const packages=[['@supabase/supabase-js','dist/umd/supabase.js','supabase.js'],['chart.js','dist/chart.umd.js','chart.umd.js']];
const manifest={};
for(const [name,file,output] of packages){
  const version=locked[name]?.version||(await fetch(`https://registry.npmjs.org/${name}/latest`).then(r=>{if(!r.ok)throw new Error(`Registry ${r.status}`);return r.json();})).version;
  const url=`https://cdn.jsdelivr.net/npm/${name}@${version}/${file}`;
  const response=await fetch(url,{signal:AbortSignal.timeout(30000)});
  if(!response.ok)throw new Error(`${url}: HTTP ${response.status}`);
  const bytes=Buffer.from(await response.arrayBuffer());
  const sha256=createHash('sha256').update(bytes).digest('hex');
  if(locked[name]?.sha256&&locked[name].sha256!==sha256)throw new Error(`${name}: checksum changed`);
  await writeFile(resolve(root,'js/vendor',output),bytes);
  manifest[name]={version,source:url,sha256,license:'MIT'};
  console.log(`${name}@${version}: ${bytes.length} bytes`);
}
await writeFile(resolve(root,'js/vendor/manifest.json'),JSON.stringify(manifest,null,2)+'\n','utf8');
