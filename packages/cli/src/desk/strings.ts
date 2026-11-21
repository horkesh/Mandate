/** The driver supplies wording and interpolates visible values on the desk's behalf. */
export type DeskStrings = (key: string, values?: Record<string, string>) => string;
