import { createContext, useContext } from 'react';
import { S } from './strings.ts';

/**
 * The written date of a seat day, as the player reads it (dates.ts writes it).
 * App supplies it once for the whole desk, so a card deep in the board or the
 * audience never falls back to printing a raw day number. The default is only
 * for components rendered alone, as in unit tests.
 */
export const DeskDateContext = createContext<(day: number) => string>(day => `${S.day} ${day}`);
export const useDeskDate = () => useContext(DeskDateContext);
