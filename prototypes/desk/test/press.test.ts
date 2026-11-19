import {expect,it} from 'vitest';
import type {ReportView} from '@mandate/kernel/seat-api';
import {pressStories} from '../web/press.ts';
import {pressStories as consoleStories} from '../../../packages/cli/src/desk/press.ts';
import {packStrings} from '../../../packages/cli/src/seats-world.ts';

it('browser and CLI render the same pack stories, keeping the captured with their battle',()=>{
  const strings=packStrings('testbed'),t=(key:string)=>strings[key]??key;
  const paper={type:'press',claims:[
    {kind:'battle-result',battle:'one',region:'w_valley',token:'lost',value:90,confidence:900,commander:'n_fighter'},
    {kind:'captured',battle:'two',region:'w_valley',value:30,confidence:900},
    {kind:'battle-result',battle:'two',region:'w_valley',token:'drawn',value:60,confidence:900,commander:null},
    {kind:'framing',region:null,value:-100,confidence:1000},
  ]} as unknown as ReportView;
  const stories=pressStories(paper,t);
  expect(stories).toEqual(consoleStories(paper,t));
  expect(stories).toHaveLength(3);
  expect(stories[0]!.body).not.toContain('30');
  expect(stories[1]!.body).toContain('Of these, 30 are listed as captured.');
  expect(stories[2]!.body).toContain('its own side');
});
