# S132 targeted S98 correction review

Approved. In `packs/union-1861/test/s98-cast-evidence.test.ts:41–47`, both Seward values must have exactly one citation, `S131-SEWARD-481` at `p481 dated 1860-12-10`. It matches both accepted S131 cells at `docs/research/S131/cells.csv:2,5` and the provenance entry at `packs/union-1861/PROVENANCE.json:2685`. The test still requires that both held values exist. Scott's and Hicks's S98 citation, date and page guards remain in place, along with the other character and value assertions.

The correction changes only this test, with eight added lines and one removed. The targeted diff check exited 0. The implementation receipt records the focused reproduction at exit 1 with one failure and the three-file verification at exit 0 with nine passes. The review reused those results. [Implementation receipt](hook-correction.json)

The integration lane owns the ordinary hook retry and capture preservation.

Findings outside my scope
