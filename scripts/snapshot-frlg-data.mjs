import {readFile,writeFile} from 'node:fs/promises';
import vm from 'node:vm';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const context={window:{}};
vm.runInNewContext(await readFile(resolve(root,'js/data/frlg_encounters.js'),'utf8'),context);
const names=[...new Set(Object.values(context.window.FRLG_ENCOUNTERS).flatMap(e=>e.encounters.map(p=>p.slug)).concat(['bulbasaur','charmander','squirtle']))];
const pokemon={};let completed=0;
for(let offset=0;offset<names.length;offset+=8){
  await Promise.all(names.slice(offset,offset+8).map(async name=>{
    const response=await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`,{signal:AbortSignal.timeout(30000)});
    if(!response.ok)throw new Error(`${name}: HTTP ${response.status}`);
    const p=await response.json();
    pokemon[p.id]={id:p.id,name:p.name,stats:p.stats.map(s=>({base_stat:s.base_stat,effort:s.effort,stat:{name:s.stat.name}})),sprites:{front_default:p.sprites.front_default,other:{'official-artwork':{front_default:p.sprites.other['official-artwork'].front_default}}},types:p.types,species:p.species};
    completed++;
  }));
  console.log(`${completed}/${names.length}`);
}
await writeFile(resolve(root,'js/data/frlg_pokemon.json'),JSON.stringify({source:'https://pokeapi.co/api/v2/pokemon/',retrievedAt:new Date().toISOString(),pokemon},null,2)+'\n','utf8');
