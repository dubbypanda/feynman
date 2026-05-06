# CHANGELOG

Workspace lab notebook for long-running or resumable research work.

Use this file to track chronology, not release notes. Keep entries short, factual, and operational.

## Entry template

### YYYY-MM-DD HH:MM TZ — [slug or objective]

- Objective: ...
- Changed: ...
- Verified: ...
- Failed / learned: ...
- Blockers: ...
- Next: ...

### 2026-05-06 00:00 local — github-issues-150-153

- Objective: Read the current Feynman GitHub issues and fix the open tracker items end to end.
- Changed: Fixed bundled package seeding so copied runtime packages satisfy startup package checks; seeded bundles before interactive setup reports missing packages; restricted Feynman and sqlite-backed native package support to Node 22; moved release CI to Node 22; restored token-based npm publishing; applied the biomedical literature review docs from PR #152; bumped the package to `0.2.41`.
- Verified: Ran `npm test` with 151/151 passing, `npm run typecheck`, `npm run build`, `cd website && npm run build`, `node bin/feynman.js --version`, and a fresh `FEYNMAN_HOME` package-detection smoke that reported zero missing startup packages.
- Failed / learned: The package seeding bug was not just missing files; copied bundled packages were present but not counted as seeded because the check only recognized symlink targets.
- Blockers: Need release CI observation and tracker closure/comments.
- Next: Confirm the follow-up release run publishes `0.2.41`, then close/comment issues #150, #151, #153 and PR #152.

### 2026-04-12 00:00 local — capital-france

- Objective: Run an unattended deep-research workflow for the question "What is the capital of France?"
- Changed: Created plan artifact at `outputs/.plans/capital-france.md`; scoped the workflow as a narrow fact-verification run with direct lead-agent evidence gathering instead of researcher subagents.
- Verified: Read existing `CHANGELOG.md` and recalled prior saved plan memory for `capital-france` before finalizing the new run plan.
- Failed / learned: None yet.
- Blockers: Need at least two current independent authoritative sources and a quick ambiguity check before drafting.
- Next: Collect current official/public sources, resolve any legal nuance, then draft and verify the brief.

### 2026-04-12 00:20 local — capital-france

- Objective: Complete evidence gathering and ambiguity check for the capital-of-France workflow.
- Changed: Wrote `notes/capital-france-research-web.md` and `notes/capital-france-legal-context.md`; identified Insee (2024) and a Sénat report as the two main corroborating sources.
- Verified: Cross-read current public French sources that explicitly describe Paris as the capital/capital city of France; found no current contradiction.
- Failed / learned: The Presidency homepage was useful contextual support but not explicit enough to carry the core claim alone.
- Blockers: Need citation pass and final review pass before promotion.
- Next: Draft the brief, then run verifier and reviewer passes.

### 2026-04-12 00:35 local — capital-france

- Objective: Move from gathered evidence to a citable draft.
- Changed: Wrote `outputs/.drafts/capital-france-draft.md` and updated the plan ledger to mark drafting complete.
- Verified: Kept the core claim narrowly scoped to what the Insee and Sénat sources explicitly support; treated the Élysée page as contextual only.
- Failed / learned: None.
- Blockers: Need verifier URL/citation pass and reviewer verification pass before final promotion.
- Next: Run verifier on the draft, then review and promote the final brief.

### 2026-04-12 00:50 local — capital-france

- Objective: Complete citation, verification, and final promotion for the capital-of-France workflow.
- Changed: Produced `outputs/capital-france-brief.md`, ran verification into `notes/capital-france-verification.md`, promoted the final brief to `outputs/capital-france.md`, and wrote `outputs/capital-france.provenance.md`.
- Verified: Reviewer found no FATAL or MAJOR issues. Core claim remains backed by two independent French public-institution sources, with Insee as the primary explicit source and the Sénat report as corroboration.
- Failed / learned: The runtime did not expose a named `verifier` subagent, so I used an available worker in a verifier-equivalent role and recorded that deviation in the plan.
- Blockers: None.
- Next: If needed, extend the brief with deeper legal-historical sourcing, but the narrow factual question is sufficiently answered.

### 2026-04-12 10:05 local — capital-france

- Objective: Run the citation-verification pass on the capital-of-France draft and promote a final cited brief.
- Changed: Verified the three draft source URLs were live (HTTP 200 at check time), added numbered inline citations, downgraded unsupported phrasing around the Élysée/context and broad ambiguity claims, and wrote `outputs/capital-france-brief.md`.
- Verified: Confirmed Insee explicitly says Paris is the capital of France; confirmed the Sénat report describes Paris’s capital status and the presence of national institutions; confirmed the Élysée homepage is contextual only and not explicit enough to carry the core claim.
- Failed / learned: The draft wording about the Presidency being seated in Paris was not directly supported by the cited homepage, so it was removed rather than carried forward.
- Blockers: Reviewer pass still pending if the workflow requires an adversarial final check.
- Next: If needed, run a final reviewer pass; otherwise use `outputs/capital-france-brief.md` as the canonical brief.

### 2026-04-12 10:20 local — capital-france

- Objective: Close the workflow with final review, final artifact promotion, and provenance.
- Changed: Ran a reviewer pass recorded in `notes/capital-france-verification.md`; promoted the cited brief into `outputs/capital-france.md`; wrote `outputs/capital-france.provenance.md`; updated the run plan to mark all tasks complete.
- Verified: Reviewer verdict was PASS WITH MINOR REVISIONS only; those minor wording fixes were applied before delivery.
- Failed / learned: The runtime did not expose a project-named `verifier` agent, so the citation pass used an available worker agent as a verifier-equivalent step.
- Blockers: None.
- Next: Optional only — produce a legal memorandum on the basis of Paris's capital status if requested.

### 2026-04-14 12:00 local — capital-belgium

- Objective: Run a deep-research workflow for the question "What is the capital of Belgium?"
- Changed: Created plan artifact at `outputs/.plans/capital-belgium.md`; gathered evidence into `notes/capital-belgium-research-web.md` from Belgium.be, FPS Foreign Affairs, Britannica, and a Belgian Senate constitution check.
- Verified: Found two explicit current Belgian government statements that Brussels is the federal capital of Belgium, plus independent Britannica corroboration; no conflicting nuance surfaced in the consulted legal text.
- Failed / learned: This is narrow enough that researcher subagents would add overhead without increasing evidence quality.
- Blockers: Need draft, citation/URL verification pass, final review pass, and promotion.
- Next: Draft the brief, run verifier-equivalent and reviewer passes, then promote final output with provenance.

