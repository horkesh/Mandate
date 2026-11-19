import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage();
const runtime=await page.evaluate(()=>{
  const canvas=document.createElement('canvas'),gl=canvas.getContext('webgl2')!;
  const extension=gl.getExtension('WEBGL_debug_renderer_info');
  return {userAgent:navigator.userAgent,devicePixelRatio:devicePixelRatio,renderer:extension?gl.getParameter(extension.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),vendor:extension?gl.getParameter(extension.UNMASKED_VENDOR_WEBGL):gl.getParameter(gl.VENDOR),maxTextureSize:gl.getParameter(gl.MAX_TEXTURE_SIZE)};
});
writeFileSync('../../art-masters/R23/browser-runtime.json',JSON.stringify(runtime,null,2));
await browser.close();console.log(JSON.stringify(runtime));

