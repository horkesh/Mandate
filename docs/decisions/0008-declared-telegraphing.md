# 0008: The player sees what proxies say, not what they will do

Status: accepted (2026-11-14). Refined by 0032 (reports have authors, routes and filters).

## Context

Showing pushback before commit makes it readable (AWWV; Command Ops). Showing the exact outcome ("Into the Breach for politics") kills deception, and deception is the heart of P4.

## Decision

- Before committing a directive, the player sees the proxy's **declared** response, with the reasons the proxy chooses to give.
- Candid proxies declare the truth. Uncandid ones may declare compliance while slow-walking or reinterpreting (`resolveDirective` already returns `declared` and `actual`).
- The truth comes out through consequences, through other people's reports, and through paid oversight channels (P4).
- The consequence receipt (from AWWV) records both: "he told you he'd comply on day N; he did X."

## Consequences

- The player-visible state must never include `actual`. This boundary will be enforced by the view-model types when the desk UI exists.
- Candour becomes one of the most important traits for appointments, which is intended.
