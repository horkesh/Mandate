import {expect,it} from 'vitest';
import {strengthText} from '../web/strength.ts';
import {buildMapModel,type MapGeometry} from '../web/map/model.ts';
import {ConsoleGame} from '../../../packages/cli/src/console/game.ts';
import {phase0,ids} from '@mandate/kernel';
import {observeStrength} from '../../../packages/kernel/src/knowledge/strength.ts';

it('renders a partial component with its unknown remainder and keeps an unknown contact on the map',()=>{
  const r=ids.toId('region','salient_tip');
  const s=observeStrength({observer:ids.toId('person','observer'),region:r,day:2,scope:'region',presence:true,coverage:'partial',counts:[{countKind:'formed_battalions',count:2,compatible:true}],conditions:'Fictional visible formation'});
  expect(strengthText(null,s)).toBe('1200–1400 [I] + unknown remainder');
  expect(strengthText(null)).toBe('unknown');
  const request=structuredClone(new ConsoleGame({pack:'testbed'}).morning());
  const paper={id:'paper.unknown',author:'observer',authorPost:null,day:2,receivedDay:2,type:'enemy-estimate',subtype:null,subjectKind:'region',subjectId:r,claims:[{kind:'enemy-estimate-unknown',region:r,value:0,token:null,confidence:700,strength:s}],hour:null,advice:null,answers:null,route:'courier',via:[]};
  (request.view as any).reports=[paper];(request.view as any).enemyBeliefs={[r]:{value:null,asOfDay:2,source:paper.id,strength:s}};
  const geometry={version:1,pack:'testbed',schematic:true,regions:[{id:r,name:r,kind:'land',point:[1,1],shape:null,label:{anchor:null,spine:[],size:null,minZoom:null}}],base:[]} as MapGeometry;
  const before=JSON.stringify(request);const model=buildMapModel(request,geometry);
  expect(model.marks.filter(m=>m.kind==='enemy')).toMatchObject([{value:null,strengthLabel:'1200–1400 [I] + unknown remainder'}]);
  expect(JSON.stringify(request)).toBe(before);
});
