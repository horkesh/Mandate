"""Read-only S38 coverage, arithmetic, citation and preservation audit.

Run from any directory: python docs/research/S38/audit.py.
The external evidence directory must be present. No network or pack writes.
"""
from pathlib import Path
import collections
import csv
import datetime as dt
import hashlib
import json
import re

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
EVIDENCE = Path(r"C:\Pyrrhic\mandate-research-sources\S6\S38")
CUTOFF = dt.date(1861, 3, 1)


def read(path):
    with path.open(encoding="utf-8-sig", newline="") as source:
        return list(csv.DictReader(source))


def union_days(terms):
    merged = []
    for start, end in sorted(terms):
        end = min(end, CUTOFF)
        assert start < end
        if merged and start <= merged[-1][1]:
            merged[-1][1] = max(end, merged[-1][1])
        else:
            merged.append([start, end])
    return sum((end - start).days for start, end in merged)


def band(days):
    if days * 4 >= 20 * 1461:
        return "high"
    if days * 4 >= 10 * 1461:
        return "above"
    if days * 4 >= 3 * 1461:
        return "average"
    return "below" if days else "low"


def audit():
    records = read(HERE / "service-records.csv")
    proposals = read(HERE / "experience.csv")
    indexed = {row["person"]: row for row in records}
    assert len(indexed) == len(records) == 392
    assert {row["person"] for row in proposals} == set(indexed)
    assert len(proposals) == 392
    pool = {row["person"] for row in read(ROOT / "docs/research/S12/officers.csv")}
    assert len(pool) == 239
    assert {row["person"] for row in records if row["cohort"] == "S22_POOL"} == pool
    assert all(row["person"] in indexed for row in read(HERE / "cast-post-coverage.csv"))
    live_ids = {row["id"] for row in read(ROOT / "packs/union-1861/source/world/people.csv")}
    posts = {row["id"]: row for row in read(ROOT / "packs/union-1861/source/scenarios/march_1861/posts.csv")}
    military = {"army_department", "general_in_chief", "field_command", "temporary_command", "harbour_command", "fort_command", "arsenal", "bureau", "state_military", "marine_corps", "navy_squadron", "navy_yard", "ship_command"}
    expected_posts = set()
    expected_exclusions = set()
    for file, person_key, post_key in [("packs/union-1861/source/scenarios/march_1861/holders.csv", "person", "post"), ("packs/union-1861/source/drafts/oob/people_in_posts.csv", "person_id", "post_id")]:
        for row in read(ROOT / file):
            person = row[person_key]
            if person == "unknown" or posts.get(row[post_key], {}).get("kind") not in military:
                continue
            if (row["from"] and row["from"][:4] > "1861") or (row["to"] and row["to"][:4] < "1861"):
                continue
            target = expected_posts if person in live_ids else expected_exclusions
            target.add((person, row[post_key], file))
    assert {(row["person"], row["post"], row["pack_file"]) for row in read(HERE / "cast-post-coverage.csv")} == expected_posts
    assert {(row["person"], row["post"], row["pack_file"]) for row in read(HERE / "post-exclusions.csv")} == expected_exclusions
    holds = {row["person"] for row in read(HERE / "holds.csv")}
    assert holds == {row["person"] for row in proposals if row["decision"] == "HOLD"}
    intervals = collections.defaultdict(list)
    for row in read(HERE / "service-intervals.csv"):
        assert row["person"] in indexed
        start = dt.date.fromisoformat(row["start"])
        end = dt.date.fromisoformat(row["end_exclusive"])
        assert start < end <= CUTOFF
        intervals[row["person"]].append((start, end))
    for person, terms in intervals.items():
        row = indexed[person]
        assert union_days(terms) == int(row["us_commissioned_days"]), person
        assert f'{int(row["us_commissioned_days"]) * 4 / 1461:.3f}' == row["us_commissioned_years"]
    militia_low = collections.defaultdict(list)
    militia_high = collections.defaultdict(list)
    for row in read(HERE / "militia-intervals.csv"):
        for field, dest in [("min_interval", militia_low), ("max_interval", militia_high)]:
            if row[field]:
                start, end = map(dt.date.fromisoformat, row[field].split("/"))
                dest[row["person"]].append((start, end))
    for row in records:
        person = row["person"]
        if not row["us_commissioned_days"]:
            assert person not in intervals
            continue
        minimum = union_days(intervals[person] + militia_low[person])
        maximum = union_days(intervals[person] + militia_high[person])
        if person == "lovell_mansfield":
            alternative = [(dt.date(1842, 7, 1), dt.date(1854, 9, 18))]
            minimum = union_days(alternative + militia_low[person])
        assert minimum == int(row["all_documented_days_min"]), person
        assert maximum == int(row["all_documented_days_max"]), person
        assert minimum <= maximum
        assert f"{minimum * 4 / 1461:.3f}" == row["all_documented_years_min"]
        assert f"{maximum * 4 / 1461:.3f}" == row["all_documented_years_max"]
    centres = {"high": "800", "above": "650", "average": "500", "below": "350", "low": "200"}
    prior = {row["person"]: row["prior_value"] for row in read(ROOT / "docs/research/S22/officer-centres.csv") if row["cell"] == "experience"}
    for proposal in proposals:
        person = proposal["person"]
        row = indexed[person]
        assert proposal["cell"] == "experience"
        assert proposal["decision"] == row["experience_decision"]
        if person in pool:
            assert proposal["prior_value"] == prior[person]
        if proposal["decision"] == "CHANGE":
            minimum, maximum = int(row["all_documented_days_min"]), int(row["all_documented_days_max"])
            assert band(minimum) == band(maximum) == row["proposed_band"] == proposal["proposed_direction"]
            assert row["proposed_centre"] == centres[row["proposed_band"]]
            assert proposal["citations"] and "[I]" in proposal["basis"]
        else:
            assert proposal["decision"] == "HOLD" and not proposal["proposed_direction"]
            assert row["next_source_needed"]
    for row in read(HERE / "staff-intervals.csv"):
        assert dt.date.fromisoformat(row["start"]) < dt.date.fromisoformat(row["end_exclusive"]) <= CUTOFF
    for row in read(HERE / "later-confederate-register.csv"):
        assert row["government"] == "Confederate"
        assert dt.date.fromisoformat(row["appointed_on"]) >= CUTOFF
    manifest = json.loads((HERE / "scan-manifest.json").read_text(encoding="utf-8"))
    sources = {(row["key"], str(row["page"])): row for row in manifest}
    assert len(sources) == len(manifest)
    refs = set()
    for path in HERE.glob("*.csv"):
        text = path.read_text(encoding="utf-8")
        assert not text.startswith("\ufeff") and "\ufffd" not in text
        for key, page in re.findall(r"NEW:S38-([A-Z0-9-]+) p(\d+)", text):
            refs.add((key, page))
    assert refs <= sources.keys(), sorted(refs - sources.keys())
    for row in manifest:
        assert row["status"] == "ok" and row["url"].startswith("https://")
        path = Path(row["path"])
        assert path.resolve().is_relative_to(EVIDENCE.resolve())
        data = path.read_bytes()
        assert len(data) == row["bytes"]
        assert hashlib.sha256(data).hexdigest() == row["sha256"], str(path)
        if row["kind"] == "archive page JPEG":
            assert data.startswith(b"\xff\xd8")
    baseline = json.loads((EVIDENCE / "baseline.json").read_text(encoding="utf-8"))
    for name, expected in baseline.items():
        assert hashlib.sha256((ROOT / name).read_bytes()).hexdigest() == expected, name
    result = dict(status="PASS", handles=len(records), proposals=sum(row["decision"] == "CHANGE" for row in proposals), holds=len(holds), cited_pages=len(refs), retained_manifest_entries=len(manifest), original_tracked_files_preserved=len(baseline), source_bytes=sum(row["bytes"] for row in manifest))
    print(json.dumps(result, indent=2))
    return result


if __name__ == "__main__":
    audit()