### 2026-04-14 12:25 local — capital-belgium

- Objective: Complete citation, verification, and final promotion for the capital-of-Belgium workflow.
- Changed: Wrote `outputs/.drafts/capital-belgium-draft.md`; produced cited brief `outputs/capital-belgium-brief.md`; ran verification into `notes/capital-belgium-verification.md`; promoted final output to `outputs/capital-belgium.md`; wrote `outputs/capital-belgium.provenance.md`; updated the plan ledger and verification log.
- Verified: Core claim is now backed by Belgium.be, Belgian Foreign Affairs, Britannica, and direct constitutional text from Senate-hosted Article 194 stating that Brussels is the capital of Belgium and the seat of the federal government.
- Failed / learned: The runtime did not expose a named `verifier` subagent, so a worker performed a verifier-equivalent citation/URL check; reviewer surfaced a stronger constitutional source than the first draft had emphasized.
- Blockers: None.
- Next: Optional only — if requested, expand this into a legal-historical note on Brussels’s capital status and the distinction between city, region, and federal institutions.

### 2026-03-25 00:00 local — scaling-laws

- Objective: Set up a deep research workflow for scaling laws.
- Changed: Created plan artifact at `outputs/.plans/scaling-laws.md`; defined 4 disjoint researcher dimensions and acceptance criteria.
- Verified: Read `CHANGELOG.md` and checked prior memory for related plan `scaling-laws-implications`.
- Failed / learned: No prior run-specific changelog entries existed beyond the template.
- Blockers: Waiting for user confirmation before launching researcher round 1.
- Next: On confirmation, spawn 4 parallel researcher subagents and begin evidence collection.

### 2026-03-25 00:30 local — scaling-laws (T4 inference/time-scale pass)

- Objective: Complete T4 on inference/test-time scaling and reasoning-time compute, scoped to 2023–2026.
- Changed: Wrote `notes/scaling-laws-research-inference.md`; updated `outputs/.plans/scaling-laws.md` to mark T4 done and log the inference-scaling verification pass.
- Verified: Cross-read 13 primary/official sources covering Tree-of-Thoughts, PRMs, repeated sampling, compute-optimal test-time scaling, provable laws, o1, DeepSeek-R1, s1, verifier failures, Anthropic extended thinking, and OpenAI reasoning API docs.
- Failed / learned: OpenAI blog fetch for `learning-to-reason-with-llms` returned malformed content, so the note leans on the o1 system card and API docs instead of that blog post.
- Blockers: T2 and T5 remain open before final synthesis; no single unified law for inference-time scaling emerged from public sources.
- Next: Complete T5 implications synthesis, then reconcile T3/T4 with foundational T2 before drafting the cited brief.

### 2026-03-25 11:20 local — scaling-laws (T6 draft synthesis)

- Objective: Synthesize the four research notes into a single user-facing draft brief for the scaling-laws workflow.
- Changed: Wrote `outputs/.drafts/scaling-laws-draft.md` with an executive summary, curated reading list, qualitative meta-analysis, core-paper comparison table, explicit training-vs-inference distinction, and numbered inline citations with direct-URL sources.
- Verified: Cross-checked the draft against `notes/scaling-laws-research-foundations.md`, `notes/scaling-laws-research-revisions.md`, `notes/scaling-laws-research-inference.md`, and `notes/scaling-laws-research-implications.md` to ensure the brief explicitly states the literature is too heterogeneous for a pooled effect-size estimate.
- Failed / learned: The requested temp-run `context.md` and `plan.md` were absent, so the synthesis used `outputs/.plans/scaling-laws.md` plus the four note files as the working context.
- Blockers: Citation/claim verification pass still pending; this draft should be treated as pre-verification.
- Next: Run verifier/reviewer passes, then promote the draft into the final cited brief and provenance sidecar.

### 2026-03-25 11:28 local — scaling-laws (final brief + pdf)

- Objective: Deliver a paper guide and qualitative meta-analysis on AI scaling laws.
- Changed: Finalized `outputs/scaling-laws.md` and sidecar `outputs/scaling-laws.provenance.md`; rendered preview PDF at `outputs/scaling-laws.pdf`; updated plan ledger and verification log in `outputs/.plans/scaling-laws.md`.
- Verified: Ran a reviewer pass recorded in `notes/scaling-laws-verification.md`; spot-checked key primary papers via alpha-backed reads for Kaplan 2020, Chinchilla 2022, and Snell 2024; confirmed PDF render output exists.
- Failed / learned: A pooled statistical meta-analysis would be misleading because the literature mixes heterogeneous outcomes, scaling axes, and evaluation regimes; final deliverable uses a qualitative meta-analysis instead.
- Blockers: None for this brief.
- Next: If needed, extend into a narrower sub-survey (e.g. only pretraining laws, only inference-time scaling, or only post-Chinchilla data-quality revisions).

### 2026-03-25 14:52 local — skills-only-install

- Objective: Let users download the Feynman research skills without installing the full terminal runtime.
- Changed: Added standalone skills-only installers at `scripts/install/install-skills.sh` and `scripts/install/install-skills.ps1`; synced website-public copies; documented user-level and repo-local install flows in `README.md`, `website/src/content/docs/getting-started/installation.md`, and `website/src/pages/index.astro`.
- Verified: Ran `sh -n scripts/install/install-skills.sh`; ran `node scripts/sync-website-installers.mjs`; ran `cd website && npm run build`; executed `sh scripts/install/install-skills.sh --dir <tmp>` and confirmed extracted `SKILL.md` files land in the target directory.
- Failed / learned: PowerShell installer behavior was not executed locally because PowerShell is not installed in this environment.
- Blockers: None for the Unix installer flow; Windows remains syntax-only by inspection.
- Next: If users want this exposed more prominently, add a dedicated docs/reference page and a homepage-specific skills-only CTA instead of a text link.

### 2026-03-26 18:08 PDT — installer-release-unification

