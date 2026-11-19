import {mkdirSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {ConsoleGame} from '../../../packages/cli/src/console/game.ts';
import {DeskAdapter} from '../server/adapter.ts';

const out=fileURLToPath(new URL('../../../art-masters/R66/',import.meta.url));
mkdirSync(out,{recursive:true});
const game=new ConsoleGame({pack:'union-1861',atWar:true}),desk=new DeskAdapter(game);
const opening=desk.snapshot();
if(opening.morning.menu.menuKind!=='principal')throw Error('Principal menu required');
const visitor=opening.morning.menu.commandable.find(p=>p.post==='us_general_in_chief')??opening.morning.menu.commandable[0];
if(!visitor)throw Error('No visitor on the menu');
writeFileSync(`${out}/opening.json`,JSON.stringify(opening));
desk.execute(`order ${visitor.post} hold`);
const turn=desk.execute('end');
if(!turn.ok)throw Error('Goal turn failed');
writeFileSync(`${out}/scene.json`,JSON.stringify(desk.snapshot()));
writeFileSync(`${out}/fixture.json`,JSON.stringify({visitor:visitor.post,holder:visitor.holder,openingDay:opening.morning.requestDay,sceneDay:desk.snapshot().morning.requestDay,turnDays:turn.turn?.days.length,commands:game.log},null,2));
console.log(JSON.stringify({visitor:visitor.post,day:desk.snapshot().morning.requestDay}));
