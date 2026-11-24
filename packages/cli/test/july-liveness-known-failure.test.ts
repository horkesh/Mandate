import {expect,it} from 'vitest';
import {unexpectedJulyFailures} from './support/july-liveness-known-failure.ts';

it('keeps a new dead floor and a new failure kind visible beside known July failures',()=>{
 const known={mechanic:'combat.flank_broken',problem:'dead'};
 const newFloor={mechanic:'recruitment.called',problem:'dead'};
 const newKind={mechanic:'combat.battle_opened',problem:'dead'};
 expect(unexpectedJulyFailures([known,newFloor,newKind])).toEqual([newFloor,newKind]);
});
it('permits known July diagnostics to recover without treating recovery as a new failure',()=>{
 expect(unexpectedJulyFailures([])).toEqual([]);
 expect(unexpectedJulyFailures([{mechanic:'movement.arrived',problem:'too_frequent'}])).toEqual([]);
});
