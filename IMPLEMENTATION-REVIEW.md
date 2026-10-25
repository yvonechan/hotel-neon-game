# Prototype implementation review

## v0.19 clarity and discovery pass

All task questions were checked against the displayed records and answer fields. Submission now shows task instructions, source shortcuts and explicit answer formats. The final case review attaches inspected evidence automatically while preserving the six server evidence gates. The dock log now explicitly records a cradle load-sensor removal at 18:42, rather than treating a disconnected charger as conclusive movement evidence.

The clue presentation audit is recorded in `CLUE-DISPLAY-REVIEW.md`. A hotel code reference and explicit inventory location column distinguish LA-B, B-03 and CT-44. PIP's camera image is separated from wired serial identification. Settings display the actual board-transfer capability; recovery uses numbered steps.

KUMA's document tray is a room-shared scripted discovery through the repeatable honey-toast conversation. The false account remains until discovery; direct source requests do not bypass it. This is a narrative gate, not a real LLM security control. The simulated file-index grep searches a bounded in-memory catalogue, returns paths without reading files, and requires players to calculate a relative viewer path. The optional final hint remains an explicit solution aid.

Every revealed source is available through grouped map records. Private observations and undiscovered puzzle documents retain their intended discovery rules. The production browser and mobile user interface still require visual/manual QA.

The story v2 was previously reviewed independently for narrative, security, gameplay and bilingual equivalence. This prototype also received bounded read-only reviews from the security and gameplay reviewers. They did not run a browser or a human playtest.

Concrete issues found and corrected:

- Missing settings/help/correspondence categories made mandatory case documents unreachable in the initial UI. They are now part of the case file.
- Ordinary public SQL result rows incorrectly navigated to an unavailable internal receipt. They now render their own returned receipt; the relevant revealed booking opens its case evidence.
- Reception return deleted the sole resume credential. It now retains the token and supplies a Resume action.
- Future support verification could reveal and close a request before it arrived. Verification now checks for an existing request; earlier enquiries are informational only. Code sending and badge requests also require that thread.
- Original-image access lacked context. It now requires the image details and retained asset ID.
- Board pin badges leaked while the board was locked. They are now masked alongside board pins/notes.
- Superseded in v0.2: the SQL engine was removed entirely. A fixed teaching model evaluates a narrow literal-comparison subset against fictional rows, with no SQL execution.
- Finding submissions previously advanced the whole room immediately. They now show a shared receipt and explicit Continue before progression.
- Validation errors thrown across Durable Object concurrency boundaries caused incorrect runtime failure handling. Errors are now caught within that boundary.
- WebSocket close handling now normalizes reserved close codes and excludes the closing socket when transferring host authority.

Both reviewers rechecked their reported corrections in the actual source and reported no remaining blocker among that bounded set. This does not certify production security, every possible UI path, browser accessibility, observed fun or duration.

`test-report.json` records runtime checks executed by the implementer, including actual isolated Cloudflare workerd requests, durable SQLite storage and WebSocket synchronization/hibernation/host transfer.

## v0.18 Casebook organization

The Casebook no longer presents every opened item as one flat stream. It opens on records relevant to the current chapter, marks records newly filed since the player's previous Casebook visit and gives every source a short reminder of what it establishes. The full source archive is grouped into collapsible chapter sections with read and pin state visible. Narrative scenes and character dialogue remain in People or Replay instead of appearing as evidence records. The in-world Notebook separately labels current, briefing, earlier, additional and resolution material. The five-section navigation becomes horizontally scrollable on narrow screens.

## v0.2 independent-review fixes
- Card sharing is idempotent while its note is retained; all note writes cap the board at150 entries.
- Host can remove seats in lobby or during the game, revoking tokens and moving optional observations to the host.
- WebSocket connection rechecks host presence, including when the previous host left before others connected.
- Request JSON is streamed with an8192-byte limit before decoding; roots must be non-null objects.
- SQL engine/dependency removed; only fixed fictional row filtering and literal comparisons remain.
-55 engine/runtime regression checks passed; no live deployment, load test, or browser QA.