- Objective: Remove the moving `edge` installer channel and unify installs on tagged releases only.
- Changed: Updated `scripts/install/install.sh`, `scripts/install/install.ps1`, `scripts/install/install-skills.sh`, and `scripts/install/install-skills.ps1` so the default target is the latest tagged release, latest-version resolution uses public GitHub release pages instead of `api.github.com`, and explicit `edge` requests now fail with a removal message; removed the `release-edge` job from `.github/workflows/publish.yml`; updated `README.md` and `website/src/content/docs/getting-started/installation.md`; re-synced `website/public/install*`.
- Verified: Ran `sh -n` on the Unix installer copies; confirmed `sh scripts/install/install.sh edge` and `sh scripts/install/install-skills.sh edge --dir <tmp>` fail with the intended removal message; executed `sh scripts/install/install.sh` into temp dirs and confirmed the installed binary reports `0.2.14`; executed `sh scripts/install/install-skills.sh --dir <tmp>` and confirmed extracted `SKILL.md` files; ran `cd website && npm run build`.
- Failed / learned: The install failure was caused by unauthenticated GitHub API rate limiting on the `edge` path, so renaming channels without removing the API dependency would not have fixed the root cause.
- Blockers: `npm run build` still emits a pre-existing duplicate-content warning for `getting-started/installation`; the build succeeds.
- Next: If desired, remove the now-unused `stable` alias too and clean up the duplicate docs-content warning separately.

### 2026-03-27 11:58 PDT — release-0.2.15

- Objective: Make the non-Anthropic subagent/auth fixes and contributor-guide updates releasable to tagged-install users instead of leaving them only on `main`.
- Changed: Bumped the package version from `0.2.14` to `0.2.15` in `package.json` and `package-lock.json`; updated pinned installer examples in `README.md` and `website/src/content/docs/getting-started/installation.md`; aligned the local-development docs example to the npm-based root workflow; added `CONTRIBUTING.md` plus the bundled `skills/contributing/SKILL.md`.
- Verified: Confirmed the publish workflow keys off `package.json` versus the currently published npm version; confirmed local `npm test`, `npm run typecheck`, and `npm run build` pass before the release bump.
- Failed / learned: The open subagent issue is fixed on `main` but still user-visible on tagged installs until a fresh release is cut.
- Blockers: Need the GitHub publish workflow to finish successfully before the issue can be honestly closed as released.
- Next: Push `0.2.15`, monitor the publish workflow, then update and close the relevant GitHub issue/PR once the release is live.

### 2026-03-28 15:15 PDT — pi-subagents-agent-dir-compat

- Objective: Debug why tagged installs can still fail subagent/auth flows after `0.2.15` when users are not on Anthropic.
- Changed: Added `scripts/lib/pi-subagents-patch.mjs` plus type declarations and wired `scripts/patch-embedded-pi.mjs` to rewrite vendored `pi-subagents` runtime files so they resolve user-scoped paths from `PI_CODING_AGENT_DIR` instead of hardcoded `~/.pi/agent`; added `tests/pi-subagents-patch.test.ts`.
- Verified: Materialized `.feynman/npm`, inspected the shipped `pi-subagents@0.11.11` sources, confirmed the hardcoded `~/.pi/agent` paths in `index.ts`, `agents.ts`, `artifacts.ts`, `run-history.ts`, `skills.ts`, and `chain-clarify.ts`; ran `node scripts/patch-embedded-pi.mjs`; ran `npm test`, `npm run typecheck`, and `npm run build`.
- Failed / learned: The earlier `0.2.15` fix only proved that Feynman exported `PI_CODING_AGENT_DIR` to the top-level Pi child; it did not cover vendored extension code that still hardcoded `.pi` paths internally.
- Blockers: Users still need a release containing this patch before tagged installs benefit from it.
- Next: Cut the next release and verify a tagged install exercises subagents without reading from `~/.pi/agent`.

### 2026-03-28 21:46 PDT — release-0.2.16

- Objective: Ship the vendored `pi-subagents` agent-dir compatibility fix to tagged installs.
- Changed: Bumped the package version from `0.2.15` to `0.2.16` in `package.json` and `package-lock.json`; updated pinned installer examples in `README.md` and `website/src/content/docs/getting-started/installation.md`.
- Verified: Re-ran `npm test`, `npm run typecheck`, and `npm run build`; ran `cd website && npm run build`; ran `npm pack` and confirmed the `0.2.16` tarball includes the new `scripts/lib/pi-subagents-patch.*` files.
- Failed / learned: An initial local `build:native-bundle` check failed because `npm pack` and `build:native-bundle` were run in parallel, and `prepack` intentionally removes `dist/release`; rerunning `npm run build:native-bundle` sequentially succeeded.
- Blockers: None in the repo; publishing still depends on the GitHub workflow running on the bumped version.
- Next: Push the `0.2.16` release bump and monitor npm/GitHub release publication.

### 2026-03-31 10:45 PDT — pi-maintenance-issues-prs

- Objective: Triage open Pi-related issues/PRs, fix the concrete package update regression, and refresh Pi dependencies against current upstream releases.
- Changed: Pinned direct package-manager operations (`feynman update`, `feynman packages install`) to Feynman's npm prefix by exporting `FEYNMAN_NPM_PREFIX`, `NPM_CONFIG_PREFIX`, and `npm_config_prefix` before invoking Pi's `DefaultPackageManager`; bumped `@mariozechner/pi-ai` and `@mariozechner/pi-coding-agent` from `0.62.0` to `0.64.0`; adapted `src/model/registry.ts` to the new `ModelRegistry.create(...)` factory; integrated PR #15's `/feynman-model` command on top of current `main`.
- Verified: Ran `npm test`, `npm run typecheck`, and `npm run build` successfully after the dependency bump and PR integration; confirmed upstream `pi-coding-agent@0.64.0` still uses `npm install -g` for user-scope package updates, so the Feynman-side prefix fix is still required.
- Failed / learned: PR #14 is a stale branch with no clean merge path against current `main`; the only user-facing delta is the ValiChord prompt/skill addition, and the branch also carries unrelated release churn plus demo-style material, so it was not merged in this pass.
- Blockers: None in the local repo state; remote merge/push still depends on repository credentials and branch policy.
- Next: If remote write access is available, commit and push the validated maintenance changes, then close issue #22 and resolve PR #15 as merged while leaving PR #14 unmerged pending a cleaned-up, non-promotional resubmission.

