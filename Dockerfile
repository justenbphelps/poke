FROM oven/bun:latest

WORKDIR /app

COPY package.json .
# Only copy lockfile if it exists
COPY bun.lockb* ./

RUN bun install

COPY . .

# Make sure environment variables are available before deploying commands
CMD ["sh", "-c", "bun run deploy && bun run start"]