Independent agent re-reviewed v0.2 and reran all55 checks: no blocking findings in the scoped fixes. One low UX finding (removed seats endlessly reconnecting) was addressed by clearing invalid sessions on WebSocket1008 or snapshot401. Browser QA and public abuse controls remain outside this validation.

## v0.3 interface revision
- Added localized quest planner matching server evidence gates, direct investigation links, persistent deduction/advance controls and replayable per-player tutorial.
- Added graphical map, clue cards, PIP/KUMA vector characters, cast portraits and evidence timelines. Long evidence is opened on demand; original text is retained.
- KUMA uses fixed in-game actions and scripted replies; no external LLM or input execution was added. Chat remains mounted while hidden, preserving conversation. Opening focuses input; closing restores focus.
- Independent read-only review found no blocking navigation/server-gate mismatch. Its two low chat findings (conversation reset and keyboard focus) were addressed.
- Static render/localization tests supplement existing game/workerd tests. Browser QA remains unverified because the managed preview could not start Wrangler; no live deployment was attempted.

## v0.4 visual-novel revision
- Replaced permanent dashboard navigation/party panels with a hotel scene, hotspots and on-demand location/party menus. Removed duplicate KUMA location; KUMA documents are accessible from Notebook and chat source links.
- Tutorial now leads to a locally replayable prologue; opening choices do not alter essential evidence. Witness/cast conversations use source text directly. Final explanation opens in a dedicated replayable scene.
- Added shared Evidence pouch shortcuts, immediate pin destination feedback and direct testimony pinning. Board-lock masking/recovery remains server-enforced.
- Replaced visible legacy flags with chapter mementos and takeaways; no flags need to be copied or reused.
- Independent review found two medium navigation issues: hidden finale explanation and dialogue obstructing selected pouch items. Both were fixed via explicit ending scenes and clearing the conversation on inventory navigation, including recovery navigation.
- Added bilingual static scene renders, original testimony parsing, no-duplicate-KUMA checks, reward rendering and shared-pin engine regression coverage. No browser, load or deployment verification is claimed.

## v0.5 complete story conversations
- Added bilingual chapter intros1–6 and aftermath conversations1–5, a per-player checkpoint director, source-based narrative record conversations and a multi-speaker final explanation/epilogue.
- Existing evidence remains authoritative; final reveal/ending bodies are retrieved through authenticated, unlocked server reads. Technical puzzle handlers and server completion gates are unchanged.
- Independent review identified a cancelled-load lifecycle stall, skipped conversations during multiplayer advancement, and KUMA overlap. Fixed with request-ownership tokens, ordered unseen checkpoint scheduling, and chat wait guards. Reviewer rechecked those fixes and found no new blocker.
-155 checks passed. No browser or live-deployment verification claimed.

## v0.6 user-reported interaction issues
- Fixed hotspot :active transform displacement and decorative-layer hit interception; six map handlers verified through actual browser clicks in an isolated fixture.
- Added environment and per-speaker atlas selection; all nine portrait cells and prologue/chapter/finale environment mappings have automated checks.
- Restored concierge source taxonomy as a separate KUMA archive and reference search; server document permissions are unchanged.
- Added SupportPhone end-of-conversation actions, inline fictional-code confirmation and evidence pinning. Reused badge/send-code/pin server actions; no external messaging integration or user SQL execution added.
- Added PhoneDesk keypad and transcript with the existing verify action, call state, hangup and failed-redial reset. Story waits for active calls or hint overlays.
- Added directly accessible hints in header/menu/scenes/phone.
- Reviewer found no blocking security/gate regression; low missing-phone-pin finding was fixed and rechecked. End-of-thread keyboard focus is restored to response actions.
-181 automated checks pass. Targeted desktop fixture browser checks completed; full production Worker/browser multiplayer and mobile testing remain unverified. The full-client fixture reached tutorial only and is not counted as an end-to-end pass.

