import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { seatsWorld } from '../../../packages/cli/src/seats-world.ts';

it('0136 reads the sending terms in Fairbanks acknowledgement without using his promised departure as an order',()=>{
  const {world}=seatsWorld('union-1861');
  const p=world.map.world.rules.allocationInstruments!.find(p=>p.id==='s152_vermont_second')!;
  expect(p).toMatchObject({fromDate:'1861-06-03',issuer:'lincoln_abraham',from:'st_gov_vermont',
    to:'us_dept_washington',destination:'washington',scope:{kind:'named',regiments:['vt_2_infantry']},quantity:1,modes:['rail']});
  expect(p.source).toContain('[I]');expect(p.source).toContain('1861-06-04');expect(p.source).toContain('pp.254-255');
  expect(p).not.toHaveProperty('continuing');
});

it('keeps national sending, onward holding, and a stated intermediate destination distinct',()=>{
  const {world}=seatsWorld('union-1861');
  const papers=world.map.world.rules.allocationInstruments!;
  expect(papers.find(p=>p.id==='s152_minnesota_first')).toMatchObject({from:'st_gov_minnesota',to:'us_dept_pennsylvania',destination:'harrisburg',fromDate:'1861-06-14',scope:{kind:'named',regiments:['mn_1_infantry']}});
  expect(papers.find(p=>p.id==='s152_third_michigan_harrisburg')).toMatchObject({issuer:'scott_winfield',from:'us_dept_pennsylvania',atRegion:'harrisburg',to:'us_dept_washington',destination:'washington',scope:{kind:'named',regiments:['mi_3_infantry']}});
  expect(papers.find(p=>p.id==='s152_louisiana_sixth')).toMatchObject({issuer:'davis_jefferson',from:'cs_forces_virginia',atRegion:'lynchburg',to:'cs_cmd_manassas',scope:{kind:'named',regiments:['la_6_infantry']}});
  expect(papers.find(p=>p.id==='s152_gordon_williamsport')).toMatchObject({issuer:'scott_winfield',from:'st_gov_massachusetts',to:'us_dept_pennsylvania',destination:'western_maryland',scope:{kind:'named',regiments:['ma_2_infantry']}});
});

it('accounts for both research inventories and does not turn witnesses or unrepresentable conditions into movement',()=>{
  const rows=JSON.parse(readFileSync('docs/audit/s152-evidence/instrument-disposition.json','utf8')) as {
    research:string;instrument:string;disposition:string;declarationIds:string[];gap:string;citation:string;evidenceKind:string;
  }[];
  expect(rows.filter(r=>r.research==='S149')).toHaveLength(109);
  expect(rows.filter(r=>r.research==='S151')).toHaveLength(92);
  for(const r of rows){
    expect(r.citation.length).toBeGreaterThan(0);
    if(['retrospective_movement_report','departure_and_receipt_report','state_departure_table','later_register','receipt_report'].includes(r.evidenceKind))expect(r.declarationIds).toEqual([]);
    if(['named_gap','partial'].includes(r.disposition))expect(r.gap.length).toBeGreaterThan(20);
  }
  expect(rows.find(r=>r.research==='S151'&&r.instrument==='C04')).toMatchObject({disposition:'named_gap',declarationIds:[]});
  expect(rows.find(r=>r.research==='S151'&&r.instrument==='X03')!.gap).toContain('1861-05-26');
  expect(rows.find(r=>r.research==='S151'&&r.instrument==='P13')!.declarationIds).toEqual(['s141_cameron_july13_five','s141_cameron_july13_remainder']);
});
