# Developing guide

## Running locally

```sh
npm ci
npm run dev
```

## Testing

```sh
npm run build
npm run check
npm run test:e2e
```

CI runs the local Convex codegen and deployment smoke test after the fast checks. When component APIs change,
regenerate and commit the generated files with `npm run build:codegen`.

## Releases

Include a Changeset for user-visible package changes:

```sh
npx changeset
```

Review the generated version PR before merging it. Approve its GitHub Actions
runs if GitHub requests approval, and wait for `Test and lint` to pass. The
version PR updates the package version and changelog. To prepare one without
the bot, run `npx changeset version`, review the version, changelog and consumed
Changesets, then commit and open a PR.

To release, tag the merged version PR's commit with `v<version>`:

```sh
gh api repos/convex/ai-budget/git/refs -f ref=refs/tags/v1.2.3 -f sha=<commit>
```

Or, from a local clone: `git tag v1.2.3 <commit> && git push origin v1.2.3`.

The tag must match `package.json`'s version. Stable releases must be on `main`;
the commit may be older than the current tip. GitHub runs the release workflow
from the tagged commit, so the commit must include it. The workflow builds and
tests that commit, then stages the tested package on npm. Review it on npm's
**Staged Packages** page and approve with 2FA, or run
`npm stage approve <stage-id>` with the stage ID from the workflow log.

If the workflow fails, check npm's staged packages first:

- Not staged: rerun the failed jobs
  (`gh run rerun <run-id> -R convex/ai-budget --failed`), for example after
  pushing `main` if the tag went first. A rerun uses the run's original commit
  and works for 30 days. To release a different commit, fix the source and move
  the tag:

  ```sh
  gh api -X PATCH repos/convex/ai-budget/git/refs/tags/v1.2.3 -f sha=<commit> -F force=true
  ```

- Staged, but rejected in review: `npm stage reject <stage-id>` frees the
  version, so you can move the tag to a corrected commit. A published version
  cannot be reused; prepare a new version instead.
