# Hotel NEON — anime mystery prototype v0.18

A local multiplayer investigation for 1–7 players. Host is a player; one English/Japanese language per room; no countdown. The story targets about 90 minutes but has not been timed in a blind playtest. Not deployed.

## v0.18 Casebook organization

The public service-document index is now a collapsible folder structure with the current folder marked, clickable public files and a read-only archive reference. Players still enter the relative archive path themselves; the directory map does not automatically open the restricted record.

IMG_2860 now includes a cast-matched event-desk illustration with zoom/pan and an English/Japanese character key. The caption preserves the photograph's evidentiary limit: it identifies people and EVT-01, but does not reveal tablet screen contents.

Support conversation attachments now show a localized badge and case screenshot, with a click-to-enlarge viewer and keyboard dismissal. Asking for proof resends the images. Kitchen, reception and maintenance calls have humorous localized dialogue; unlisted extensions receive a switchboard response. Only the trusted case-support extension verifies the request or unlocks evidence.

Portrait and ticket correction: expression sprites use an inner clipping frame to exclude adjacent atlas artwork. EQ-1842 opens its own localized receipt and source text; the SQL search table continues to show all returned bookings for comparison.

Connection and journey validation: heartbeat checks detect silent sockets, expired or removed sessions clear Resume credentials, and HTTP requests time out instead of waiting indefinitely. The suite completes all chapters in English and Japanese for every party size from one to seven, rotating actors and testing both support-request outcomes. Socket heartbeat timing also runs against a controlled clock and the actual Worker.

Delayed-request regression pass: repeated Start, private acknowledgement and completed recovery are safe to retry. Solved puzzle submissions remain safe after another player advances the chapter. The client ignores action responses and socket events from abandoned sessions and suppresses old-chapter record displays after synchronized progression.

Multiplayer regression pass: delayed prior-chapter advances no longer skip a newly completed chapter. Reconnecting eligible voters invalidate incomplete proposals; ballots survive replacement Hosts without an eligible vote. Late spectators receive an explanation instead of an enabled invalid vote button. Runtime tests exercise seven concurrent connected clients, pins, notes, votes, multi-tab Host presence and removal authorization.

- The Casebook opens on Current leads, showing only inspected records connected to the active chapter.
- The complete Records archive is grouped into collapsible chapter sections, with the current chapter opened first.
- The in-world Notebook also separates the current chapter, case briefing, earlier records, additional files and the resolution instead of showing one undifferentiated stack.
- Each source has a short evidence summary plus NEW, READ and PINNED status. Story scenes, character profiles and witness dialogue no longer clutter the source-record archive.
- Replay is now a clearly named section. On small screens, the five Casebook tabs scroll horizontally instead of compressing into unreadable labels.
- The Evidence board remains the team's curated shortlist, while the Casebook remains the complete inspected-source archive.

## v0.17 story and security revision

- Mio now has a complete intended endgame: stage an external incident, postpone the unsafe show, recover PIP after the ballroom clears and shift the immediate explanation to Incident Response. Independent records make that plan fail.
- Ren's manual-mode work, console return and lack of trolley collection are explicit. Aya, Daichi and Sora each have a plausible suspicion that later evidence can eliminate.
- PIP's stored status and return call back to the team's holiday priority. The final explanation maps all five security themes to the incident without claiming that a technical artefact alone identifies a person.
- The finale now requires separate support for physical departure, route, false preview, motive, attribution and investigation interference. One-option room votes were removed from the final explanation.
- Sending the fictional handover code remains a recoverable social-engineering consequence, but the confirmation now clearly warns that one player's action changes board access for the whole room.

## v0.16 room retention and witness follow-ups

- Pressing a witness statement now shows the team's specific follow-up question and the witness's answer. Presenting evidence also produces an explicit question-and-response exchange.
- Completed rooms expire 24 hours after their last activity. Unfinished rooms expire after seven inactive days.
- Connected rooms are never removed by the expiry alarm. Cleanup removes the saved room, member tokens and its separate SQL-lab usage budget.
- Pinning is idempotent across players and already-pinned records are labelled instead of offering a duplicate action. Private-clue sharing now survives note trimming and only dismisses the reveal after the share succeeds.

