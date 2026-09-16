# Contributing

Thanks for helping improve `@resolve-protocol/sdk`.

## Development

1. Use **Node.js 20+**.
2. Install dependencies: `npm ci`
3. Run tests: `npm test`
4. Typecheck: `npm run typecheck`
5. Build: `npm run build`

## Guidelines

- Keep the public API in `src/index.ts` intentional and documented.
- Match the on-chain Resolve contract exactly (method names, enums, error codes 1–18).
- Do **not** hardcode a production/testnet deployment `contractId`.
- Do **not** invent balances or market state — reads must use Soroban RPC.
- Prefer unit tests with pure mappers / parsers; mock RPC only when testing client wiring.
- Avoid `TODO` / `FIXME` for unfinished core features in PRs.

## Pull requests

- Keep PRs focused and include tests for behavior changes.
- Update `README.md` when the public API changes.
- Ensure CI is green (`test` + `build`).

## Release notes

Bump `package.json` version according to semver and summarize user-facing changes in the PR description.
