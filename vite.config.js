import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const ENV_PREFIXES = ["VITE_", "GEMINI_"];

function resolveGeminiKey(env) {
  return (
    env.GEMINI_API_KEY ||
    env.VITE_GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    ""
  ).trim();
}

function geminiProxyConfig(apiKey, { allowInsecureTls = false } = {}) {
  return {
    "/api/gemini": {
      target: "https://generativelanguage.googleapis.com",
      changeOrigin: true,
      // Set GEMINI_PROXY_TLS_INSECURE=true only if a corporate proxy breaks TLS verify (avoid if possible).
      secure: !allowInsecureTls,
      timeout: 120_000,
      proxyTimeout: 120_000,
      rewrite(path) {
        return path.replace(/^\/api\/gemini/, "");
      },
      configure(proxy) {
        proxy.on("proxyReq", (proxyReq) => {
          if (apiKey) {
            proxyReq.setHeader("x-goog-api-key", apiKey);
          }
        });
        proxy.on("error", (_err, _req, res) => {
          if (res && !res.headersSent) {
            res.writeHead(502, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                error: {
                  message:
                    "Gemini proxy connection failed (TLS/network). Try: disable VPN briefly, clear HTTP(S)_PROXY env vars for this terminal, or set NODE_OPTIONS=--dns-result-order=ipv4first. See README.",
                },
              }),
            );
          }
        });
      },
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ENV_PREFIXES);
  const geminiKey = resolveGeminiKey(env);
  const allowInsecureTls = process.env.GEMINI_PROXY_TLS_INSECURE === "true";
  const proxy = geminiProxyConfig(geminiKey, { allowInsecureTls });

  return {
    plugins: [react()],
    define: {
      "import.meta.env.VITE_PROXY_HAS_GEMINI_KEY": JSON.stringify(geminiKey.length > 0),
    },
    server: { proxy },
    preview: { proxy },
  };
});