### 2026-03-31 12:05 PDT — pi-backlog-cleanup-round-2

- Objective: Finish the remaining high-confidence open tracker items after the Pi 0.64.0 upgrade instead of leaving the issue list half-reconciled.
- Changed: Added a Windows extension-loader patch helper so Feynman rewrites Pi extension imports to `file://` URLs on Windows before interactive startup; added `/commands`, `/tools`, and `/capabilities` discovery commands and surfaced `/hotkeys` plus `/service-tier` in help metadata; added explicit service-tier support via `feynman model tier`, `--service-tier`, status/doctor output, and a provider-payload hook that passes `service_tier` only to supported OpenAI/OpenAI Codex/Anthropic models; added Exa provider recognition to Feynman's web-search status layer and vendored `pi-web-access`.
- Verified: Ran `npm test`, `npm run typecheck`, and `npm run build`; smoke-imported the modified vendored `pi-web-access` modules with `node --import tsx`.
- Failed / learned: The remaining ValiChord PR is still stale and mixes a real prompt/skill update with unrelated branch churn; it is a review/triage item, not a clean merge candidate.
- Blockers: No local build blockers remain; issue/PR closure still depends on the final push landing on `main`.
- Next: Push the verified cleanup commit, then close issues fixed by the dependency bump plus the new discoverability/service-tier/Windows patches, and close the stale ValiChord PR explicitly instead of leaving it open indefinitely.

### 2026-04-09 09:37 PDT — windows-startup-import-specifiers

- Objective: Fix Windows startup failures where `feynman` exits before the Pi child process initializes.
- Changed: Converted the Node preload module paths passed via `node --import` in `src/pi/launch.ts` to `file://` specifiers using a new `toNodeImportSpecifier(...)` helper in `src/pi/runtime.ts`; expanded `scripts/patch-embedded-pi.mjs` so it also patches the bundled workspace copy of Pi's extension loader when present.
- Verified: Added a regression test in `tests/pi-runtime.test.ts` covering absolute-path to `file://` conversion for preload imports; ran `npm test`, `npm run typecheck`, and `npm run build`.
- Failed / learned: The raw Windows `ERR_UNSUPPORTED_ESM_URL_SCHEME` stack is more consistent with Node rejecting the child-process `--import C:\\...` preload before Pi starts than with a normal in-app extension load failure.
- Blockers: Windows runtime execution was not available locally, so the fix is verified by code path inspection and automated tests rather than an actual Windows shell run.
- Next: Ask the affected user to reinstall or update to the next published package once released, and confirm the Windows REPL now starts from a normal PowerShell session.

### 2026-04-09 11:02 PDT — tracker-hardening-pass

- Objective: Triage the open repo backlog, land the highest-signal fixes locally, and add guardrails against stale promotional workflow content.
- Changed: Hardened Windows launch paths in `bin/feynman.js`, `scripts/build-native-bundle.mjs`, and `scripts/install/install.ps1`; set npm prefix overrides earlier in `scripts/patch-embedded-pi.mjs`; added a `pi-web-access` runtime patch helper plus `FEYNMAN_WEB_SEARCH_CONFIG` env wiring so bundled web search reads the same `~/.feynman/web-search.json` that doctor/status report; taught `src/pi/web-access.ts` to honor the legacy `route` key; fixed bundled skill references and expanded the skills-only installers/docs to ship the prompt and guidance files those skills reference; added regression tests for config paths, catalog snapshot edges, skill-path packaging, `pi-web-access` patching, and blocked promotional content.
- Verified: Ran `npm test`, `npm run typecheck`, and `npm run build` successfully after the full maintenance pass.
- Failed / learned: The skills-only install issue was not just docs drift; the shipped `SKILL.md` files referenced prompt paths that only made sense after installation, so the repo needed both path normalization and packaging changes.
- Blockers: Remote issue/PR closure and merge actions still depend on the final reviewed branch state being pushed.
- Next: Push the validated fixes, close the duplicate Windows/reporting issues they supersede, reject the promotional ValiChord PR explicitly, and then review whether the remaining docs-only or feature PRs should be merged separately.

### 2026-04-09 10:28 PDT — verification-and-security-pass

- Objective: Run a deeper install/security verification pass against the post-cleanup `0.2.17` tree instead of assuming the earlier targeted fixes covered the shipped artifacts.
- Changed: Reworked `extensions/research-tools/header.ts` to use `@mariozechner/pi-tui` width-aware helpers for truncation/wrapping so wide Unicode text does not overflow custom header rows; changed `src/pi/launch.ts` to stop mirroring child crash signals back onto the parent process and instead emit a conventional exit code; added `FEYNMAN_INSTALL_SKILLS_ARCHIVE_URL` overrides to the skills installers for pre-release smoke testing; aligned root and website dependency trees with patched transitive versions using npm `overrides`; fixed `src/pi/web-access.ts` so `search status` respects `FEYNMAN_HOME` semantics instead of hardcoding the current shell home directory; added `tests/pi-launch.test.ts`.
- Verified: Ran `npm test`, `npm run typecheck`, `npm run build`, `cd website && npm run build`, `npm run build:native-bundle`; smoke-tested `scripts/install/install.sh` against a locally served `dist/release/feynman-0.2.17-darwin-arm64.tar.gz`; smoke-tested `scripts/install/install-skills.sh` against a local source archive; confirmed installed `feynman --version`, `feynman --help`, `feynman doctor`, and packaged `feynman search status` work from the installed bundle; `npm audit --omit=dev` is clean in the root app and website after overrides.
- Failed / learned: The first packaged `search status` smoke test still showed the user home path because the native bundle had been built before the `FEYNMAN_HOME` path fix; rebuilding the native bundle resolved that mismatch.
- Blockers: PowerShell runtime was unavailable locally, so Windows installer execution remained code-path validated rather than actually executed.
- Next: Push the second-pass hardening commit, then keep issue `#46` and issue `#47` open until users on the affected Linux/CJK environments confirm whether the launcher/header fixes fully resolve them.

### 2026-04-09 10:36 PDT — remaining-tracker-triage-pass

