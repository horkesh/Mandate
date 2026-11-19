import { icons } from './catalog.mjs';
import { strings as s } from './strings.mjs';
import { matrices,filterMatrix } from './vision.mjs';
const params=new URLSearchParams(location.search);
const options={stock:params.get('stock')??'all',variant:params.get('variant')??'rough',vision:params.get('vision')??'normal'};
for(const [name,values] of Object.entries({stock:['all','linen','letter'],variant:['rough','clean'],vision:['normal',...Object.keys(matrices)]})) if(!values.includes(options[name]))options[name]=values[0];
document.title=s.title;
document.querySelector('#heading').innerHTML=`<h1>${s.title}</h1><p>${s.intro}</p>`;
const controls=document.querySelector('#controls');
for(const [key,values] of Object.entries({stock:['all','linen','letter'],variant:['rough','clean'],vision:['normal',...Object.keys(matrices)]})) {
  const label=document.createElement('label');label.textContent=s[key];
  const select=document.createElement('select');select.name=key;select.id=key;
  for(const value of values) {const opt=new Option(s[value],value,value===options[key],value===options[key]);select.add(opt);}
  label.append(select);controls.append(label);
}
const searchLabel=document.createElement('label');searchLabel.textContent=s.search;
const search=document.createElement('input');search.id='search';search.type='search';searchLabel.append(search);controls.append(searchLabel);
controls.addEventListener('submit',event=>event.preventDefault());
document.querySelector('#notes').innerHTML=[s.stateNote,s.sourceNote,s.slotsNote].map(t=>`<p>${t}</p>`).join('');
document.querySelector('#footer').innerHTML=`<p>${s.draftNote}</p><p>${s.reservedNote}</p><p>${s.spareNote}</p><p>${s.simulationNote} <a href="https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html">Machado et al., 2009</a></p>`;
const filter=document.createElementNS('http://www.w3.org/2000/svg','svg');
filter.classList.add('vision-filter');filter.setAttribute('aria-hidden','true');
filter.innerHTML=`<defs>${Object.keys(matrices).map(type=>`<filter id="${type}" color-interpolation-filters="linearRGB"><feColorMatrix type="matrix" values="${filterMatrix(type)}"/></filter>`).join('')}</defs>`;
document.body.append(filter);
let loadedVariant;
async function render() {
  document.body.dataset.vision=options.vision;
  if(loadedVariant!==options.variant) {
    const sources=await Promise.all(icons.map(async icon=>{
      const response=await fetch(`./icons/${options.variant}/${icon.id}.svg`);
      if(!response.ok)throw Error(`Missing SVG: ${icon.id}`);
      return response.text();
    }));
    const main=document.querySelector('#sheets');main.replaceChildren();
    for(const stock of ['linen','letter']) {
      const section=document.createElement('section');section.className='stock';section.dataset.stock=stock;
      section.innerHTML=`<div class="stock-heading"><h2>${s[stock]}</h2></div><div class="cards"></div>`;
      for(let i=0;i<icons.length;i++) {
        const icon=icons[i];const article=document.createElement('article');article.className='card';article.dataset.id=icon.id;
        article.setAttribute('aria-label',s.labels[icon.id]);
        article.innerHTML=`<h3>${s.labels[icon.id]}</h3><div class="samples"><span></span>${[20,24,48,96].map(size=>`<span class="size">${size} px</span>`).join('')}</div>`;
        const samples=article.querySelector('.samples');
        for(const state of ['ink','pencil','faded']) {
          const label=document.createElement('span');label.className='state-label';label.textContent=s[state];samples.append(label);
          for(const size of [20,24,48,96]) {
            const cell=document.createElement('span');cell.className='cell';cell.innerHTML=sources[i];
            const svg=cell.firstElementChild;svg.classList.add('sample');svg.dataset.state=state;svg.dataset.size=size;
            svg.setAttribute('width',size);svg.setAttribute('height',size);svg.setAttribute('role','img');svg.setAttribute('aria-label',`${s.labels[icon.id]}, ${s[state]}, ${size} px`);
            samples.append(cell);
          }
        }
        section.querySelector('.cards').append(article);
      }
      main.append(section);
    }
    loadedVariant=options.variant;
  }
  for(const stock of document.querySelectorAll('.stock'))stock.hidden=options.stock!=='all'&&options.stock!==stock.dataset.stock;
  applySearch();
  document.body.dataset.ready='true';
}
function applySearch() {
  const term=search.value.trim().toLowerCase();
  for(const card of document.querySelectorAll('.card')) card.hidden=!s.labels[card.dataset.id].toLowerCase().includes(term);
}
search.addEventListener('input',applySearch);
for(const select of controls.querySelectorAll('select')) select.addEventListener('change',async()=>{
  options[select.name]=select.value;
  const url=new URL(location.href);for(const [key,value]of Object.entries(options))url.searchParams.set(key,value);
  history.replaceState(null,'',url);await render();
});
await render();
