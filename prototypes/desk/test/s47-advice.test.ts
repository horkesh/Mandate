import {expect,it} from 'vitest';
import * as business from '../web/business.ts';
const known:any={id:'received',title:'known.title',surfacedDay:1,options:[{id:'formal_message',label:'known.message'}]};
const request:any={view:{day:5,situations:[known],reports:[]}};
const strings={'known.title':'Congress meets','known.message':'Ask for men and money','situation.hidden.option.formal_message':'Undelivered alternative'};
const reply:any={id:'reply',day:4,receivedDay:5,subjectKind:'post',subjectId:'cabinet',claims:[{kind:'verb-answered',token:'consult:comply'}],advice:{recommends:'formal_message',reasons:[{kind:'civil_supremacy',weight:1000}]}};
it('resolves consultation advice from received option labels without reading an authored alternative',()=>{
 expect((business as any).recommendationText).toBeTypeOf('function');
 const label=(business as any).recommendationText(request,strings,reply);
 expect(label).toBe('Ask for men and money');
 expect((business as any).recommendationText(request,{...strings,'situation.hidden.option.formal_message':'Changed hidden truth'},reply)).toBe(label);
});
it('does not borrow ambiguous, future or unreceived recommendation wording',()=>{
 expect((business as any).recommendationText).toBeTypeOf('function');
 const ambiguous={view:{...request.view,situations:[known,{...known,id:'other',options:[{id:'formal_message',label:'other.message'}]}]}};
 expect((business as any).recommendationText(ambiguous,{...strings,'other.message':'A different act'},reply)).toBe('Recommendation wording is not supplied.');
 const future={view:{...request.view,situations:[{...known,surfacedDay:6}]}};
 expect((business as any).recommendationText(future,strings,reply)).toBe('Recommendation wording is not supplied.');
 expect((business as any).recommendationText(request,strings,{...reply,receivedDay:6})).toBeNull();
});
it('uses the exact situation subject for staff advice when option IDs collide',()=>{
 expect((business as any).recommendationText).toBeTypeOf('function');
 const both={view:{...request.view,situations:[known,{...known,id:'other',options:[{id:'formal_message',label:'other.message'}]}]}};
 expect((business as any).recommendationText(both,{...strings,'other.message':'A different act'},{...reply,subjectKind:'situation',subjectId:'received'})).toBe('Ask for men and money');
});
it('renders received political paper subjects and stated reasons without hidden scores',()=>{
 expect((business as any).politicalPaperText).toBeTypeOf('function');
 const r={...reply,subjectKind:'situation',subjectId:'received'};
 const text=(business as any).politicalPaperText(request,strings,r,'about situation received | recommends formal_message (civil_supremacy)');
 expect(text).toContain('Congress meets');expect(text).toContain('Ask for men and money');expect(text).toContain('civil supremacy');
 expect(text).not.toContain('1000');expect(text).not.toContain('formal_message');
 expect((business as any).politicalPaperText(request,strings,{...r,day:6},'future secret')).not.toContain('future secret');
});
it('shows a governor?s declared call response rather than treating zero as a refusal',()=>{
 expect((business as any).politicalPaperText).toBeTypeOf('function');
 const r={...reply,advice:null,claims:[{kind:'call-answer',token:'comply',value:0}]};
 expect((business as any).politicalPaperText(request,strings,r,'call-answer 0')).toContain('The governor declares compliance');
 expect((business as any).politicalPaperText(request,strings,{...r,claims:[{kind:'call-answer',token:'refuse',value:0}]},'call-answer 0')).toContain('The governor refuses the call');
});

it('retains directly supplied wording for generic advice without guessing a situation key',()=>{
 expect((business as any).recommendationText).toBeTypeOf('function');
 const generic={...reply,claims:[],advice:{...reply.advice,recommends:'wait'}};
 expect((business as any).recommendationText(request,{...strings,wait:'Wait for supplies'},generic)).toBe('Wait for supplies');
});
