# 0052: Seats, knowledge and the command log: copy-on-write State, the player-visible boundary, and who may order

Status: accepted (2026-11-14). From Phase 0 lane 0.6 (`notes/lane-0.6-seats.md`, which lists each choice with what it rejected) and the standing reviewer's two passes (approved after fixes). Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Carries out FOUNDATION sections 5, 8, 9 and 10, and decisions 0011, 0015, 0032, 0035, 0040, 0041 and 0044. Amended by 0059 (immutable records are declared by type in `IMMUTABLE_RECORDS`) and 0121 (a commander may order under a mandate he has received).

## Decision

**State is copy-on-write (binds lanes 0.4 and 0.5).** Records below the root are immutable values, and their keys are listed in `IMMUTABLE_STATE_KEYS`. Every change goes through a root field, and so through its one writer, which returns a new State sharing unchanged records. Three rules follow:
- new root fields are built only in `createState` (`tick/setup.ts`, the one constructor);
- writers update by spreading the existing State, never by building a fresh one;
- an object literal carrying an owned key outside that key's writer counts as a write, and the scan flags it.

This makes `viewFor`'s stable references free (0035) and the test-time deep freeze cheap. The day counter is owned by `tick`, now a writer.

**The player-visible boundary is a package export.** Player-facing code imports only `@mandate/kernel/seat-api`, and player-facing packages declare `"playerFacing": true`. An import-closure test refuses anything that reaches State, the truth layer, traits, messages in transit or the tick, including dynamic `import()`. The truth behind each report lives in its own map and file, which the view layer cannot import.

**Seats.** One request type serves rule, AI and human seats (0015): a view plus a menu of options the kernel has judged consistent with the man. If only one option is consistent, nobody is asked. Principals send commands that the kernel validates. The seat interface is synchronous inside the kernel loop; an AI seat's latency is the shell's business at turn boundaries (0027), and replay never asks a seat.

**Who may order.** Only a principal gives orders. Relay is a message passed from post to post, each holder applying his own compliance and delay (0040). Two orders conflict when one came down the chain and the other went around it. The chain's order stands against a later bypass, a slow chain order supersedes a quicker bypass, and the holder reports which he obeyed.

**Rulings for later lanes:**
- **Lane 0.7:** a situation option that issues orders issues them in the principal's name, through the principal's routes and the same validated command path. A delegated situation (0040) hands over the choice, not the authority to order: the delegate's chosen option is recorded as delegated, and its orders still go out in the principal's name. Lane 0.7 adds this option-issued path, with the route the option names.
- **Lane 0.5:** whether commanders order their own subordinates (corps inside an army) stays deferred, as 0040 left it. Lane 0.5 brings a ruling and a kernel-built menu if it needs one.
- **Lane 0.5:** replaces the stand-in World with lane 0.2's World (0050). Filter posts and intelligence chiefs become post kinds in pack vocabulary, courier days derive from the typed edges, and a region's wire owner derives from control.

**Knowledge and messages.** Reports are typed, each with an author, a subject, claims with confidences, a day-and-hour stamp, a route and the posts it passed (0032). Advice has a `memorandum` subtype. The informal route has six sub-types (cabinet word, a caller, a governor's wire, a legislator, a navy channel, a railroad man). Knowledge is pruned daily by the report's age and supersession (template, author, subject, and the order answered), so what a seat holds stays bounded. Perception bias is applied on reading, in belief derivation, so a commander's dispatches and his menu inflate the enemy by the same amount, and an intelligence chief's bias is a separate term on top. A message's id comes from its content, not a counter, so one extra report never renumbers the rest. Courier weather is the seats layer's only dice, from a stream keyed by the message's id (0041); people never draw (0007). The wire belongs to a side.

**The tick order.** Each day the kernel builds the standing-goal menus first, from the morning's State, the same State the seats were asked from, before any command is applied. A lane that adds phases (movement, combat, situations) keeps those menus first.

**The command log.** A log entry is a day, a seat and a command. `playDays` asks seats and logs their answers; `replay` reproduces every day's hash from the log alone. The save envelope's log and its hash are filled. The save schema stays at 1, since no save has been released.

Rejected: writers that edit in place (the alias gap stays open, and stable references need dirty flags); owning every nested key by name; a separate clock module; serial message ids or a shared communications stream; a truth field stripped from each report (one forgotten projection leaks it); bias applied in the planner or the dispatch writer (two owners of one bias); asking every seat every day; asynchronous seats in the kernel; a naming convention instead of an export boundary; letting commanders order through free-form commands.

## Consequences

- FOUNDATION section 10 gains the `messages` module, the `tick` writer role, and rows for the current day, the stand-in headquarters, messages in transit, knowledge and seat assignments.
- The testbed save fixture fails its resume test whenever State changes shape. Before a public build, it is regenerated (`npx tsx tools/make-save-fixture.ts`); after one, a change needs a schema bump and a migration.
- Lane 0.8 adds a checkpoints-only hashing option for Monte Carlo runs (0044), and keeps the deep freeze off in normal play.
