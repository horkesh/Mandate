import {test,expect} from '@playwright/test';
import {appendFileSync,existsSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {rest} from './support/s29-controls.ts';
import {S} from '../web/strings.ts';

// A headless, file-driven observation harness. It exposes rendered DOM only to
// the player. No State, source-derived policy, saved game or API-driven moves.
test('S47 politician from the rendered desk',async({page})=>{
 const profile='politics',out=resolve('../../art-masters/S47',profile);
 mkdirSync(out,{recursive:true});
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 page.on('response',async r=>{if(r.url().endsWith('/api/command')&&r.request().method()==='POST'){
  const reply=await r.json();appendFileSync(`${out}/commands.jsonl`,JSON.stringify({line:r.request().postDataJSON().line,ok:reply.ok,message:reply.message})+'\n');
  if(reply.turn)writeFileSync(`${out}/last-turn-reply.json`,JSON.stringify(reply));
 }});
 await page.goto('/');await expect(page.getByTestId('map-canvas-host')).toHaveAttribute('data-ready','ready',{timeout:30000});
 let seq=0;
 async function snapshot(error?:string){
  const text=await page.locator('body').innerText();
  const controls=await page.locator('button,input,select,textarea').evaluateAll(els=>els.filter(e=>(e as HTMLElement).checkVisibility()).map(e=>({tag:e.tagName,text:(e.textContent??'').trim(),label:e.getAttribute('aria-label')??e.closest('label')?.textContent?.trim(),disabled:(e as HTMLButtonElement).disabled,value:(e as HTMLInputElement).value,options:e instanceof HTMLSelectElement?[...e.options].map(o=>({text:o.text,value:o.value})):undefined})));
  const value={seq,text,controls,error,errors};writeFileSync(`${out}/screen.json`,JSON.stringify(value,null,2));writeFileSync(`${out}/screen-${seq}.txt`,text);
 }
 await snapshot();
 for(;;){
  const path=`${out}/action-${seq+1}.json`;
  while(!existsSync(path))await new Promise(r=>setTimeout(r,500));
  const action=JSON.parse(readFileSync(path,'utf8'));seq++;
  appendFileSync(`${out}/actions.jsonl`,JSON.stringify({seq,...action})+'\n');
  try{
   for(const a of action.steps??[action]){
    if(a.op==='done'){await snapshot();expect(errors).toEqual([]);return;}
    if(a.op==='rest'){await rest(page);continue;}
    if(a.op==='book'){await rest(page);await page.getByRole('navigation',{name:S.deskObjects}).getByRole('button',{name:a.name,exact:true}).click();continue;}
    if(a.op==='size'){await page.setViewportSize({width:a.width,height:a.height});continue;}
    if(a.op==='capture'){
     await page.evaluate(()=>document.fonts.ready);const file=`${out}/${a.name}.png`;await page.screenshot({path:file});
     writeFileSync(`${file}.recipe.json`,JSON.stringify({request:'S47',tool:'Prototype headless Playwright harness',mode:'Unedited rendered desk capture',date:'2026-11-21',profile,seq,requestedSize:page.viewportSize(),actualSize:page.viewportSize(),humanEdits:[],postProcess:[],sha256:createHash('sha256').update(readFileSync(file)).digest('hex'),source:`screen-${seq}.txt`,notes:'Human-seat UI only; no likeness or image generation.'},null,2));continue;
    }
    let target=a.selector?page.locator(a.selector):a.label?page.getByLabel(a.label,{exact:a.exact!==false}):page.getByRole(a.role??'button',{name:a.name,exact:a.exact!==false});
    if(a.index!==undefined)target=target.nth(a.index);
    if(a.op==='fill')await target.fill(a.value);
    else if(a.op==='select')await target.selectOption(a.value);
    else if(a.op==='check')await target.setChecked(a.checked??true);
    else if(a.op==='click'){
     if(a.command){const result=page.waitForResponse(r=>r.url().endsWith('/api/command')&&r.request().method()==='POST',{timeout:60000});await target.click();await result;}
     else await target.click();
    }else throw Error(`Unknown operation ${a.op}`);
   }
   await snapshot();
  }catch(e){await snapshot(String(e));}
 }
});
