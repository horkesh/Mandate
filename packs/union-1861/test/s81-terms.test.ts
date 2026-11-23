import {it,expect} from 'vitest';
import {seatsWorld} from '../../../packages/cli/src/seats-world.ts';
it('S81 applies seven scoped S76 federal terms without turning a war contract into days',()=>{
 const {world}=seatsWorld('union-1861');const rows=world.map.world.regimentCatalogue!;
 for(const id of ['me_3_infantry','me_4_infantry','me_5_infantry','me_6_infantry','ri_2_infantry'])expect(rows.find(r=>r.id===id)!.termDays).toEqual([1095]);
 expect(rows.find(r=>r.id==='ri_1_infantry')!.termDays).toEqual([90]);
 expect(rows.find(r=>r.id==='la_washington_battalion_artillery')).toMatchObject({termDays:[],warTerm:true});
 for(const id of ['me_3_infantry','me_4_infantry','me_5_infantry','me_6_infantry'])expect(rows.find(r=>r.id===id)!.observations.some(o=>o.observationKind==='original_term'&&o.evidence.authority==='Maine'&&o.evidence.term_value==='2')).toBe(true);
});
