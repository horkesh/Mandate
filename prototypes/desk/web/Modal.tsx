import { useLayoutEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { isTyping } from './settings.ts';
import { S } from './strings.ts';

/** A single dialog owns nesting, Escape, keyboard containment and focus restoration. */
export function Modal({ depth, title, back, children, opener, reading, wide=false,kind }: {
  depth: number; title: string; back: () => void; children: ReactNode;
  opener: HTMLElement | null; reading: boolean; wide?: boolean;kind?:string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const previous = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    if (depth > 0 && !dialog.current?.open) {
      previous.current = opener;
      dialog.current?.showModal();
    } else if (depth === 0 && dialog.current?.open) {
      dialog.current.close();
      previous.current?.focus();
    }
  }, [depth, opener]);
  useLayoutEffect(() => { if (depth) heading.current?.focus(); }, [depth, title]);
  return <dialog ref={dialog} data-kind={kind} aria-labelledby="panel-title" className={wide ? 'review-dialog' : reading ? 'reading-dialog' : ''}
    onCancel={event => { event.preventDefault(); if (!isTyping(document.activeElement)) back(); }}
    onKeyDown={event => {
      if (event.key !== 'Tab') return;
      const targets = [...dialog.current!.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [href], [tabindex="0"]')].filter(el => el.getClientRects().length);
      const first = targets[0], last = targets.at(-1);
      if (event.shiftKey && (document.activeElement === first || document.activeElement === heading.current)) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }}>
    <header className="panel-header"><div><span className="eyebrow">{S.subtitle}</span><h2 id="panel-title" tabIndex={-1} ref={heading}>{title}</h2></div>
      <button className="close" onClick={back}>{depth > 1 ? S.back : S.close}<span aria-hidden="true"> ↶</span></button></header>
    <div className="panel-body">{children}</div>
  </dialog>;
}