## v0.7 holiday prologue pacing
- Added arrival, reception, three interactive tour stops and holiday planning before the team discovers the PIP presentation. Added four establishing visuals.
- Tour visits are local, deduplicated and manually advanced. They do not modify server evidence or puzzle gates. Return/Back/Escape and journal replay remain available.
- Preserved18:35/18:55/19:00/19:02 incident timeline. The preliminary greeting is stationary and does not claim an unsafe autonomous demonstration occurred. Updated chapter1 seal description to past tense after the door is opened.
- Independent review found no blocking flow/story issue. Its small holiday-priority wording suggestion was incorporated.
-190 automated checks passed. New intro atlas inspected; no claim of new-intro browser or mobile playtesting.

## v0.8 current review and validation

Supersedes the older SQL simulation notes above: production SQL now uses an isolated native PostgreSQL service and authenticated Node gateway. Worker room data remains in its Durable Object database. Independent source review found no path from the challenge to that app database and no new image-flow blocker. The result projection now clips before driver buffering; intermediate SQL resource use remains a documented lab availability risk. Containers restart after crashes; fresh fixtures are ephemeral. Native Docker validation is pending, not inferred from PGlite.

Evidence enlargement uses a client-only viewer; posted crop preserves the puzzle boundary. Original export still requires an authorized Image details read. Added keyboard panning following review. Transparent portraits occupy a separate layout row. Eighteen structured evidence formats retain original text and ambiguity. Intro/help/private-clue panel explicitly explain differing private cards, sharing, solo distribution and shared discoveries in both languages. Full current-version browser/mobile validation remains pending.

## v0.9 SQLite migration — current implementation

This section supersedes earlier PostgreSQL/Docker and fixed SQL simulation notes. The current application invokes a separate SqlLab Durable Object through its binding. The challenge has its own SQLite database, five fictional records and private quota/schema markers; it never stores room state or player tokens. No public Worker route forwards directly to SqlLab. GameRoom authorizes the player first.

The full generated SELECT is tokenized and parsed to EOF with explicit table/column/function/grammar bounds; only the canonical accepted token stream is executed. No arbitrary SQLite support is claimed. Four SELECTs, 120 tokens, expression depth10, fixed five-row source and no joins/CTEs/expanding functions bound query work. Outer row/text limits and output byte checks apply. Per-room budgets are serialized, persisted before query execution, and survive eviction. Schema version initialization is atomic and skips fixture writes after reconstruction.

Independent source review found no SQL escape or cross-database access blocker; its schema-initialization cost suggestion was incorporated. Actual workerd tests cover accepted/rejected SQL and the game-to-lab path. Cloudflare free-tier compatibility is an architectural target, not measured deployment usage.


## v0.10 information architecture

The former mixed tool dashboard was reorganized into Explore, Casebook, Evidence and Team. Hotel systems remain isolated simulations but now open from chapter-specific scene hotspots. Story, people, inspected records and timeline live in the Casebook; pinned evidence and shared notes share one Evidence board. No server state, puzzle answer or Durable Object storage format changed.


## v0.11 interactive dialogue

Dialogue choices can publish bounded per-room votes through the existing authenticated action and WebSocket snapshot path. The server accepts only the canonical dialogue/step keys and choice counts, and removes departed member IDs from ballots. Votes remain advisory so slower or disconnected players cannot block story progress. Witness interviews can press wording, compare inspected evidence and surface only the private clue relevant to that statement. These interactions do not alter puzzle gates or canonical evidence.

The five main characters and four supporting hotel characters use separate transparent 4-expression atlases. Portrait selection is deterministic from scene context and response state.


## v0.17 story and security revision

The culprit's plan now includes the missing endgame: use a supposed external incident to force postponement, recover PIP after the ballroom clears and treat the immediate failure as Incident Response's problem. Ren's narrow role in safe manual preparation is timestamped and separated from collection. Every supporting character has a concrete suspicious circumstance that later evidence can eliminate, and PIP receives an emotional callback in both the stored dock status and epilogue.