- Objective: Reduce the remaining open tracker items by landing the lowest-risk missing docs/catalog updates and a targeted Cloud Code Assist compatibility patch instead of only hand-triaging them.
- Changed: Added MiniMax M2.7 recommendation preferences in `src/model/catalog.ts`; documented model switching, authenticated-provider visibility, and `/feynman-model` subagent overrides in `website/src/content/docs/getting-started/configuration.md` and `website/src/content/docs/reference/slash-commands.md`; added a runtime patch helper in `scripts/lib/pi-google-legacy-schema-patch.mjs` and wired `scripts/patch-embedded-pi.mjs` to normalize JSON Schema `const` into `enum` for the legacy `parameters` field used by Cloud Code Assist Claude models.
- Verified: Ran `npm test`, `npm run typecheck`, `npm run build`, and `cd website && npm run build` after the patch/helper/docs changes.
- Failed / learned: The MiniMax provider catalog in Pi already uses canonical IDs like `MiniMax-M2.7`, so the only failure during validation was a test assertion using the wrong casing rather than a runtime bug.
- Blockers: The Cloud Code Assist fix is validated by targeted patch tests and code-path review rather than an end-to-end Google account repro in this environment.
- Next: Push the tracker-triage commit, close the docs/MiniMax PRs as superseded by main, close the support-style model issues against the new docs, and decide whether the remaining feature requests should be left open or closed as not planned/upstream-dependent.

### 2026-04-10 10:22 PDT — web-access-stale-override-fix

- Objective: Fix the new `ctx.modelRegistry.getApiKeyAndHeaders is not a function` / stale `search-filter.js` report without reintroducing broad vendor drift.
- Changed: Removed the stale `.feynman/vendor-overrides/pi-web-access/*` files and removed `syncVendorOverride` from `scripts/patch-embedded-pi.mjs`; kept the targeted `pi-web-access` runtime config-path patch; added `feynman search set <provider> [api-key]` and `feynman search clear` commands with a shared save path in `src/pi/web-access.ts`.
- Verified: Ran `npm test`, `npm run typecheck`, `npm run build`; ran `node scripts/patch-embedded-pi.mjs`, confirmed the installed `pi-web-access/index.ts` has no `search-filter` / condense helper references, and smoke-imported `./.feynman/npm/node_modules/pi-web-access/index.ts`; ran `npm pack --dry-run` and confirmed stale `vendor-overrides` files are no longer in the package tarball.
- Failed / learned: The public Linux installer Docker test was attempted but Docker Desktop became unresponsive even for simple `docker run node:22-bookworm node -v` commands; the earlier Linux npm-artifact container smoke remains valid, but this specific public-installer run is blocked by the local Docker daemon.
- Blockers: Issue `#54` is too underspecified to fix directly without logs; public Linux installer behavior still needs a stable Docker daemon or a real Linux shell to reproduce the user's exact npm errors.
- Next: Push the stale-override fix, close PR `#52` and PR `#53` as superseded/merged-by-main once pushed, and ask for logs on issue `#54` instead of guessing.

### 2026-04-10 10:49 PDT — rpc-and-website-verification-pass

- Objective: Exercise the Feynman wrapper's RPC mode and the website quality gates that were not fully covered by the prior passes.
- Changed: Added `--mode <text|json|rpc>` pass-through support in the Feynman wrapper and skipped terminal clearing in RPC mode; added `@astrojs/check` to the website dev dependencies, fixed React Refresh lint violations in the generated UI components by exporting only components, and added safe website dependency overrides for dev-audit findings.
- Verified: Ran a JSONL RPC smoke test through `node bin/feynman.js --mode rpc` with `get_state`; ran `npm test`, `npm run typecheck`, `npm run build`, `cd website && npm run lint`, `cd website && npm run typecheck`, `cd website && npm run build`, full root `npm audit`, full website `npm audit`, and `npm run build:native-bundle`.
- Failed / learned: Website typecheck was previously a no-op prompt because `@astrojs/check` was missing; installing it exposed dev-audit findings that needed explicit overrides before the full website audit was clean.
- Blockers: Docker Desktop remained unreliable after restart attempts, so this pass still does not include a second successful public-installer Linux Docker run.
- Next: Push the RPC/website verification commit and keep future Docker/public-installer validation separate from repo correctness unless Docker is stable.

### 2026-04-12 09:32 PDT — pi-0.66.1-upgrade-pass

- Objective: Update Feynman from Pi `0.64.0` to the current `0.66.1` packages and absorb any downstream SDK/runtime compatibility changes instead of leaving the repo pinned behind upstream.
- Changed: Bumped `@mariozechner/pi-ai` and `@mariozechner/pi-coding-agent` to `0.66.1` plus `@companion-ai/alpha-hub` to `0.1.3` in `package.json` and `package-lock.json`; updated `extensions/research-tools.ts` to stop listening for the removed `session_switch` extension event and rely on `session_start`, which now carries startup/reload/new/resume/fork reasons in Pi `0.66.x`.
- Verified: Ran `npm test`, `npm run typecheck`, and `npm run build` successfully after the upgrade; smoke-ran `node bin/feynman.js --version`, `node bin/feynman.js doctor`, and `node bin/feynman.js status` successfully; checked upstream package diffs and confirmed the breaking change that affected this repo was the typed extension lifecycle change in `pi-coding-agent`, while `pi-ai` mainly brought refreshed provider/model catalog code including Bedrock/OpenAI provider updates and new generated model entries.
- Failed / learned: `ctx7` resolved Pi correctly to `/badlogic/pi-mono`, but its docs snapshot was not release-note oriented; the concrete downstream-impact analysis came from the actual `0.64.0` → `0.66.1` package diffs and local validation, not from prose docs alone.
- Failed / learned: The first post-upgrade CLI smoke test failed before Feynman startup because `@companion-ai/alpha-hub@0.1.2` shipped a zero-byte `src/lib/auth.js`; bumping to `0.1.3` fixed that adjacent runtime blocker.
- Blockers: `npm install` reports two high-severity vulnerabilities remain in the dependency tree; this pass focused on the Pi upgrade and did not remediate unrelated audit findings.
- Next: Push the Pi upgrade, then decide whether to layer the pending model-command fixes on top of this branch or land them separately to keep the dependency bump easy to review.

### 2026-04-12 13:00 PDT — model-command-and-bedrock-fix-pass

