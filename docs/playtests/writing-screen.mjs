/** Candidate screen, not an automatic literary verdict. Concrete policy acts
 * in a menu label are not slogans (S35's B09 ruling). */
export function writingCandidates(lines) {
  return lines.filter(line => /·|\b[A-Z]{3,}(?: [A-Z]{2,})+\b/.test(line)
    || /(?:\b[A-Z][a-z]*(?: [a-z]+){0,4}[.!]\s+){2}\b[A-Z][a-z]*(?: [a-z]+){0,4}[.!]/.test(line));
}
