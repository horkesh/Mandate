import { expect, it } from 'vitest';
import { presenter, missingNameKeys } from '../web/presentation.ts';
import { S } from '../web/strings.ts';

it('uses supplied name keys and direct keys without guessing a title from an identifier', () => {
  const strings = { 'person.johnston_albert_s.name':'Albert S. Johnston', 'post.us_dept_pacific.name':'Department of the Pacific', 'region.dc.name':'Washington', 'label.full':'Full label' };
  const p = presenter(strings);
  expect(p.name('johnston_albert_s')).toBe('Albert S. Johnston');
  expect(p.name('us_dept_pacific')).toBe('Department of the Pacific');
  expect(p.name('dc')).toBe('Washington');
  expect(p.name('label.full')).toBe('Full label');
  expect(p.name('missing_person')).toBe(S.unknown);
  expect(missingNameKeys()).toContain('missing_person');
  expect(p.text('inquire us_dept_pacific; position at dc')).toBe('inquire Department of the Pacific; position at Washington');
  const line='edit us_dept_pacific remove_axis axis=main';
  expect(p.commandDisplay(line)).toBe('edit ‹Department of the Pacific› ‹remove axis› axis=main');
  expect(p.commandInput(p.commandDisplay(line),line)).toBe(line);
  expect(p.commandInput('inquire ‹Department of the Pacific›','')).toBe('inquire us_dept_pacific');
});

it('keeps ambiguous names unknown and preserves ordinary console prose', () => {
  const p=presenter({'person.shared.name':'One', 'post.shared.name':'Two', 'region.shared.name':'A region'});
  expect(p.name('shared')).toBe(S.unknown);
  expect(p.name('shared','person')).toBe('One');
  expect(p.name('shared','region')).toBe('A region');
  expect(p.name('absent','person')).toBe(S.unknown);
  expect(missingNameKeys()).toContain('person.absent.name');
  expect(p.text('A report arrived; add_axis and own_request')).toBe('A report arrived; add axis and own request');
});