- Objective: Finish the remaining user-facing model-management regressions instead of stopping at the Pi dependency bump.
- Changed: Updated `src/model/commands.ts` so `feynman model login <provider>` resolves both OAuth and API-key providers; `feynman model logout <provider>` clears either auth mode; `feynman model set` accepts both `provider/model` and `provider:model`; ambiguous bare model IDs now prefer explicitly configured providers from auth storage; added an `amazon-bedrock` setup path that validates the AWS credential chain with the AWS SDK and stores Pi's `<authenticated>` sentinel so Bedrock models appear in `model list`; synced `src/cli.ts`, `metadata/commands.mjs`, `README.md`, and the website docs to the new behavior.
- Verified: Added regression tests in `tests/model-harness.test.ts` for `provider:model`, API-key provider resolution, and ambiguous bare-ID handling; ran `npm test`, `npm run typecheck`, `npm run build`, and `cd website && npm run build`; exercised command-level flows against throwaway `FEYNMAN_HOME` directories: interactive `node bin/feynman.js model login google`, `node bin/feynman.js model set google:gemini-3-pro-preview`, `node bin/feynman.js model set gpt-5.4` with only OpenAI configured, and `node bin/feynman.js model login amazon-bedrock`; confirmed `model list` shows Bedrock models after the new setup path; ran a live one-shot prompt `node bin/feynman.js --prompt "Reply with exactly OK"` and got `OK`.
- Failed / learned: The website build still emits duplicate-id warnings for a handful of docs pages, but it completes successfully; those warnings predate this pass and were not introduced by the model-command edits.
- Blockers: The Bedrock path is verified with the current shell's AWS credential chain, not with a fresh machine lacking AWS config; broader upstream Pi behavior around IMDS/default-profile autodiscovery without the sentinel is still outside this repo.
- Next: Commit and push the combined Pi/model/docs maintenance branch, then decide whether to tackle the deeper search/deepresearch hang issues separately or leave them for focused repro work.

### 2026-04-12 13:35 PDT — workflow-unattended-and-search-curator-fix-pass

- Objective: Fix the remaining workflow deadlocks instead of leaving `deepresearch` and terminal web search half-functional after the maintenance push.
- Changed: Updated the built-in research workflow prompts (`deepresearch`, `lit`, `review`, `audit`, `compare`, `draft`, `watch`) so they present the plan and continue automatically rather than blocking for approval; extended the `pi-web-access` runtime patch so Feynman rewrites its default workflow from browser-based `summary-review` to `none`; added explicit `workflow: "none"` persistence in `src/search/commands.ts` and `src/pi/web-access.ts`, plus surfaced the workflow in doctor/status-style output.
- Verified: Reproduced the original `deepresearch` failure mode in print mode, where the run created `outputs/.plans/capital-france.md` and then stopped waiting for user confirmation; after the prompt changes, reran `deepresearch "What is the capital of France?"` and confirmed it progressed beyond planning and produced `outputs/.drafts/capital-france-draft.md`; inspected `pi-web-access@0.10.6` and confirmed the exact `waiting for summary approval...` string and `summary-review` default live in that package; added regression tests for the new `pi-web-access` patch and workflow-none status handling; reran `npm test`, `npm run typecheck`, and `npm run build`; smoke-tested `feynman search set exa exa_test_key` under a throwaway `FEYNMAN_HOME` and confirmed it writes `"workflow": "none"` to `web-search.json`.
- Failed / learned: The long-running deepresearch session still spends substantial time in later reasoning/writing steps for even a narrow query, but the plan-confirmation deadlock itself is resolved; the remaining slowness is model/workflow behavior, not the original stop-after-plan bug.
- Blockers: I did not install and execute the full optional `pi-session-search` package locally, so the terminal `summary approval` fix is validated by source inspection plus the Feynman patch path and config persistence rather than a local end-to-end package install.
- Next: Commit and push the workflow/search fix pass, then close or answer the remaining deepresearch/search issues with the specific root causes and shipped fixes.

### 2026-04-12 14:05 PDT — final-artifact-hardening-pass

- Objective: Reduce the chance of unattended research workflows stopping at intermediate artifacts like `<slug>-brief.md` without promoting the final deliverable and provenance sidecar.
- Changed: Tightened `prompts/deepresearch.md` so the agent must verify on disk that the plan, draft, cited brief, promoted final output, and provenance sidecar all exist before stopping; tightened `prompts/lit.md` so it explicitly checks for the final output plus provenance sidecar instead of stopping at an intermediate cited draft.
- Verified: Cross-read the current deepresearch/lit deliver steps after the earlier unattended-run reproductions and confirmed the missing enforcement point was the final on-disk artifact check, not the naming convention itself.
- Failed / learned: This is still prompt-level enforcement rather than a deterministic post-processing hook, so it improves completion reliability but does not provide the same guarantees as a dedicated artifact-finalization wrapper.
- Blockers: I did not rerun a full broad deepresearch workflow end-to-end after this prompt-only hardening because those runs are materially longer and more expensive than the narrow reproductions already used to isolate the earlier deadlocks.
- Next: Commit and push the prompt hardening, then, if needed, add a deterministic wrapper around final artifact promotion instead of relying only on prompt adherence.

### 2026-04-14 09:30 PDT — wsl-login-and-uninstall-docs-pass

- Objective: Fix the remaining WSL setup blocker and close the last actionable support issue instead of leaving the tracker open after the earlier workflow/model fixes.
- Changed: Added a dedicated alpha-hub auth patch helper and tests; extended the alphaXiv login patch so WSL uses `wslview` when available and falls back to `cmd.exe /c start`, while also printing the auth URL explicitly for manual copy/paste if browser launch still fails; documented standalone uninstall steps in `README.md` and `website/src/content/docs/getting-started/installation.md`.
- Verified: Added regression tests for the alpha-hub auth patch, reran `npm test`, `npm run typecheck`, and `npm run build`, and smoke-checked the patched alpha-hub source rewrite to confirm it injects both the WSL browser path and the explicit auth URL logging.
- Failed / learned: This repo can patch alpha-hub's login UX reliably, but it still does not ship a destructive `feynman uninstall` command; the practical fix for the support issue is documented uninstall steps rather than a rushed cross-platform remover.
- Blockers: I did not run a true WSL shell here, so the WSL fix is validated by the deterministic source patch plus tests rather than an actual Windows-hosted browser-launch repro.
- Next: Push the WSL/login pass and close the stale issues and PRs that are already superseded by `main`.

