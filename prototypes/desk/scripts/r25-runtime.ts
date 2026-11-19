import {chromium} from '@playwright/test';
import {writeFileSync} from 'node:fs';
const browser=await chromium.launch({headless:true});const page=await browser.newPage();
const info=await page.evaluate(()=>{const c=document.createElement('canvas'),g=c.getContext('webgl2')!,e=g.getExtension('WEBGL_debug_renderer_info');return {userAgent:navigator.userAgent,devicePixelRatio,renderer:e?g.getParameter(e.UNMASKED_RENDERER_WEBGL):g.getParameter(g.RENDERER),vendor:e?g.getParameter(e.UNMASKED_VENDOR_WEBGL):g.getParameter(g.VENDOR),maxTextureSize:g.getParameter(g.MAX_TEXTURE_SIZE)};});
writeFileSync('../../art-masters/R25/browser-runtime.json',JSON.stringify(info,null,2));await browser.close();console.log(JSON.stringify(info));
