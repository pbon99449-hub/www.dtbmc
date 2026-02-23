This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Contact Form Notifications (SMS + Email)

This project includes a contact form at `/contact` and a Node.js backend endpoint at `/api/contact`.

### 1) Configure environment variables

Copy `.env.example` to `.env.local` and set:

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_NUMBER`
- `TWILIO_TO_NUMBER`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `RESEND_TO_EMAIL` (or `CONTACT_NOTIFY_EMAIL`)

### 2) Node.js backend (default)

No extra setup is required beyond `.env.local`.
The form posts to `/api/contact`.

### 3) PHP backend (optional alternative)

A PHP endpoint is included at `php-backend/contact.php`.

If you want to use PHP instead of Next.js API route:

1. Host `php-backend/contact.php` on a PHP server.
2. Set the same Twilio env vars on that server.
3. Set `CONTACT_NOTIFY_EMAIL` on that server.
4. In Next.js `.env.local`, set:

```bash
NEXT_PUBLIC_CONTACT_API=https://your-domain.com/contact.php
```

### 4) Python + SQL backend (FastAPI + SQLite)

This repo now includes `python-backend/main.py`.

1. Install dependencies:

```bash
pip install -r python-backend/requirements.txt
```

2. Ensure `.env.local` includes:

- `NEXT_PUBLIC_CONTACT_API=http://127.0.0.1:8000/contact`
- `CONTACT_TARGET_PHONE=+8801679796976`
- `CONTACT_TARGET_EMAIL=pbon99449@gmail.com`
- Twilio and Resend credentials

3. Run backend:

```bash
uvicorn python-backend.main:app --reload --port 8000
```

4. Keep Next.js running on port `3000`.

When the contact form is submitted, data is saved in:
`python-backend/contact_messages.db`
