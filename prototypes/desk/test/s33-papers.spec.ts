import {test,expect} from '@playwright/test';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {S} from '../web/strings.ts';
import type {DeskSnapshot} from '../web/adapter.ts';
const out=resolve(process.env.S33_OUTPUT!);
const hash=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex');
test('read-only observer opens the received Manassas paper',async({page,request})=>{
 mkdirSync(out,{recursive:true});let data:DeskSnapshot;
 await expect.poll(async()=>{data=await(await request.get('/api/desk')).json();return data.morning.requestDay;},{timeout:240000,intervals:[2000]}).toBeGreaterThanOrEqual(147);
 // Local UI reads can mark a paper read in this page; no command POST is allowed.
 page.on('request',r=>{if(r.method()==='POST')throw Error(`Read-only observer attempted ${r.url()}`);});
 await page.setViewportSize({width:3440,height:1440});await page.goto('/');
 await expect(page.getByTestId('map-canvas-host')).toHaveAttribute('data-ready','ready',{timeout:30000});
 await page.getByRole('navigation',{name:S.deskObjects}).getByRole('button',{name:S.daybook,exact:true}).click();
 const day=page.locator('.day-record > section').filter({has:page.getByRole('heading',{name:'29 July 1861, Day 146',exact:true})});
 const link=day.getByTestId('paper-link').filter({hasText:'Manassas Junction'}).filter({hasText:'8:00'}).first();
 await expect(link).toHaveCount(1);await link.click();
 await expect(page.getByTestId('paper')).toContainText('Manassas Junction');
 await expect(page.getByTestId('paper')).toContainText('28 July 1861, 08:00');
 await expect(page.getByTestId('paper').locator('.received-stamp')).toContainText('29 July 1861');
 for(const size of [{width:3440,height:1440},{width:1920,height:1080}]){
  await page.setViewportSize(size);const name=`manassas-dawn-${size.width}`,file=`${out}/${name}.png`;
  writeFileSync(`${out}/${name}.json`,JSON.stringify(data!,null,2));await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:file});
  writeFileSync(`${file}.recipe.json`,JSON.stringify({request:'S33',tool:'Playwright Chromium',mode:'Read-only headless observer on own S33 server',date:'2026-11-21',prompt:null,client:'Codex',model:'No image model',plan:'No image service',requestedSize:size,actualSize:size,references:[{path:`${out}/${name}.json`,sha256:hash(`${out}/${name}.json`)}],humanEdits:[],postProcess:[],sha256:hash(file),notes:'Actual received paper, no command POST, State load, likeness or slogan.'},null,2));
 }
});