## v0.15 room-wide dialogue decisions

- Important dialogue choices wait for every eligible online player and show exactly who has not voted.
- After all votes arrive, the Host confirms the majority choice or transparently overrides it; ties use the Host's vote as the proposal.
- The locked response is shared across the room. Dialogue replay is read-only and follows the choice the room already locked.
- Disconnected voters leave the active quorum, while players who join after a ballot starts do not reopen it. Solo votes lock immediately.

## v0.13 multiplayer reliability

- Player names are unique after Unicode/case normalization, keeping votes and notes attributable.
- Puzzle submission, chapter advance and finale actions tolerate another screen completing the same action first.
- Shared private observations are visibly marked and cannot be shared repeatedly. When a player leaves, only their unshared transferred observations trigger a private reveal for the host.
- Removing a player requires confirmation. Teammate discovery notices now stay visible above story and system overlays.

## v0.12 progressive private discoveries

- Private observations now appear during exploration instead of being dealt in the lobby. Seven story-linked triggers cover the hot-spring entrance, witness lounge, work-order desk, KUMA archive, case-board settings, photo library and ballroom controls.
- The server chooses among online players with the fewest observations, using randomness only to break a tie. Late joiners are therefore prioritized by later discoveries.
- The chosen player receives a private RPG reveal with Keep and Share actions. Other screens only announce that the player noticed something; the secret text is never included in their snapshot.
- Discovered observations remain in Team. Removed players' observations transfer to the host, and all observations remain optional context rather than hard progression gates.

## v0.11 interactive conversations

- Important RPG choices now show synchronized room votes while each player keeps control of their own dialogue pace. Votes are suggestions and never block progress.
- Witness interviews offer Hear statement, Press the wording and Present evidence actions. Relevant private clue holders receive an optional Raise clue prompt that shares into team notes.
- Incorrect evidence produces a recoverable response; matching evidence clarifies the exact scope of a statement without changing puzzle facts.
- All nine human characters have neutral, happy, surprised and worried/defensive transparent portraits. Expressions react to the current speaker, scene and response. PIP and KUMA keep their existing animated faces.


## v0.10 investigation navigation

- Four stable destinations now organize the game: Explore, Casebook, Evidence and Team. KUMA remains a separate chat companion.
- The Casebook separates story, people, inspected records and the investigation timeline.
- Pinned records and shared notes now live together on one Evidence board. Private clue cards are surfaced inside Team.
- Hotel scene hotspots change by chapter and open the relevant in-world terminal, phone or archive. The current quest owns the single main action and the hint button.


## Start locally

Install Node.js 24, then run inside this folder:

```sh
npm ci
npm run dev
```

`dev` builds the frontend automatically before starting Wrangler, so `dist` does not have to exist beforehand. Open the local URL Wrangler prints, normally http://localhost:8787. Create a room or share its URL and room code. Two tabs in the same browser profile resume the same seat; use a private window or separate browser profile for a second player. Other devices need the same server's LAN address; their localhost is a different computer.

The SQL challenge is now built into Cloudflare's local runtime as a separate SQLite-backed Durable Object. No Docker, PostgreSQL, external SQL gateway or SQL credentials are required. `npm run dev` automatically builds `dist` before starting Wrangler.

No Cloudflare account is needed locally. For public hosting, use your own Cloudflare Workers account; the project targets Workers Free with SQLite-backed Durable Objects and static assets. Usage quotas still apply. The supplied `wrangler.jsonc` binds two distinct namespaces: `ROOMS` for game state and `SQL_LABS` for fictional query data. Migration v1 is preserved; v2 adds SqlLab without deleting game data. Nothing has been deployed by this update.

### Updating from v0.8

