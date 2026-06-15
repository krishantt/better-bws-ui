# better-bws-ui

A web UI for managing [Bitwarden Secrets Manager](https://bitwarden.com/products/secrets-manager/) — browse projects, view and edit secrets with syntax highlighting for JSON, YAML, and dotenv formats.

## Usage

```bash
docker run -d -p 3000:3000 \
  -e BWS_ACCESS_TOKEN=$BWS_ACCESS_TOKEN \
  ghcr.io/krishantt/better-bws-ui:latest
```

Open [http://localhost:3000](http://localhost:3000).

`BWS_ACCESS_TOKEN` is your [Bitwarden Secrets Manager access token](https://bitwarden.com/help/access-tokens/). If set, the app connects automatically and the token cannot be overridden by the browser. You can also enter a token manually in the UI if no env token is configured.

## Docker Compose

```bash
BWS_ACCESS_TOKEN=<token> docker compose up -d
```

## Development

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

The `bws` binary is embedded in the production image at build time (copied from `ghcr.io/bitwarden/bws`) — no Docker socket or sidecar needed at runtime.
