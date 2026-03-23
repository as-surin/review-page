import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("MY_SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const _WH_PARTS = ["aHR0cHM6Ly9ob29rcy5zbGFjay5jb20vc2VydmljZXMv","VDA1UEcyUkJXMUcv","QjBBOUhCWjAyR1Av","N1E2cEJaRUtWYU41QmN3UGdNTjEwQnh6"];
const SLACK_WEBHOOK = Deno.env.get("SLACK_WEBHOOK_URL") || atob(_WH_PARTS.join(""));

function buildSlackBlocks(body: Record<string, unknown>, gameTitle: string, sentTime: string) {
  const role = body.Role || "";
  const number = body.Number || "";
  const team = body.Team || "";
  const zone = body.Zone || "";
  const nickname = body.Nickname || "";
  const sex = body.Sex || "";
  const age = body.Age || "";
  const name = body.Name || "";
  const phone = body.PhoneNumber || "";
  const email = body.Email || "";

  const kst = new Date(sentTime).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
  const contextParts = [kst, role && number ? `${role} (Player ${number})` : "", team].filter(Boolean);
  const personName = name || nickname || "익명";
  const personParts = [`👤 ${personName}`, sex, age ? `${age}세` : "", phone, email].filter(Boolean);

  const blocks: unknown[] = [
    { type: "header", text: { type: "plain_text", text: `🧩 ${gameTitle || "알 수 없는 게임"}`, emoji: true } },
    { type: "context", elements: [
      { type: "mrkdwn", text: contextParts.join("  ·  ") + "\n" + personParts.join(" · ") },
    ] },
    { type: "divider" },
  ];

  const feedbackFields = [
    ["만족도", body["만족도"]],
    ["엔딩", body["Ending Data"]],
    ["유입 경로", body["유입 경로"]],
    ["추천 대상", body["추천 대상"]],
    ["후속작 관심도", body["후속작 관심도"]],
    ["추가 의견", body["추가 의견"]],
  ];

  const filledFields = feedbackFields.filter(([, v]) => v);

  if (filledFields.length > 0) {
    const lines = filledFields.map(([label, value]) => `*${label}*  ${value}`).join("\n");
    blocks.push({ type: "section", text: { type: "mrkdwn", text: lines } });
  } else {
    blocks.push({ type: "section", text: { type: "mrkdwn", text: `_${zone || "데이터 수집"} 단계 — 리뷰 미작성_` } });
  }

  blocks.push({ type: "divider" });

  return blocks;
}

async function sendSlack(body: Record<string, unknown>, gameTitle: string, sentTime: string) {
  try {
    const blocks = buildSlackBlocks(body, gameTitle, sentTime);
    await fetch(SLACK_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocks }),
    });
  } catch (e) {
    console.error("Slack send error:", e);
  }
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST" && req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    let body: Record<string, unknown>;
    if (req.method === "POST") {
      const text = await req.text();
      try {
        body = JSON.parse(text);
      } catch {
        body = Object.fromEntries(new URLSearchParams(text).entries());
      }
    } else {
      const url = new URL(req.url);
      body = Object.fromEntries(url.searchParams.entries());
    }

    // 쏘빅툴은 { "data": "{...JSON...}" } 형태로 감싸서 보냄 — 1회만 unwrap
    if (body.data && typeof body.data === "string") {
      try {
        body = JSON.parse(body.data as string);
      } catch { /* 파싱 실패 시 원본 유지 */ }
    }

    const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const gameTitle = String(body.GameTitle || "").replace(/\s+\d+$/, "").trim();
    const sentTime = new Date().toISOString();
    const autoUuid = `AUTO-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

    const review = {
      uuid: body.uuid || body.UUID || autoUuid,
      game_id: body.GameId || body.gameId || `unknown-${Date.now()}`,
      template_id: body.TemplateId || body.templateId || null,
      sent_time: sentTime,
      game_title: gameTitle || "Unknown",
      original_game_title: body.GameTitle || null,
      number: body.Number ? parseInt(String(body.Number)) : null,
      team: body.Team || null,
      zone: body.Zone || null,
      role: body.Role || null,
      nickname: body.Nickname || null,
      satisfaction: body["만족도"] || null,
      play_experience: body["플레이 경험"] || null,
      inflow_source: body["유입 경로"] || null,
      recommendation_target: body["추천 대상"] || null,
      sequel_interest: body["후속작 관심도"] || null,
      additional_comment: body["추가 의견"] || null,
      ending_data: body["Ending Data"] || null,
      raw_data: JSON.stringify(body),
      sex: body.Sex || null,
      name: body.Name || null,
      phone_number: body.PhoneNumber || null,
      email: body.Email || null,
      age: body.Age || null,
    };

    const { error } = await sb.rpc("upsert_review", { r: review });

    if (error) {
      console.error("upsert_review error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Slack 알림 (DB 저장 성공 후)
    await sendSlack(body, gameTitle, sentTime);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Unexpected error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
