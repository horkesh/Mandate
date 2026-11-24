import { describe, expect, it } from 'vitest';
import { seatsWorld } from '../src/seats-world.ts';
import { createState } from '../../kernel/src/tick/setup.ts';

describe('S123 sourced standing assignments', () => {
  it('declares five standing offices for the four commanders with explicit source, bounds and referenced forces', () => {
    const {world}=seatsWorld('union-1861');
    const papers=world.map.world.rules.mandates ?? [];
    expect(papers.filter(p => p.grant.mandateRevision===1 && !p.id.startsWith('s147_'))).toHaveLength(5);
    expect(papers.filter(p=>p.id.startsWith('s147_')).map(p=>p.id).sort()).toEqual(['s147_mansfield_go12','s147_mcdowell_go26']);
    expect(papers.map(p => p.grant.mandateHolder)).toEqual(expect.arrayContaining(['scott_winfield','patterson_robert','lee_robert_e','johnston_joseph_e']));
    for (const p of papers) {
      expect(p.source).toMatch(/p\.|pp\./);
      expect(p.grant.mandateCeiling?.ceilingMen).toBeNull();
      expect(p.grant.mandateGuard).toBeNull();
      expect(p.grant.mandateExpires).toBeNull();
    }
    const state=createState(world,{seed:world.start.seed});
    expect(state.authorityByPost ?? {}).toEqual({});
  });
  it('keeps the GO12 standing scope inside its sourced department and outside the conservative corridor overlap', () => {
    const {world}=seatsWorld('union-1861');
    const p=world.map.world.rules.mandates?.find(p => p.grant.mandateHolder==='patterson_robert')!;
    expect(p.grant.mandateRegions).toEqual(expect.arrayContaining(['philadelphia','delaware','western_maryland']));
    expect(p.grant.mandateRegions).not.toEqual(expect.arrayContaining(['harpers_ferry']));
    for (const g of world.start.governments.filter(g => g.department==='st_virginia')) expect(p.grant.mandateRegions).not.toContain(g.region);
    expect(p.grant.mandateRegions).not.toContain('southern_maryland');
    expect(p.source).toContain('p.607');
  });
  it('declares Lee under his governor without fabricating his appointment or receipt', () => {
    const {world}=seatsWorld('union-1861');
    const p=world.map.world.rules.mandates?.find(p => p.grant.mandateHolder==='lee_robert_e')!;
    expect(p.grant.mandateIssuerPost).toBe('st_gov_virginia');
    const template=world.start.temporaryPosts.find(t => t.id===p.grant.mandatePost)!;
    expect(template.parent).toBe('st_gov_virginia');
    expect(world.start.posts.some(t => t.id===p.grant.mandatePost)).toBe(false);
  });
});
