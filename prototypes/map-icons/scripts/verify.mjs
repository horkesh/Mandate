import { chromium } from 'playwright';
import { mkdir,readFile,writeFile,readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import { icons,renderSVG } from '../src/catalog.mjs';
import { strings } from '../src/strings.mjs';
import { silhouette,similarity } from '../src/metrics.mjs';
import { matrices,simulate,contrast } from '../src/vision.mjs';
import { createIconServer } from './server.mjs';
const root=new URL('../',import.meta.url);
const evidence=new URL('../../../art-masters/R16/',import.meta.url);
await mkdir(evidence,{recursive:true});
const hash=buffer=>createHash('sha256').update(buffer).digest('hex');
const capture=process.argv.includes('--capture'),preflight=process.argv.includes('--preflight');
const report={request:'R16',mode:capture?'capture':preflight?'preflight':'checks',threshold:0.82,
  thresholdReason:'Reject silhouettes sharing more than 82% of their union after up to one pixel of translation. At least 18% must differ on the native 20px grid; this catches small positional offsets and ignores internal enclosed detail. It is a draft discrimination gate, not a validated human recognition score.',
  failures:[],runtime:{node:process.version},static:{},screenshots:[]};
const fail=(condition,message)=>{if(!condition)report.failures.push(message);};
const documents=[];
for(const kind of ['clean','rough'])for(const icon of icons) {
  const path=`icons/${kind}/${icon.id}.svg`;
  const svg=await readFile(new URL(path,root),'utf8');
  const recipe=JSON.parse(await readFile(new URL(`${path}.recipe.json`,root),'utf8'));
  fail(hash(svg)===recipe.sha256,`Recipe hash: ${path}`);
  fail(svg===renderSVG(icon,{rough:kind==='rough',seed:4816}),`Rebuild differs: ${path}`);
  fail(!/<(?:text|image|script|foreignObject)\b|#[0-9a-f]{3,8}\b|\brgb\(/i.test(svg),`Forbidden content or fixed colour: ${path}`);
  fail(Boolean(strings.labels[icon.id]),`Legend missing: ${icon.id}`);
  for(const source of recipe.sources)fail(hash(await readFile(new URL(source.path,root)))===source.sha256,`Source hash: ${path}/${source.path}`);
  documents.push({id:icon.id,kind,svg});
}
report.static={icons:icons.length,svgFiles:documents.length,recipes:documents.length,deterministicByteMatches:documents.length,
  noImageModel:true,enemySigns:icons.filter(i=>i.semantic==='estimate').map(i=>i.id),blankSlots:icons.filter(i=>i.slot).map(i=>({id:i.id,bounds:i.slot}))};
const lock=JSON.parse(await readFile(new URL('package-lock.json',root),'utf8'));
report.licences=Object.entries(lock.packages).filter(([p])=>p).map(([path,value])=>({path,licence:value.license}));
for(const entry of report.licences)fail(['MIT','Apache-2.0','ISC','BSD-2-Clause','BSD-3-Clause','0BSD'].includes(entry.licence),`Non-permissive dependency: ${entry.path}`);
const server=createIconServer();server.listen(0,'127.0.0.1');await once(server,'listening');
const base=`http://127.0.0.1:${server.address().port}`;
let browser;
try {
  browser=await chromium.launch({headless:true});
  report.runtime.chromium=browser.version();
  const context=await browser.newContext({viewport:{width:3440,height:1440},deviceScaleFactor:1});
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
  await page.goto(base,{waitUntil:'networkidle'});await page.waitForSelector('body[data-ready="true"]',{timeout:10000});
  fail(await page.locator('.card').count()===72,'Two complete stocks must render');
  fail(await page.locator('.sample').count()===864,'Every state and size must render on both stocks');
  const loaded=await page.evaluate(async()=>Promise.all(['/stocks/linen.png','/stocks/letter.png'].map(async url=>{
    const response=await fetch(url);const image=new Image();image.src=URL.createObjectURL(await response.blob());await image.decode();return {url,width:image.width,height:image.height};
  })));
  fail(loaded.every(x=>x.width===1024&&x.height===1024),'Both real stocks must load at 1024px');report.stocks=loaded;
  await page.getByRole('searchbox').fill('enemy');fail(await page.locator('.card:visible').count()===4,'Search must filter both stocks');
  await page.getByRole('searchbox').fill('');
  await page.locator('#stock').selectOption('letter');fail(await page.locator('.stock:visible').count()===1,'Stock selector');
  await page.locator('#variant').selectOption('clean');await page.waitForFunction(()=>document.querySelector('#sheets svg path')?.getAttribute('d')?.startsWith('M4 9 '));
  await page.locator('#variant').selectOption('rough');await page.waitForFunction(()=>!document.querySelector('#sheets svg path')?.getAttribute('d')?.startsWith('M4 9 '));
  await page.locator('#stock').selectOption('all');
  report.startup={pageErrors:errors,stocksLoaded:true,cardCount:72,sampleCount:864,searchAndSelectors:true};
  fail(errors.length===0,'Browser startup errors');
  if(!preflight) {
    const raster=await page.evaluate(async documents=>{
      const canvas=document.createElement('canvas');canvas.width=canvas.height=20;const ctx=canvas.getContext('2d',{willReadFrequently:true});
      const result=[];
      for(const document of documents) {
        const source=document.svg.replace('var(--icon-stroke, 1.65)','1.8').replaceAll('currentColor','black');
        const image=new Image();image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(source);await image.decode();
        ctx.clearRect(0,0,20,20);ctx.drawImage(image,0,0,20,20);
        const data=ctx.getImageData(0,0,20,20).data;const mask=Array.from({length:400},(_,i)=>data[i*4+3]>=90?1:0);
        result.push({...document,svg:undefined,mask});
      }
      return result;
    },documents);
    report.silhouettes={pairsCompared:0,closestPairs:[],byVariant:{},failures:[]};
    for(const kind of ['clean','rough']) {
      const shapes=raster.filter(r=>r.kind===kind).map(r=>({...r,silhouette:silhouette(r.mask)}));
      const pairs=[];
      for(let i=0;i<shapes.length;i++)for(let j=i+1;j<shapes.length;j++) {
        const score=similarity(shapes[i].silhouette,shapes[j].silhouette);pairs.push({a:shapes[i].id,b:shapes[j].id,score});
        if(score>report.threshold)report.silhouettes.failures.push({kind,a:shapes[i].id,b:shapes[j].id,score});
      }
      pairs.sort((a,b)=>b.score-a.score);report.silhouettes.byVariant[kind]={pairsCompared:pairs.length,closestPairs:pairs.slice(0,15)};
      report.silhouettes.pairsCompared+=pairs.length;
    }
    fail(!report.silhouettes.failures.length,'Silhouette collision threshold exceeded');
    report.silhouettes.closestPairs=report.silhouettes.byVariant.rough.closestPairs;
    await writeFile(new URL('silhouette-masks.json',evidence),JSON.stringify(raster.map(r=>({id:r.id,kind:r.kind,mask:r.mask,silhouette:silhouette(r.mask)}))));
    // Use computed CSS from the sheet, not independent hardcoded styling.
    const samples=await page.evaluate(async()=>{
      const states={};
      for(const name of ['ink','pencil','faded']) {
        const sample=document.querySelector(`.sample[data-state="${name}"]`),css=getComputedStyle(sample);
        states[name]={colour:css.color.match(/[\d.]+/g).slice(0,3).map(Number),opacity:Number(css.opacity),width:css.getPropertyValue('--icon-stroke').trim(),dash:css.strokeDasharray};
      }
      const stocks={};
      for(const stock of ['linen','letter']) {
        const im=new Image();im.src=`/stocks/${stock}.png`;await im.decode();const c=document.createElement('canvas');c.width=im.width;c.height=im.height;
        const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(im,0,0);const d=ctx.getImageData(0,0,c.width,c.height).data;
        let min=Infinity,minRGB;
        const linear=v=>{v/=255;return v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4;};
        for(let i=0;i<d.length;i+=4) {const l=.2126*linear(d[i])+.7152*linear(d[i+1])+.0722*linear(d[i+2]);if(l<min){min=l;minRGB=[d[i],d[i+1],d[i+2]];}}
        stocks[stock]={darkestRGB:minRGB,pixelsScanned:c.width*c.height};
      }
      // 20px rendered stroke coverage per icon and state, including dash gaps.
      const coverage=[];
      const c=document.createElement('canvas');c.width=c.height=20;const ctx=c.getContext('2d',{willReadFrequently:true});
      for(const svg of document.querySelectorAll('.stock[data-stock="linen"] .sample[data-size="20"]')) {
        const style=getComputedStyle(svg);const copy=svg.cloneNode(true);copy.setAttribute('stroke-width',style.getPropertyValue('--icon-stroke').trim());
        copy.setAttribute('stroke-dasharray',style.strokeDasharray);copy.removeAttribute('class');copy.removeAttribute('style');
        const source=new XMLSerializer().serializeToString(copy).replaceAll('currentColor','black');
        const image=new Image();image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(source);await image.decode();ctx.clearRect(0,0,20,20);ctx.drawImage(image,0,0,20,20);
        const d=ctx.getImageData(0,0,20,20).data;let strongPixels=0,borderPixels=0,totalAlpha=0;
        for(let y=0;y<20;y++)for(let x=0;x<20;x++){const a=d[(y*20+x)*4+3]/255;totalAlpha+=a;if(a>=.5)strongPixels++;if((!x||!y||x===19||y===19)&&a>.1)borderPixels++;}
        coverage.push({id:svg.closest('.card').dataset.id,state:svg.dataset.state,strongPixels,totalAlpha,borderPixels});
      }
      return {states,stocks,coverage};
    });
    report.readability={minimumGraphicalContrast:3,minimumStrongPixels:10,states:samples.states,stocks:samples.stocks,results:[],coverage:samples.coverage,
      method:'At 20px require >=10 pixels of >=50% stroke coverage and no clipped border pixels. Contrast >=3:1 uses full-coverage stroke composited in sRGB on the darkest actual pixel of each 1024px stock, then transformed in linear sRGB for each simulation. Anti-aliased edge pixels are not claimed to meet 3:1. Legend text remains full ink. Human recognition remains a maker/reviewer judgment.'};
    // A round cap extends half a stroke width into each end of a dash gap.
    // Shorter nominal gaps disappear completely and fail the non-colour cue.
    for(const state of ['pencil','faded']) {
      const dash=samples.states[state].dash.match(/[\d.]+/g)?.map(Number)??[];
      fail(dash.length>=2&&dash[1]>Number(samples.states[state].width)+1,`Round caps conceal ${state} dash gaps`);
    }
    for(const [stock,background]of Object.entries(samples.stocks))for(const [state,style]of Object.entries(samples.states))for(const vision of ['normal',...Object.keys(matrices)]) {
      const composite=style.colour.map((n,i)=>n*style.opacity+background.darkestRGB[i]*(1-style.opacity));
      const ratio=contrast(simulate(composite,vision),simulate(background.darkestRGB,vision));
      report.readability.results.push({stock,state,vision,ratio});
      fail(ratio>=3,`Contrast below 3:1: ${stock}/${state}/${vision}: ${ratio}`);
    }
    for(const record of samples.coverage) {fail(record.strongPixels>=10,`Too little 20px stroke: ${record.id}/${record.state}`);fail(record.borderPixels===0,`20px clipping: ${record.id}/${record.state}`);}
    // Verify the actual sheet filters contain the selected matrix and linear space.
    report.colourVision={source:'https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html',doi:'10.1109/TVCG.2009.113',severity:1,colourSpace:'linear sRGB; output clipped to gamut and encoded to sRGB',matrices,views:[]};
    for(const type of Object.keys(matrices)) {
      await page.locator('#vision').selectOption(type);
      const active=await page.evaluate(type=>({selected:document.body.dataset.vision,filter:getComputedStyle(document.querySelector('#sheets')).filter,space:document.querySelector(`filter#${type}`).getAttribute('color-interpolation-filters'),matrix:document.querySelector(`filter#${type} feColorMatrix`).getAttribute('values')}),type);
      fail(active.selected===type&&active.filter.includes(type)&&active.space==='linearRGB',`CVD filter not active: ${type}`);
      report.colourVision.views.push({type,...active});
    }
    await page.locator('#vision').selectOption('normal');
    // 200% text zoom is not this request; verify ordinary narrower-sheet layout.
    await page.setViewportSize({width:1920,height:1080});
    fail(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'1920px sheet overflows');
    await page.setViewportSize({width:3440,height:1440});
    fail(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'3440px sheet overflows');
    if(capture&&report.failures.length===0) {
      for(const dpr of [1,2]) {
        const cc=await browser.newContext({viewport:{width:3440,height:1440},deviceScaleFactor:dpr});const cp=await cc.newPage();
        for(const stock of ['linen','letter']) {
          const visions=dpr===1?['normal',...Object.keys(matrices)]:['normal'];
          for(const vision of visions) {
            await cp.goto(`${base}/?stock=${stock}&vision=${vision}`,{waitUntil:'networkidle'});await cp.waitForSelector('body[data-ready="true"]');
            const name=`sheet-${stock}-${vision}-${dpr}x.png`;
            await cp.screenshot({path:fileURLToPath(new URL(name,evidence)),fullPage:true});
            report.screenshots.push({file:name,stock,vision,deviceScaleFactor:dpr,viewport:{width:3440,height:1440},sha256:hash(await readFile(new URL(name,evidence)))});
            if(dpr===1&&vision==='normal') {
              const layout=await cp.locator('.card:visible').evaluateAll(cards=>cards.map(card=>({
                id:card.dataset.id,label:card.querySelector('h3').textContent,
                marks:[...card.querySelectorAll('svg[data-size="20"]')].map(svg=>{const r=svg.getBoundingClientRect();return {state:svg.dataset.state,x:r.x+scrollX,y:r.y+scrollY,width:r.width,height:r.height};})
              })));
              await writeFile(new URL(`layout-${stock}.json`,evidence),JSON.stringify(layout,null,2));
            }
          }
        }
        await cc.close();
      }
      await page.setViewportSize({width:1920,height:1080});
      await page.goto(`${base}/?stock=linen`,{waitUntil:'networkidle'});await page.waitForSelector('body[data-ready="true"]');
      await page.screenshot({path:fileURLToPath(new URL('sheet-1920-overview.png',evidence))});
      report.screenshots.push({file:'sheet-1920-overview.png',viewport:{width:1920,height:1080},deviceScaleFactor:1,sha256:hash(await readFile(new URL('sheet-1920-overview.png',evidence)))});
    }
  }
  await context.close();
} catch(error) {report.failures.push(error.stack??String(error));}
finally {if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
report.pass=report.failures.length===0;
const file=capture?'capture-results.json':preflight?'preflight-results.json':'checks.json';
await writeFile(new URL(file,evidence),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({pass:report.pass,mode:report.mode,icons:icons.length,failures:report.failures,closestPairs:report.silhouettes?.closestPairs.slice(0,5),screenshots:report.screenshots.length,evidence:file},null,2));
process.exitCode=report.pass?0:1;
