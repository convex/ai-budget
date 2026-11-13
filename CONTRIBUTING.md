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
version PR updates the package version and changelog. After it merges, push
`v<version>` at the commit to release. For stable releases, that commit must be
on `main`; it can be older than the current tip. The tag starts a workflow that
builds and tests the commit, then stages the tested package on npm. A maintainer
reviews the staged package and approves with 2FA.

Configure npm trusted publishing for `release.yml` before the first CI release.

To prepare a version PR without the bot, run `npx changeset version`, review
the version, changelog and consumed Changesets, then commit and open a PR.
If staging fails, check npm's staged packages and rerun the workflow. To retry
with a corrected commit for the same unstaged version, move the tag and push it
again. An already staged version cannot be staged again.
