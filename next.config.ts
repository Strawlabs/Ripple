import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Next.js 15+ dev server blocks cross-origin requests by default.
  // Needed so the app works when accessed through the ngrok tunnel
  // (required for testing WhatsApp webhooks and LinkedIn/Facebook OAuth
  // callbacks locally, since those need a public HTTPS URL).
  // NOTE: ngrok's free plan gives a new random subdomain every restart —
  // update this value (and FACEBOOK_REDIRECT_URI / LINKEDIN_REDIRECT_URI
  // in .env.local, and the callback URLs in the Meta/LinkedIn dashboards)
  // whenever ngrok is restarted.
  allowedDevOrigins: ["*.ngrok-free.dev", "*.ngrok-free.app", "*.ngrok.io"],
};

export default nextConfig;
