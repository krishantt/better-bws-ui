# better-bws-ui

A web UI for managing [Bitwarden Secrets Manager](https://bitwarden.com/products/secrets-manager/) — browse projects, view and edit secrets, powered by the `bws` CLI running in Docker.

## Usage

```bash
docker run -d -p 3000:3000 \
  -e BWS_ACCESS_TOKEN=$BWS_ACCESS_TOKEN \
  -v /var/run/docker.sock:/var/run/docker.sock \
  ghcr.io/krishantt/better-bws-ui:latest
```

Open [http://localhost:3000](http://localhost:3000).

`BWS_ACCESS_TOKEN` is your [Bitwarden Secrets Manager access token](https://bitwarden.com/help/access-tokens/). If set, the app uses it automatically. You can also enter a token manually in the UI.

The Docker socket mount is required — the app invokes `docker run ghcr.io/bitwarden/bws` internally to talk to the BWS API.

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
