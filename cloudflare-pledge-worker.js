/* ============================================================
   TheCatProblem.com — pledge counter (Cloudflare Worker)

   Deploy this as a Worker with a KV namespace bound as "PLEDGES".
   - GET  -> { "count": N }                    (read the current total)
   - POST -> increments, returns { "count": N } (guarded by a short per-IP cooldown)

   The site already stops a normal visitor pledging twice (localStorage), so
   COOLDOWN just limits deliberate rapid-fire from one IP. Raise it for stronger
   anti-spam (e.g. 3600 = one per hour per IP); set 0 to count literally every click.
   ============================================================ */

export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: cors });

    const KEY = "pledges";
    let count = parseInt((await env.PLEDGES.get(KEY)) || "0", 10);

    if (request.method === "POST") {
      const COOLDOWN = 15; // seconds one IP must wait between pledges
      const ip = request.headers.get("CF-Connecting-IP") || "unknown";
      const recent = COOLDOWN > 0 ? await env.PLEDGES.get("ip:" + ip) : null;
      if (!recent) {
        count += 1;
        await env.PLEDGES.put(KEY, String(count));
        if (COOLDOWN > 0) await env.PLEDGES.put("ip:" + ip, "1", { expirationTtl: COOLDOWN });
      }
    }

    return new Response(JSON.stringify({ count }), { headers: cors });
  },
};
