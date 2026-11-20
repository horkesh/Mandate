/** Browser fixture for the actual weekly paper, source link and newspaper components. */
import {useState} from 'react';
import {createRoot} from 'react-dom/client';
import type {ReportView} from '@mandate/kernel/seat-api';
import type {DeskSnapshot} from '../web/adapter.ts';
import {WeeklyPaper} from '../web/InTray.tsx';
import {Paper} from '../web/App.tsx';
import {presenter} from '../web/presentation.ts';
import {dateOfPaper} from '../web/intray.ts';
import '../web/style.css';
function Fixture({data}:{data:DeskSnapshot}){
  const [paper,setPaper]=useState<ReportView|null>(null),{name,text}=presenter(data.strings);
  return <main style={{padding:32,maxWidth:900,margin:'auto'}}>{paper?<><button onClick={()=>setPaper(null)}>Return to the week's papers</button>
    <Paper report={paper} text="" t={name} dateOf={day=>dateOfPaper(data,day)} plain={true} display={text}/></>:
    <WeeklyPaper data={data} openPaper={setPaper}/>}</main>;
}
fetch('/api/desk').then(r=>r.json()).then((data:DeskSnapshot)=>createRoot(document.getElementById('root')!).render(<Fixture data={data}/>));
