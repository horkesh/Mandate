# 0004: First vertical slice: the Union, 1861–62

Status: superseded by 0018 (2026-11-14). Accepted 2026-11-13.

## Context

A generic engine designed against three settings at once tends to die of generality. One slice should drive the kernel, while the three-setting test (0003) keeps the kernel honest. The candidates were:
- the Union in 1861–62;
- Rome in the Second Punic War;
- Ukraine in 2022;
- a fictional testbed.

## Decision

The first vertical slice is **the Union, from mid-1861 to the end of 1862**: Lincoln as the principal, from roughly First Bull Run to the 1862 midterms and the replacement of McClellan. Reasons:
- It is the textbook principal–agent war: Cohen's *Supreme Command* devotes a chapter to Lincoln.
- It has the McClellan problem (P6), political generals who can't be sacked cheaply, governors who raise regiments (P1), and a mix of telegraph latency (P8).
- The 1862 midterms are a coalition checkpoint (P10).
- It is two-sided, richly documented, in English, and nobody involved is alive.

## Consequences

- `packs/union-1861/` is the first pack. The term list gets its names.
- Rome is the hardest test of the kernel (0006) and is reviewed against the kernel before the kernel's API is frozen.
- Ukraine follows the policy in 0005.
