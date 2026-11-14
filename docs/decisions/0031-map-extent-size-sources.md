# 0031: The map covers the whole war at about 250 regions, built from licence-clean sources

Status: accepted (2026-11-14). The owner chose the map lane's recommendations for extent ("full war, edges coarse") and size ("about 250"). Sources and pipeline follow `docs/research/2026-11-14-map-extent-size-sources.md`. Extends 0019.

## Context

- The map model is settled (0019); extent, size and sources were not.
- The March 1861 to 1862 period already includes the Trent crisis, the New Mexico campaign and the Dakota War, so the map's edges matter from the start.
- The lane found no licence-clean 1861 railway dataset, a usable Newberry licence, and a clear no for NHGIS.

## Decision

**Extent.**
- Full resolution from southern Pennsylvania to the Gulf, and from the Atlantic to eastern Texas.
- Coarse regions (one to four each) for Kansas, Indian Territory, New Mexico and Arizona, Minnesota and Dakota, and the Florida peninsula.
- Off-map boxes, with no geometry, for the Pacific coast, Britain and Canada, France and Mexico, the blockade-running ports, and two or three high-seas raider zones.

**Size.** About 250 regions (target 220–280, ceiling 350), including 25–40 small key-point regions (river junctions, rail junctions, fortified towns) so that places like Cairo, Paducah and Columbus are distinct. About 800 authored, cited edges.

**Sources and pipeline.**
- The graph (regions and typed edges) is hand-authored first, with citations.
- Land regions are defined as lists of 1861 counties from the Newberry Library's Atlas of Historical County Boundaries, dissolved and simplified. Only derived geometry is committed. Counties ignore terrain, so where a county straddles a ridge or river that matters to operations, the region boundary may split it along a line traced from a public-domain period map, recorded in the provenance file.
- Railways are traced from public-domain Library of Congress maps. Existing 1861 rail datasets are not used unless their owners grant permission.
- Rivers, coastlines and relief come from Natural Earth and USGS (public domain), with the Mississippi hand-edited to its 1861 course.
- Not used: NHGIS (redistribution needs permission), and David Rumsey copies of maps (CC BY-NC-SA) where the Library of Congress holds the same public-domain map.
- Every pack keeps a `PROVENANCE.json` naming each source, its licence, the date the licence page was read, and an archived copy reference. A validator in `npm run check` fails on map data without provenance.

Rejected: main theatres only (the New Mexico campaign and the Dakota War would become placeless events); the whole continent at full resolution (authoring cost for little play); about 120 regions (key points merge, fronts blur); about 500 (double the authoring, AGEoD's micromanagement complaint).

## Consequences

- Phase 0 lane 0.3 builds the Union map to this extent and size, starting at March 1861 (0028).
- Confirmation from the Newberry Library, and permission requests to the railway-dataset owners, are outward-facing and need the owner's go-ahead (parked in `docs/OPEN_QUESTIONS.md`).
- The M2 pack's 37 regions and its calibration do not carry over; the M2 pack test retires with the old theatre (FOUNDATION section 10).
