# Haris Ahmed Khan · Portfolio

Single-page portfolio built with Next.js (App Router), deployed on Vercel. Pushing to `master` deploys automatically.

## Editing content

- **Projects:** use the admin panel at `/admin` (see below), or edit `content/projects.json` and push.
- **Everything else** (headline, experience, skills, links, résumé URL): edit `content/profile.ts` and push.
- **Profile photo:** replace `public/profile.jpg`.

## Admin panel

Go to `/admin/login`. After logging in you can add, edit, reorder and delete projects and upload screenshots
(any PNG/JPEG/WebP; it's resized and converted to WebP in the browser).

Changes are a draft until you click **Publish changes**. Publishing makes one commit to this repo
(`content/projects.json` plus any images in `public/projects/`), and Vercel redeploys within about a minute.
There's no database: the repo is the source of truth.

### One-time setup (Vercel → Project → Settings → Environment Variables)

| Variable | Value |
|---|---|
| `ADMIN_USERNAME` | Your admin username |
| `ADMIN_PASSWORD` | A strong password |
| `ADMIN_SESSION_SECRET` | A random string of 32+ characters |
| `GITHUB_TOKEN` | Fine-grained GitHub token: **only this repository**, permission **Contents: Read and write** |
| `GITHUB_REPO` | `haklifesavr/haris-portfolio` (optional, this is the default) |
| `GITHUB_BRANCH` | `master` (optional, this is the default) |

Then redeploy once (Deployments → ⋯ → Redeploy) so the variables take effect.

Never commit these values: this repository is public. See `.env.example`.

The contact form keeps using the existing EmailJS variables (`NEXT_PUBLIC_EMAILJS_*`). Without them,
the form opens the visitor's email app instead.

## Local development

```bash
npm install
npm run dev
```

Locally, without a `GITHUB_TOKEN`, the admin panel saves straight to your files so you can try it out.
Put `ADMIN_USERNAME`, `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` in `.env.local` to log in.
