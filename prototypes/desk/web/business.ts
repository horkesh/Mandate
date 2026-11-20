import type {PrincipalMenu,SeatRequest} from '@mandate/kernel/seat-api';
import type {DeskSnapshot} from './adapter.ts';
import {S} from './strings.ts';

export interface Price {min:number;max:number}
export function outOfAttention(left:number|null,price:Price|null){return left!==null&&price!==null&&price.min>left;}
/** Display only prices explicitly supplied by the principal menu. */
export function commandPrice(line:string,menu:PrincipalMenu):Price|null {
 const words=line.trim().split(/\s+/),verb=words[0]??'';
 if(!verb)return null;
 const key=({approve:'review_approve',sendback:'review_send_back',edit:'review_edit',call:'order'} as Record<string,string>)[verb]??verb;
 const extra=words.includes('by=special-messenger')?menu.attention.specialMessenger:0;
 if(verb==='decide'){
  if(words.length===2)return {min:0,max:0};
  const prices=[menu.attention.costs.decide_staff,menu.attention.costs.decide_overrule];
  if(prices.some(p=>p===undefined))return null;
  return {min:Math.min(...prices as number[]),max:Math.max(...prices as number[])};
 }
 const price=menu.attention.costs[key];
 return price===undefined?null:{min:price+extra,max:price+extra};
}
export function priceLabel(price:Price|null):string {
 return price===null?S.priceMissing:price.max===0?S.free:price.min===price.max?S.priceAmount(price.min):S.priceRange(price.min,price.max);
}
export function received(request:SeatRequest){return request.view.reports.filter(r=>r.day<=request.view.day&&r.receivedDay<=request.view.day);}
export function ledgerRows(data:DeskSnapshot){
 // Only the shell's own acts and received situation statuses. No Congress inference.
 return data.history.flatMap((turn,index)=>(turn.submitted??[]).map((order,occurrence)=>({
  id:`${index}:${occurrence}`,line:order.line,text:order.text,date:turn.days[0]?.date??S.unknown,
  refusal:turn.days[0]?.refused.find(r=>r.commandIndex===occurrence)?.reason??null,
  turn:index+1,
 })));
}
