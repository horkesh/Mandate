import { createRoot } from 'react-dom/client';
import { App } from './App.tsx';
import './style.css';
import './accessibility.css';
import './documents.css';
import { MapStudy } from './map/Study.tsx';
createRoot(document.getElementById('root')!).render(new URLSearchParams(window.location.search).get('study')==='1'?<MapStudy/>:<App />);
