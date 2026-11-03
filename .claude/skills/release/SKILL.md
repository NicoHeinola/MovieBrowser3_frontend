---
name: release
description: Release a new frontend version — date the changelog entry, tag `vX.Y.Z`, push, create the GitHub release, then start the next version's entry. Use when the user asks to release, cut a release, or publish a version.
---

# Release

Production installs build the newest `v*` tag, so a release is what users get. Run this only when the user asks for a release: that request is the go-ahead to commit, tag and push the two release commits below. Nothing else gets committed along the way.

## Check

1. On `main`, `git status --porcelain` is empty, and `git fetch origin` shows `main` equal to `origin/main`. Otherwise stop and say what's in the way.
2. The top entry in `src/data/changelog/changelogEntries.ts` is the version to release (call it `X.Y.Z`): `date: null` with at least one change, its version equal to `package.json`, and no `vX.Y.Z` tag yet (`git tag --list vX.Y.Z`). An already-dated top entry with no tag (the first release, `1.0.0`) is released as is.
3. Re-read its lines: the version step must fit them (see AGENTS.md, Changelog and Releases). A wrong step is fixed in step 1 of Release, not in a later version.
4. Installs build the newest tag of each repo, so the newest backend release must already serve every API this release calls. If backend `main` has endpoints the release needs that aren't tagged yet (`git -C <backend> log <newest v* tag>..origin/main`), stop: the backend is released first.

## Release

1. Set the entry's `date` to today. Run `npm run check`, `npm test` and `npm run build`; all must pass.
2. Commit `chore(release): vX.Y.Z` and tag it: `git tag -a vX.Y.Z -m "vX.Y.Z"`.
3. Start the next version right away, so later changes land there: set `package.json` to the next patch (`X.Y.(Z+1)`) and add `{ version: 'X.Y.(Z+1)', date: null, changes: [] }` at the top of the entries. Run `npm test`, then commit `chore(release): start X.Y.(Z+1)`.
4. Push both commits and the tag together: `git push --atomic origin main vX.Y.Z`.
5. Write the release notes to a scratch file from the released entry: one `### Added` / `### Changed` / `### Fixed` / `### Removed` heading per type that has lines, each line as a bullet. Then `gh release create vX.Y.Z --verify-tag --title "vX.Y.Z" --notes-file <file>`.

## Done when

`gh release view vX.Y.Z` shows the release, `origin/main` has both release commits, and the top entry is the open `X.Y.(Z+1)` with `date: null`.

## Report

The release URL, the version, and that the next entry is open. Installs pick it up on their next `moviebrowser3 update`. This skill releases the frontend only.