### 2026-04-14 09:35 PDT — review-findings-and-audit-cleanup

- Objective: Fix the remaining concrete issues found in the deeper review pass instead of stopping at tracker cleanup.
- Changed: Updated the `pi-web-access` patch so Feynman defaults search workflow to `none` without disabling explicit `summary-review`; softened the research workflow prompts so only unattended/one-shot runs auto-continue while interactive users still get a chance to request plan changes; corrected uninstall docs to mention `~/.ahub` alongside `~/.feynman`; bumped the root `basic-ftp` override from `5.2.1` to `5.2.2`.
- Verified: Ran `npm test`, `npm run typecheck`, `npm run build`, `cd website && npm run build`, and `npm audit`; root audit is now clean.
- Failed / learned: Astro still emits a duplicate-content-id warning for `website/src/content/docs/getting-started/installation.md`, but the website build succeeds and I did not identify a low-risk repo-side fix for that warning in this pass.
- Blockers: The duplicate-id warning remains as a build warning only, not a failing correctness gate.
- Next: If desired, isolate the Astro duplicate-id warning separately with a minimal reproduction rather than mixing it into runtime/CLI maintenance.

### 2026-04-14 10:55 PDT — summarize-workflow-restore

- Objective: Restore the useful summarization workflow that had been closed in PR `#69` without being merged.
- Changed: Added `prompts/summarize.md` as a top-level CLI workflow so `feynman summarize <source>` is available again; kept the RLM-based tiering approach from the original proposal and aligned Tier 3 confirmation behavior with the repo's unattended-run conventions.
- Verified: Confirmed `feynman summarize <source>` appears in CLI help; ran `node bin/feynman.js summarize /tmp/feynman-summary-smoke.txt` against a local smoke file and verified it produced `outputs/feynman-summary-smoke-summary.md` plus the raw fetched note artifact under `outputs/.notes/`.
- Failed / learned: None in the restored Tier 1 path; broader Tier 2/Tier 3 behavior still depends on runtime/model/tool availability, just like the other prompt-driven workflows.
- Blockers: None for the prompt restoration itself.
- Next: If desired, add dedicated docs for `summarize` and decide whether to reopen PR `#69` for historical continuity or leave it closed as superseded by the landed equivalent on `main`.

### 2026-04-12 13:20 PDT — capital-france (citation verification brief)

- Objective: Verify citations in the capital-of-France draft and produce a cited verifier brief.
- Changed: Read `outputs/.drafts/capital-france-draft.md`, `notes/capital-france-research-web.md`, and `notes/capital-france-legal-context.md`; fetched the three draft URLs directly; wrote `notes/capital-france-brief.md` with inline numbered citations and a numbered direct-URL sources list.
- Verified: Confirmed the Insee, Sénat, and Élysée URLs were reachable on 2026-04-12; confirmed Insee and Sénat support the core claim that Paris is the capital of France; marked the Élysée homepage as contextual-only support.
- Failed / learned: The Élysée homepage does not explicitly state the core claim, so it should not be used as sole evidence for capital status.
- Blockers: None for the verifier brief; any stronger legal memo would still need a more direct constitutional/statutory basis if that specific question is asked.
- Next: Promote the brief into the final output or downgrade/remove any claim that leans on the Élysée URL alone.

### 2026-04-20 17:25 PDT — gemini-browser-fallback-opt-in

- Objective: Stop `/deepresearch` web search from reaching Chromium cookie access by default after users reported macOS Keychain prompts from Gemini Web fallback.
- Changed: Updated the `pi-web-access` runtime patch so `isGeminiWebAvailable` returns unavailable unless `web-search.json` explicitly sets `geminiBrowser`/`allowBrowserAuth`/`browserAuth` true; changed search status output and docs to report Gemini browser fallback as disabled by default; made `feynman search set` and `feynman search clear` write `geminiBrowser: false`; corrected web-search docs to recommend Exa, Perplexity, or Gemini API keys for `/deepresearch`.
- Verified: Added regression coverage for the browser fallback opt-in patch and status output; ran focused web-access/search-command tests, full `npm test`, `npm run typecheck`, root `npm run build`, and website `npm run build`.
- Failed / learned: Website build still emits duplicate-content-id warnings for docs pages, but it completes; this pass did not address the pre-existing Astro warning.
- Blockers: Did not run a live `/deepresearch` smoke test because the risk being fixed is source-level keychain probing, which is covered by the deterministic `pi-web-access` patch tests.
- Next: Release the runtime patch and answer the security concern by explaining that browser-cookie access is now explicit opt-in rather than the default fallback.

### 2026-05-03 21:19 PDT — github-issues-e2e

- Objective: Read all currently open GitHub issues, separate concrete regressions from feature-scale requests, and finish the scoped fixes with source, CLI, installer, runtime, and RPC verification.
- Changed: Added a reusable `pi-tui` patch that truncates overwide rendered lines with `sliceByColumn` instead of crashing; wired that patch into startup node_modules patching and vendored runtime preparation; added explicit OpenCode skills installer support for `.opencode/skills/feynman` on Unix and PowerShell; synced README, website docs, and public website installer copies; wrote `outputs/.plans/github-issues-e2e.md` as the run ledger.
- Verified: Checked current Pi and OpenCode docs through Context7; confirmed latest upstream `pi-tui` still has the terminal-width throw so upgrading alone would not fix `#148`; ran focused patch/installer tests, full `npm test` (146 tests), `npm run typecheck`, root `npm run build`, and website `npm run build`; ran `node scripts/prepare-runtime-workspace.mjs` and extracted `.feynman/runtime-workspace.tgz` to verify the packaged `pi-tui` patch and `pruneVersion: 5`; smoke-tested `feynman --help`, `feynman search status`, and `--mode rpc` with a temp custom model plus JSONL `get_state`.
- Failed / learned: A direct CLI smoke with `/usr/local/bin/node` failed because that shell resolves Node `20.17.0`, below Feynman's `>=20.19.0` floor; rerunning with the bundled supported Node `24.14.0` passed. The first RPC smoke from the repo cwd loaded project-local optional packages and hit the existing `pi-web-access` source parse issue, so the accepted RPC smoke used an isolated `--cwd` and temp settings to test the RPC protocol itself.
- Blockers: Issues `#135`-`#139` are larger provider/runtime backend feature proposals, not safe one-pass bug fixes; they were read and classified but not implemented here.
- Next: Close or respond to `#148` and `#143` with the shipped fixes and test evidence, then decide separately whether the provider/runtime proposals belong in a roadmap issue or implementation specs.

