# Hotel NEON — anime mystery prototype v0.12

A local multiplayer investigation for 1–7 players. Host is a player; one English/Japanese language per room; no countdown. The story targets about 90 minutes but has not been timed in a blind playtest. Not deployed.

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

Replace the source, root package files and Wrangler config with v0.12, then run `npm ci` and `npm run dev`. Keep your existing `.wrangler` directory if you want to retain local room progress. The old `sql-challenge` folder and setup script are obsolete and no longer included. Existing `SQL_CHALLENGE_URL`/`SQL_CHALLENGE_TOKEN` entries in `.dev.vars` are ignored by this version and may be removed. Do not copy secrets into this ZIP.

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
