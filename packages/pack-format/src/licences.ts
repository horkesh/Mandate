/**
 * The licence allow-list for pack data (decisions 0014, 0031, 0033, 0037).
 *
 * Data of record comes from public-domain sources; our own authored data is
 * own work under the project's licence. Share-alike and non-commercial terms
 * are refused (the project is public and commercial), and so is any source
 * without a stated licence. A rejected licence names its reason.
 */

export const ALLOWED_LICENCES = ['public-domain', 'CC0-1.0', 'own-work'] as const;
export type AllowedLicence = (typeof ALLOWED_LICENCES)[number];

/** Why a public-domain source is public domain. */
export const PUBLIC_DOMAIN_BASES = ['government-work', 'expired-copyright', 'dedicated'] as const;

export type LicenceVerdict =
  | { readonly allowed: true; readonly licence: AllowedLicence }
  | { readonly allowed: false; readonly reason: string };

export function licenceVerdict(licence: string): LicenceVerdict {
  if ((ALLOWED_LICENCES as readonly string[]).includes(licence)) return { allowed: true, licence: licence as AllowedLicence };
  const l = licence.trim().toLowerCase();
  if (l === '' || l === 'unknown' || l === 'none' || l === 'unstated') {
    return { allowed: false, reason: 'sources without a stated licence are not used (decision 0033)' };
  }
  if (/\bsa\b|share-?alike/.test(l)) return { allowed: false, reason: 'share-alike terms would bind the pack (decision 0033)' };
  if (/\bnc\b|non-?commercial/.test(l)) return { allowed: false, reason: 'non-commercial terms conflict with a commercial product (decisions 0033, 0037)' };
  if (/all rights reserved|copyright/.test(l)) return { allowed: false, reason: 'copyrighted works may be consulted to check facts but never copied into a pack (decision 0033)' };
  return { allowed: false, reason: 'not on the allow-list' };
}

/** Licences whose terms are a statement on a web page, so the page and the day it was read must be recorded (0031). */
export function needsLicencePage(licence: string, basis: string | null): boolean {
  return licence === 'CC0-1.0' || (licence === 'public-domain' && basis === 'dedicated');
}