The final explanation explicitly distinguishes five security lessons from person attribution. Finale validation now requires six evidence categories—departure, route, false preview, motive, attribution and interference—so broad background records cannot satisfy the deduction. Generated one-option votes were replaced by direct manager questions and team explanations. The recoverable handover-code trap remains available, with a stronger warning that it changes the whole room's board access.


## v0.16 retention and witness interaction

Witness pressing now renders a concrete player question followed by the witness's answer; evidence presentation names the selected record in the question. The flow remains local investigation rather than a room-wide story vote.

Each room records creation and last-activity timestamps and schedules a Durable Object alarm. Completed rooms are retained for 24 hours after their last activity, while unfinished rooms are retained for seven inactive days. An alarm never removes a room with an active WebSocket. Expiry deletes the room state, member session tokens and the separate SQL challenge budget; static fictional SQL fixtures contain no room or player data.

Pinned evidence remains a shared, idempotent room action, with duplicate controls disabled in the client. Shared private observations now have their own persistent marker rather than relying on a note that may later be trimmed. A failed share no longer dismisses the private reveal, already-shared clues no longer offer another witness interjection, and failed team-note writes preserve the user's draft.


## v0.15 room-wide dialogue decisions

Important dialogue choices now create a fixed eligible voter set from the players online when the ballot starts. The UI shows vote progress and names each outstanding voter. Once the active quorum has voted, the server computes a majority proposal; a tie follows the Host's own vote. Multiplayer decisions wait for an explicit Host confirmation, and a different Host selection is recorded and labelled as an override. The resulting choice locks for the room and is the only path available in replay.

Disconnecting players are removed from the active quorum so they cannot stall a room. Late joiners do not reopen an existing ballot. If every original voter disconnects, current online players may take over the abandoned ballot. Solo rooms lock immediately. Durable Object integration tests exercise two authenticated WebSocket sessions through voting, proposal and Host override, in addition to engine-level quorum, departure, tie and authorization checks.


## v0.13 multiplayer reliability

Player names are now unique after Unicode/case normalization. Shared private observations expose a shared marker to their owner, and removing a player transfers all cards while queuing only unshared cards as private reveals. Puzzle submission, chapter advance and finale actions are idempotent for common synchronized-screen races. Player removal has a localized browser confirmation, and teammate discovery notices use a dedicated fixed layer above story/system overlays. Six new regression checks bring the automated suite to 293 checks.

## v0.20 — feedback, counter-arguments and completion

Errors use a fixed assertive alert above overlays and remain until dismissal or another action. Finale rejections for Ren, Aya, Daichi or Sora persist a numbered room event without completing the case or modifying evidence. The existing story scheduler gives unseen counter-arguments priority and defers them while another modal is active; each seat reads independently. The event is ignored after successful completion. Counter-dialogue distinguishes suspicion from attribution and references existing records without declaring an alternate culprit. Invalid suspect values and incorrect explanations still fail validation.

The hot-spring epilogue retains the repair restriction and existing PIP team vote, followed by a celebration with the manager, Aya, KUMA and the team. The new holiday dinner illustration appears during the final four beats without duplicate character portraits. A persistent completed-case panel displays the uncropped artwork and includes all room members and private celebration replay. No extra room-wide vote or progress reset is introduced. Verification includes bilingual rejected-theory retries and seven actual Worker/WebSocket clients receiving a shared accusation, followed by another player completing the case. Browser/mobile visual QA remains unverified.

## v0.20.1 — delayed multiplayer feedback

A late HTTP rejection could reintroduce an error flash after a teammate solved the chapter or completed the case. Finding responses now check the latest shared pending/stage/completion state before changing local UI; normal evidence-action failures remain visible. Chapter advance, chapter success and case completion clear obsolete feedback, including an earlier accusation notice. Escape dismisses the flash without also dismissing the scene beneath it. Regression checks cover unresolved errors, solved/pending chapters, chapter advance and final completion. Seven actual Worker/WebSocket clients also retry outdated wrong accusations after a teammate succeeds; all receive the existing reveal without creating another accusation event. No browser executable is installed in the current environment, so this pass does not claim browser click-through or visual QA.
