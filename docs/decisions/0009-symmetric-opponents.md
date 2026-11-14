# 0009: Opponents run on the same machinery

Status: accepted (2026-11-14); widened by 0015 (a non-player principal may be an AI seat with a rule fallback).

## Context

AWWV's bot political brain was built but sat dark for months, and its bots followed the calendar instead of the situation. If the enemy is a simpler pressure model, the enemy's command problems (which history is full of) disappear.

## Decision

- Every faction has a principal, posts, proxies, blocs and patrons, running on the same kernel as the player.
- Non-player principals are driven by a **bot principal**: a deterministic, cheaper policy that chooses verbs. Ties are broken with `strictCompare`. It never reads ground truth the human would not be able to see.
- The bot principal is wired from the first headless run in M1 (lesson L6).

## Consequences

- Either side of a pack can in principle be played. Packs may still mark one side as the supported player side.
- Enemy proxies refuse, slow-walk and lie to *their* leader too, so the player can exploit an enemy's command dysfunction.
