# Creator Outreach MVP

Minimal working outbound system for importing a list of creators/bloggers and sending a templated email campaign.

## What works

- CSV import with `email`, `name`, `channelName`, `channelUrl`, `company`
- Encrypted SMTP/app-password storage (AES-256-GCM)
- Sender selection per campaign
- Subject/body templates with `[Name]`, `[Email]`, `[ChannelName]`, `[ChannelUrl]`
- Preview before sending
- BullMQ + Redis queue
- Retry on transient failures
- Delivery statuses: queued/sending/sent/failed/skipped
- Daily sender limit field for the next rate-limiter iteration
- Suppression table in the data model
- PostgreSQL persistence

## Start locally

1. Install Node.js 22+.
2. Copy `.env.example` to `.env` and set a 64-character hex `APP_ENCRYPTION_KEY`.
3. Start infrastructure:

```bash
docker compose up -d
```

4. Install dependencies and initialize Prisma:

```bash
npm install
npm run db:generate
npm run db:push
```

5. In terminal 1:

```bash
npm run dev
```

6. In terminal 2:

```bash
npm run worker
```

Open `http://localhost:3000`.

## Gmail SMTP example

Use an application password, not your normal Google account password. Host: `smtp.gmail.com`, port `587`, TLS checkbox off (STARTTLS), username = Gmail address.

## CSV example

```csv
email,name,channelName,channelUrl,company
creator@example.com,Alex,Alex Animation,https://youtube.com/@alexanimation,Alex Studio
```

## Production note

Before sending real campaigns, add authentication/multi-user access, domain/email verification, provider OAuth (Gmail/Microsoft), hard daily/second rate limits, unsubscribe handling, bounce processing, audit logs, and explicit campaign approval. The queue architecture is already separated from the UI so these can be added without redesigning campaign storage.
