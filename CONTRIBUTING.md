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
runs if GitHub requests approval, and wait for `Test and lint` to pass. Require
that check on `main` before merging this CI publishing setup.
The version PR updates the package version and changelog; merging it stages the
package from that exact commit on `main`. A maintainer then reviews the staged
package on npm and approves with 2FA. The source tag is created only after
staging succeeds.

Configure npm trusted publishing for this package's `release.yml` workflow
before the first CI release. Use the npm package's Settings → Trusted Publisher
page, or run:

```sh
npm trust github @convex-dev/ai-budget --repo convex/ai-budget --file release.yml --allow-stage-publish
```

To prepare a version PR without the bot, run `npx changeset version`, review
the version, changelog and consumed Changesets, then commit and open a PR.
If staging failed, dispatch **Release** with the version-bump commit SHA after
checking that the version is not staged on npm. If staging succeeded but tagging
failed, verify the staged package and rerun the failed `tag` job in the original
workflow run. A second staging attempt cannot reuse the reserved version.