Replace the source, root package files and Wrangler config with v0.15, then run `npm ci` and `npm run dev`. Keep your existing `.wrangler` directory if you want to retain local room progress. The old `sql-challenge` folder and setup script are obsolete and no longer included. Existing `SQL_CHALLENGE_URL`/`SQL_CHALLENGE_TOKEN` entries in `.dev.vars` are ignored by this version and may be removed. Do not copy secrets into this ZIP.

If the old Docker lab is still running, stop the two Hotel NEON lab containers in Docker Desktop. You do not need those containers for the new game. You can also run the following while the old Compose file is still present:

```sh
docker compose --env-file sql-challenge/.env -f sql-challenge/compose.yaml down
```


## Play and communication

- Create/join by room code, with one shared language, saved progress, WebSocket synchronization, reconnect and host handoff. Host can remove seats; removed optional clues transfer to the host.
- Private observations appear on selected players’ screens as the team explores. Open **Team** in the bottom menu, compare observations aloud or choose **Share with team** to add them to shared notes. Solo players discover the same observations progressively. Shared discoveries, records and pins sync; browsing remains independent.
- Follow the next-action quest, inspect records, use Team deduction, then explicitly choose Next chapter after a finding. Chapter flags are mementos, not another input hurdle.
- Help is replayable through How to play. The story, witness accounts and final explanation use RPG dialogue and can be revisited through Casebook. KUMA is a scripted chat companion with no paid AI dependency.
- Useful records go into the shared Evidence board. Hints are directly accessible. Giving the fake caller the fictional board code triggers one recoverable team board lock; evidence and progress are preserved.

## Visual and play features

The hotel now has distinct equipment, file explorer, maintenance, AV, archive and photo-library application windows. Eighteen evidence records use tables, report sections or asset fields, with full original text retained. Unknown values stay unknown; evidence caveats remain visible.

Characters use transparent portrait cutouts and a separate layout row from controls and dialogue. The prologue hints at older digital systems' security weaknesses without revealing answers.

Click a posted or retained-original photo to open a local zoom/pan viewer. Enlargement makes no puzzle request. Reading Image details is an explicit prerequisite for the separate Inspect original action; the quest directs you through it instead of issuing an invalid request. The posted view stays cropped and does not reveal the original's placard. Keyboard: Escape closes; +/− zoom; 0 resets; with Close focused, arrow keys pan.

SQL injection executes real SQL against a separate SQLite challenge Durable Object with only fictional equipment records. The application's room database remains isolated. See `SQL-CHALLENGE.md` for the supported grammar and containment boundaries. Other exercises (prompt injection, social engineering, metadata and virtual path traversal) remain scripted/simulated and never touch real hotel systems, host files or outside services.

## Validation and limits

```sh
npm run build
npm test
```

See `test-report.json` and `sqlite-test-report.json` for counts and exact scope. Tests use real local Cloudflare workerd SQLite, including the production Worker-to-SqlLab call, not a mock query evaluator. Coverage includes alternative predicates, subqueries, UNION, quote/comment handling, write/system-table/function rejection, output bounds, persistent rate limiting, room separation and the full game flow, storage, WebSockets and host handoff. `wrangler deploy --dry-run` packages both namespaces; it does not publish them.

An independent source reviewer inspected SQL containment. This is not a production security audit. No measured play duration, current full-browser/mobile QA, public deployment or deployed free-tier usage measurement is claimed. Before the team event, run a browser walkthrough with two profiles and a small-group playtest. Before broad public use, validate abuse controls and idle-room cleanup against actual account quotas.

## Artwork and source

`public/art` contains the lobby, corridor evidence, scene atlas, holiday tour, cast and transparent portrait atlas. `ART-DIRECTION.md` documents continuity. Exact evidence labels are rendered as accessible UI text. Source, tests, configuration and the dependency lockfile are included; generated build output, installed dependencies and local secrets are excluded.

## v0.8 layout correction

Conversation overlays use one explicit `minmax(0,1fr)` grid column with stretched alignment. An old flex-layout `justify-content:flex-end` rule was removed; it had carried into the newer grid layout and allowed long dialogue to size the column beyond the viewport. Navigation, character and dialogue now share the same bounded column. Current correction has passed the production build; full browser verification remains pending.
