import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";
import { getAuth, hasHostedAuthConfig } from "@/lib/auth";
import { isHostedAuthMode } from "@/lib/auth-mode";

function handleAuthRequest(request: Request) {
  if (!isHostedAuthMode(env.AUTH_MODE)) {
    return new Response("Not found", {
      status: 404,
    });
  }

  if (!hasHostedAuthConfig()) {
    const debug = {
      AUTH_MODE: env.AUTH_MODE,
      HAS_BETTER_AUTH_URL: !!env.BETTER_AUTH_URL,
      HAS_BETTER_AUTH_SECRET: !!env.BETTER_AUTH_SECRET,
      BETTER_AUTH_SECRET_LENGTH: env.BETTER_AUTH_SECRET?.length ?? 0,
      BYPASS_EMAIL_VERIFICATION: Reflect.get(env, "BYPASS_EMAIL_VERIFICATION"),
    };
    return new Response(JSON.stringify(debug), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const auth = getAuth();
  return auth.handler(request);
}

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        return handleAuthRequest(request);
      },
      POST: async ({ request }: { request: Request }) => {
        return handleAuthRequest(request);
      },
    },
  },
});
