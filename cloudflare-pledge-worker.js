/* ============================================================
   TheCatProblem.com — pledge counter (Cloudflare Worker)

   Deploy this as a Worker with a KV namespace bound as "PLEDGES".
   - GET  -> { "count": N }              (read the current total)
   - POST -> increments, returns { "count": N }  (one per IP per day)

   Setup steps are in the chat. Once deployed, send the Worker URL
   (e.g. https://catproblem-pledge.<you>.workers.dev) and it gets
   wired into the site's pledge button.
   ============================================================ */

export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

    const KEY = "pledges";
    let count = parseInt((await env.PLEDGES.get(KEY)) || "0", 10);

    if (request.method === "POST") {
      // light anti-abuse: at most one increment per IP per day
      const ip = request.headers.get("CF-Connecting-IP") || "unknown";
      const ipKey = "ip:" + ip;
      const alreadyPledged = await env.PLEDGES.get(ipKey);
      if (!alreadyPledged) {
        count += 1;
        await env.PLEDGES.put(KEY, String(count));
        await env.PLEDGES.put(ipKey, "1", { expirationTtl: 86400 });
      }
    }

    return new Response(JSON.stringify({ count }), { headers: cors });
  },
};
