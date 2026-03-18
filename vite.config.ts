import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiBaseUrl = env["VITE_SOME_KEY_API_BASE_URL"];

  let proxyTarget: string | undefined;
  let proxyRewrite: ((path: string) => string) | undefined;

  if (apiBaseUrl) {
    const parsedApiBaseUrl = new URL(apiBaseUrl);
    const basePath = parsedApiBaseUrl.pathname.replace(/\/$/, "");

    proxyTarget = parsedApiBaseUrl.origin;
    proxyRewrite = basePath
      ? (path: string) => `${basePath}${path}`
      : undefined;
  }

  return {
    plugins: [
      react({
        babel: {
          plugins: [["babel-plugin-react-compiler"]],
        },
      }),
      tailwindcss(),
    ],
    server: proxyTarget
      ? {
          proxy: {
            "/api": {
              target: proxyTarget,
              changeOrigin: true,
              secure: false,
              ...(proxyRewrite ? { rewrite: proxyRewrite } : {}),
            },
          },
        }
      : undefined,
  };
});
