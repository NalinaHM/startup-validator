# Startup Idea Validator

AI analyzes a startup idea (market, competitors, moat, GTM, risks) using Google Gemini.

## Run locally

1. Copy `.env.example` → `.env` and set your Gemini key from [Google AI Studio](https://aistudio.google.com/apikey).
2. `npm install` (once)
3. `npm run dev` → open the URL shown (usually http://localhost:5173)

Use **npm run dev** (not static `index.html`) so the `/api/gemini` proxy avoids CORS.

## Scripts

- `npm run dev` — dev server + proxy
- `npm run build` — production bundle
- `npm run preview` — serve `dist/` (proxy still works if `.env` is present when you start preview)
- `npm run lint` — ESLint

## “socket disconnected before secure TLS” (Vite proxy)

Node cannot finish HTTPS to Google. Usually **VPN, corporate firewall/antivirus, or a bad `HTTP(S)_PROXY`** on your machine.

Try, in order:

1. Turn **VPN off** briefly or switch networks.
2. In the **same terminal** you use for `npm run dev`, clear proxy vars (PowerShell):  
   `Remove-Item Env:HTTP_PROXY, Env:HTTPS_PROXY, Env:ALL_PROXY -ErrorAction SilentlyContinue`
3. Prefer **IPv4** for DNS:  
   `$env:NODE_OPTIONS="--dns-result-order=ipv4first"; npm run dev`
4. Last resort (less secure): in `.env` add `GEMINI_PROXY_TLS_INSECURE=true` and restart dev — only if a corporate SSL inspector breaks verification.

The dev proxy sends your key in the **`x-goog-api-key`** header (not in the URL) so it does not show up in paths. **Rotate your API key** if it ever appeared in logs or screenshots.

