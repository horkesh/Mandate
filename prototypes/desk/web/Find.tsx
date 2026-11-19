import { useEffect, useState } from 'react';
import type { CommandablePost } from '@mandate/kernel/seat-api';
import { deskApi } from './adapter.ts';
import type { DeskSnapshot } from './adapter.ts';
import type { MapGeometry } from './map/model.ts';
import { presenter } from './presentation.ts';
import { S } from './strings.ts';

export function Find({ data, region, person }: { data: DeskSnapshot; region: (id: string) => void; person: (post: CommandablePost) => void }) {
  const [query, setQuery] = useState('');
  const [geometry, setGeometry] = useState<MapGeometry | null>(null);
  useEffect(() => { let alive = true; deskApi.geometry(data.pack).then(g => { if (alive) setGeometry(g); }).catch(() => {}); return () => { alive = false; }; }, [data.pack]);
  const { name: t } = presenter(data.strings);
  const match = (value: string) => value.toLowerCase().includes(query.toLowerCase());
  return <><label>{S.find}<input autoFocus aria-label={S.find} value={query} onChange={e => setQuery(e.target.value)}/></label>
    <ul className="find-results">{data.morning.menu.menuKind === 'principal' && data.morning.menu.commandable.filter(p => match(`${t(p.holder, 'person')} ${t(p.post, 'post')}`)).map(p => <li key={p.post}><button onClick={() => person(p)}>{t(p.holder, 'person')}, {t(p.post, 'post')}</button></li>)}
      {geometry?.regions.filter(r => r.point && match(t(r.id, 'region'))).map(r => <li key={r.id}><button onClick={() => region(r.id)}>{t(r.id, 'region')}</button></li>)}</ul></>;
}
