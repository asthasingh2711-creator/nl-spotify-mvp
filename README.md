# NL Spotify MVP

Spotify-style music player with live search (Spotify Web API) and AI-powered **Explain & Refine** discovery.

## Deployed URLs (Vercel)

| Field | Value |
|-------|-------|
| **Website** | `https://nl-spotify-mvp.vercel.app` |
| **Redirect URI (production)** | `https://nl-spotify-mvp.vercel.app/api/auth/callback/spotify` |
| **Redirect URI (local)** | `http://localhost:3000/api/auth/callback/spotify` |

Open `/setup` on any deployment for copy-paste values.

## Spotify Developer Dashboard

1. Go to [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. Create an app
3. **Settings → Website:** paste your Vercel URL (table above)
4. **Settings → Redirect URIs:** add both redirect URIs from the table
5. Save, then copy **Client ID** and **Client Secret**
6. In Vercel → Project → Settings → Environment Variables, add:
   - `SPOTIFY_CLIENT_ID`
   - `SPOTIFY_CLIENT_SECRET`
   - `NEXT_PUBLIC_APP_URL` = `https://nl-spotify-mvp.vercel.app`
7. Redeploy

## Local development

```bash
npm install
npm run dev:clean
```

Create `.env.local`:

```
SPOTIFY_CLIENT_ID=your_id
SPOTIFY_CLIENT_SECRET=your_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Routes

- `/` — Spotify clone (home, search, library, player)
- `/discover` — Explain & Refine AI discovery
- `/setup` — Spotify Dashboard URI helper
