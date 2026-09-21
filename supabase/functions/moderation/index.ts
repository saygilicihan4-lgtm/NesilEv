import { withSupabase } from "npm:@supabase/server";
import { corsHeaders } from "jsr:@supabase/supabase-js@2/cors";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });

const handler = withSupabase({ auth: "user" }, async (req, ctx) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const userId = ctx.userClaims?.sub;
  if (!userId) return json({ error: "unauthorized" }, 401);

  const { data: admin, error: adminError } = await ctx.supabaseAdmin
    .from("moderation_admins")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (adminError) return json({ error: "admin_lookup_failed" }, 500);
  if (!admin) return json({ error: "forbidden" }, 403);

  let payload: {
    action?: string;
    targetId?: string;
    decision?: string;
    note?: string;
    path?: string;
  };

  try {
    payload = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const action = payload.action;

  if (action === "list_verifications") {
    const { data, error } = await ctx.supabaseAdmin
      .from("verification_cases")
      .select("id,user_id,status,provider_reference,created_at,updated_at")
      .order("created_at", { ascending: false })
      .limit(100);

    return error ? json({ error: error.message }, 500) : json({ data });
  }

  if (action === "list_reports") {
    const { data, error } = await ctx.supabaseAdmin
      .from("reports")
      .select("id,reporter_id,target_user_id,listing_id,application_id,reason,status,created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    return error ? json({ error: error.message }, 500) : json({ data });
  }

  if (action === "review_verification") {
    if (!payload.targetId || !["verified", "rejected"].includes(payload.decision ?? "")) {
      return json({ error: "invalid_verification_decision" }, 400);
    }

    const { error } = await ctx.supabaseAdmin.rpc(
      "moderation_review_verification_internal",
      {
        admin_user: userId,
        target_case: payload.targetId,
        decision: payload.decision,
        note: payload.note ?? null,
      },
    );

    return error ? json({ error: error.message }, 400) : json({ ok: true });
  }

  if (action === "review_report") {
    if (
      !payload.targetId ||
      !["reviewing", "resolved", "dismissed"].includes(payload.decision ?? "")
    ) {
      return json({ error: "invalid_report_decision" }, 400);
    }

    const { error } = await ctx.supabaseAdmin.rpc(
      "moderation_review_report_internal",
      {
        admin_user: userId,
        target_report: payload.targetId,
        decision: payload.decision,
        note: payload.note ?? null,
      },
    );

    return error ? json({ error: error.message }, 400) : json({ ok: true });
  }

  if (action === "create_document_url") {
    if (!payload.path) return json({ error: "missing_path" }, 400);

    const { data, error } = await ctx.supabaseAdmin.storage
      .from("verification-documents")
      .createSignedUrl(payload.path, 120);

    return error
      ? json({ error: error.message }, 400)
      : json({ signedUrl: data.signedUrl, expiresIn: 120 });
  }

  return json({ error: "unknown_action" }, 400);
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const res = await handler(req);
  const headers = new Headers(res.headers);
  Object.entries(corsHeaders).forEach(([key, value]) => headers.set(key, value));
  headers.set("Cache-Control", "no-store");

  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers,
  });
});
