# S15: 1862 manpower and economic data drafts

For the lead: 3 items. Work in progress on `sprint/research-foreign-economy`, from `b0cc385`. S15 only; every delivery is a draft, excluded from loading and generation. Evidence stays in `C:/Pyrrhic/mandate-research-sources/S5/s15/`.

## Work and verification plan

1. Read the original conscription and exemption texts, Union calls, quota tables and expiring-term evidence. Draft an R90-style catalogue with dates, terms, legal authority, quotas and separate retention rules. Commit this batch through the hook.
2. Re-read the relevant S5 source pages and draft dated economic and foreign observations. Widen into railroad operating returns, ordnance output and monthly blockade captures. Preserve unavailable quantities and incompatible definitions. Commit the settled batch through the hook.
3. Verify CSV/JSON readability, unique identifiers, citations, source hashes, date precision, arithmetic, allowed paths and exclusion from runtime inputs before expensive checks. Reuse S5's unchanged runtime evidence explicitly. Run the required `MANDATE_NO_GIT=1 npm run check` and one default `npm run run:done-check`; retain every failure. No added simulation or calibration campaign.

The hook asks whether the staged branch passes the project's full checks; expected cost is minutes per batch. The done check asks whether the unchanged runtime still meets the inherited criteria; it can take twenty to thirty minutes on this shared host. Pass criteria remain unchanged. Stop after that single invocation; diagnose failures without expensive retries. Cheapest rejection gates are branch/hash, dependency startup, readable sources and draft isolation. No package build is needed.

## Manpower batch

Drafted six CSVs and a README under `packs/union-1861/source/drafts/calls/1862/`: eleven catalogue records; forty-six quota rows using the existing nine-column form; forty-eight retrospective credit rows; nine service/retention records; thirty-seven exemption classifications; five dated quota variants/corrections. The research note is `docs/research/2026-11-20-s15-manpower.md`; the source register supplies original scan links and printed/PDF mappings. Both quota tables sum to 334,835 [I] against nominal 300,000 calls; credits separately reconcile to the printed totals of 421,465 and 87,588. No arrival date is invented for retrospective credit.

Legal retention is separate from new intake. September authority through forty-five is separate from the October call limited to under forty. The ninety-day transition dispute, August 15/18 deadline variant, Illinois correction, Delaware revision and New York 59,705/59,755 variant remain explicit. Exemptions have no headcounts or managed-population effects. Economy/foreign and adjacent production/transport/prize evidence follow in batch two.

## Proposed rulings

All are **[I]** proposals; none is accepted canon.

1. Keep authority, executive call, quota, enrollment, muster, retention, expiry and field strength distinct. Reject immediate full armies on enactment and double-counting retained men.
2. Keep dated quota/credit revisions and original tables. Reject silently rescaling 334,835 to 300,000 or using final furnished totals as arrivals on call dates.
3. Retain calendar terms and original enlistment dates. Reject a universal ninety-day expiry or a new three-year Confederate clock beginning April 16.
4. Keep exemptions as conditional research classifications for review. Reject universal occupational percentages, blanket enslaver exemptions and any managed stock of protected people.

## For the lead

1. Review the whole branch after the sprint under 0106.
2. Rule on proposed data conventions before adopting drafts.
3. Route sensitive exemptions and coercive recruitment to the separate gate reviewer.

## Findings outside my scope

Runtime implementation, acceptance-band changes, gate wording/placement and signatures belong to their owning lanes. Nothing is loaded by this request.