### 2026-05-03 23:40 PDT — pi-upstream-alignment

- Objective: Keep Feynman as a thin wrapper over upstream Pi runtime behavior while preserving the curated package stack and Feynman research/theme surface.
- Changed: Upgraded direct Pi packages to `@mariozechner/pi-ai@0.72.1` and `@mariozechner/pi-coding-agent@0.72.1`; restored the curated core package stack with `@devkade/pi-opentelemetry`; extended `pi-web-access` patches for current upstream `gemini-web-config.ts` and older `gemini-web.ts`; wired `pi-web-access` and `pi-tui` patches into the vendored runtime archive path; bumped runtime archive `pruneVersion` to `6`; documented the run in `outputs/.plans/pi-upstream-alignment.md`.
- Verified: Ran Context7 against current Pi docs; ran `npm test` (147 tests), `npm run typecheck`, root `npm run build`, and website `npm run build`; rebuilt `.feynman/runtime-workspace.tgz` with bundled Node `24.14.0`; extracted the archive and verified the packaged `pi-tui`, `pi-web-access`, and manifest patches; ran live one-shot prompts via stored Anthropic OAuth and received `OK` and `42`; reran `feynman model list` and confirmed Anthropic models; ran isolated RPC `get_state` successfully with a temp custom model; ran `feynman search status` and confirmed Gemini browser fallback remains disabled.
- Failed / learned: The packaging script initially omitted the `pi-web-access` patch path, so the local installed package was fixed but the release archive was not; wiring the patch into `prepare-runtime-workspace.mjs` fixed the packaged path. No env API keys were present for OpenAI, Anthropic, Gemini, Google, Exa, Perplexity, Mistral, or OpenRouter, so live non-Anthropic provider/API-search checks remain blocked.
- Blockers: Live web search through Exa/Perplexity/Gemini API could not be tested without keys; browser-cookie Gemini fallback is intentionally disabled by default. `/usr/local/bin/node` remains below Feynman's Node floor, so supported runtime smokes used the bundled Node.
- Next: Review/stage the intended subset, then split unrelated pre-existing local changes if needed before commit/release.

### 2026-05-04 01:45 PDT — pi-thin-wrapper-live-e2e

- Objective: Finish the Pi-thin-wrapper cleanup with local credentials, live providers, RPC, and packaged runtime verification instead of relying only on unit tests.
- Changed: Removed the Feynman-only Anthropic model overlay so `createModelRegistry` now trusts upstream Pi's model catalog; moved the `pi-web-access` `/search` to `/web-results` rename into the shared patch path so local and archived runtimes match; removed the stale Google legacy schema patch that no longer matches `@mariozechner/pi-ai@0.72.1`.
- Verified: Used local credentials without printing secret values; live Feynman one-shots passed for Anthropic OAuth, Anthropic API key, OpenAI API key, Gemini API key, and OpenRouter API key; direct `pi-web-access` smokes passed for Exa no-key MCP fallback and Gemini API search; Perplexity correctly reported unavailable because no key was found; final RPC `get_state` and `get_available_models` passed through `feynman --mode rpc`; rebuilt and extracted `.feynman/runtime-workspace.tgz` and verified packaged `web-results`, `FEYNMAN_WEB_SEARCH_CONFIG`, Gemini browser opt-in aliases, escaped Gemini messaging, `pi-tui` truncation, `pruneVersion: 6`, Pi `0.72.1`, and `@devkade/pi-opentelemetry`; ran full `npm test` (144 tests), `npm run typecheck`, root `npm run build`, and website `npm run build` with the bundled Node `24.14.0`.
- Failed / learned: OpenCode OAuth stores for Anthropic, Google, and OpenAI were expired, while usable API keys existed in project env files; the first OpenAI final sentinel used hyphens while also asking for no punctuation, so the model removed the hyphens and the smoke was rerun with `OAIFINALOK`; Perplexity remains blocked by no local key.
- Blockers: No Perplexity live API check until a real `PERPLEXITY_API_KEY` is provided; `/usr/local/bin/node` is still `20.17.0`, below Feynman's runtime floor.
- Next: Stage the intended repo changes, keep the Feynman theme/package stack, and avoid adding provider aliases or runtime patches unless they are backed by upstream gaps plus packaged-runtime tests.

### 2026-05-04 19:46 PDT — telemetry-noise-removal

- Objective: Remove the default OpenTelemetry package from Feynman so local and public TUI sessions do not show telemetry status noise or invite end-user telemetry setup by default.
- Changed: Removed `@devkade/pi-opentelemetry` from the bundled package stack and user-facing docs; removed default OTEL service env injection; kept a legacy settings prune path so existing default installs that only gained telemetry from the curated stack are normalized back to the current core package list; added startup pruning for stale bundled-package symlinks so upgrades remove the old `@opentelemetry` links from Feynman's managed npm prefix.
- Changed: Reviewed open GitHub issues and PRs, folded in the useful parts of PRs `#133`, `#144`, and `#149`, and left PR `#141` unmerged because the local `geminiBrowser` opt-in path is stricter and already patched into the vendored runtime.
- Verified: Ran `npm test` (150 tests), `npm run typecheck`, root `npm run build`, and website `npm run build`; repacked and globally installed `@companion-ai/feynman@0.2.40`; confirmed the packaged tarball and active settings contain no telemetry package; confirmed the installed startup path removes leftover `@opentelemetry` symlinks; ran a live one-shot through the installed CLI, RPC `get_state`/`get_available_models`, direct Gemini API web search, and an actual TUI launch with no `otel active` footer.
- Failed / learned: Historical changelog entries still mention earlier telemetry verification because those entries describe past runs; the first stale-link check ran before `feynman status` had finished, so it still saw old links until the newly installed startup pruning executed.
- Blockers: None for source removal.
- Next: Commit and push the validated cleanup.
