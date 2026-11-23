import { expect, it } from 'vitest';
import { checkpointScore, checkpointsScore, type Observations } from '../src/history-run.ts';
import type { Checkpoint, Checkpoints } from '@mandate/pack-format';

const row = {id:'men',kind:'men',date:'1861-03-06',faction:'north',min:100,max:200,floorBinding:true,cite:'fictional strength p.1'} as Checkpoint;
const observation = (known:number,unknownBlocks:number):Observations => ({lastDay:1,warSince:{north:1},battles:new Map(),operations:new Map(),responses:[],notHeld:new Map(),unpaidFloors:[],snapshots:new Map([[1,{day:1,sides:{},kinds:{},holders:{},men:{north:{known,unknownBlocks}}}]])});
const bands = (rows:Checkpoint[]):Checkpoints => ({checkpoints:rows,pushback:[],victory:{capital:0,government:0,menShare:0,groundShare:0,mandate:0,cite:'fictional p.1'}});

it('an unknown population below a binding floor is unresolved and never passes',()=>{
  const s=checkpointScore(row,observation(50,1),'1861-03-05');
  expect(s).toMatchObject({verdict:'unresolved'});
  expect(s.problems.length).toBeGreaterThan(0);
  expect(checkpointScore(row,observation(50,0),'1861-03-05')).toMatchObject({verdict:'fail'});
  expect(checkpointScore(row,observation(150,1),'1861-03-05')).toMatchObject({verdict:'pass'});
});

it('a ceiling failure outranks unresolved in combined checkpoints',()=>{
  const second={...row,id:'ceiling',min:0,max:10} as Checkpoint;
  expect(checkpointsScore(bands([row,second]),observation(50,1),'1861-03-05',false)).toMatchObject({verdict:'fail'});
});

it('uses a command return only at its exact dated disjoint scope, without adding its constituents',()=>{
  const obs=observation(20,1);
  const snap=obs.snapshots.get(1)!;
  const lots=[{id:'returned',faction:'north',department:'command',men:20,source:'fictional roll p.1'},{id:'missing',faction:'north',department:'command',men:null,source:null}];
  const input={...obs,snapshots:new Map([[1,{...snap,lots}]])};
  const group={id:'whole',kind:'return',date:'1861-03-06',department:'command',members:['missing','returned'],min:100,max:100,cite:'fictional whole-command roll p.2',membershipSource:'fictional reconciled membership p.3'};
  const k={...row,min:100,max:100,groups:[group]} as Checkpoint;
  expect(checkpointScore(k,input,'1861-03-05')).toMatchObject({verdict:'pass',problems:[]});
  expect(checkpointScore({...k,groups:[{...group,members:['returned']}]} as Checkpoint,input,'1861-03-05')).toMatchObject({verdict:'fail'});
  expect(checkpointScore({...k,groups:[{...group,date:'1861-03-05'}]} as Checkpoint,input,'1861-03-05')).toMatchObject({verdict:'fail'});
  expect(checkpointScore({...k,groups:[group,group]} as Checkpoint,input,'1861-03-05')).toMatchObject({verdict:'fail'});
  const {department:_,...commandGroup}=group;
  expect(checkpointScore({...k,groups:[{...commandGroup,post:'army'}]} as Checkpoint,{...input,snapshots:new Map([[1,{...snap,lots,commandMembers:{army:['returned','missing']}}]])},'1861-03-05')).toMatchObject({verdict:'pass'});
});

it('fails duplicated personnel even when an unknown population could close a floor gap',()=>{
  const obs=observation(50,1),snap=obs.snapshots.get(1)!;
  const lot={id:'duplicated',faction:'north',department:'command',men:25,source:'fictional p.1'};
  expect(checkpointScore(row,{...obs,snapshots:new Map([[1,{...snap,lots:[lot,lot]}]])},'1861-03-05')).toMatchObject({verdict:'fail'});
});
