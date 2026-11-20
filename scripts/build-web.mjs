import {cp,mkdir,readFile,writeFile,lstat,realpath,rm} from 'node:fs/promises';
import {resolve,dirname,extname} from 'node:path';
const root=await realpath(resolve(import.meta.dirname,'..'));
const output=resolve(root,'web-dist');
// 只清理本脚本的生成目录；拒绝链接和工作区外目标。
if(dirname(output)!==root)throw new Error('Invalid output path');
let old;try{old=await lstat(output);}catch{}
if(old?.isSymbolicLink())throw new Error('Output must not be a link');
if(old&&await realpath(output)!==output)throw new Error('Unexpected output target');
if(old)await rm(output,{recursive:true});
await mkdir(output,{recursive:true});
const allowed=new Set(['.html','.css','.js','.json','.png','.jpg','.jpeg','.webp','.gif','.svg','.woff','.woff2']);
for(const source of ['index.html','privacy.html','css','js','pokemon-trainer-terminal/index.html','pokemon-trainer-terminal/css','pokemon-trainer-terminal/js','pokemon-trainer-terminal/data','pokemon-trainer-terminal/assets']){
  await cp(resolve(root,source),resolve(output,source),{recursive:true,filter:async file=>(await lstat(file)).isDirectory()||allowed.has(extname(file).toLowerCase())});
}
const siteUrl=process.env.SITE_URL;
if(siteUrl){
  const url=new URL(siteUrl);if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash)throw new Error('SITE_URL must be an HTTPS base URL without credentials, query or hash');
  let html=await readFile(resolve(output,'index.html'),'utf8');
  html=html.replace('</head>',`<link rel="canonical" href="${url.href}">\n</head>`).replace('content="css/logo_final.png"',`content="${new URL('css/logo_final.png',url).href}"`);
  await writeFile(resolve(output,'index.html'),html,'utf8');
}
await writeFile(resolve(output,'_headers'),'/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: DENY\n','utf8');
console.log(`Static site ready: ${output}`);
