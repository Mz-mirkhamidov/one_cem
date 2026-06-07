// Supabase Edge Function: telegram-daily
// Deploy: supabase functions deploy telegram-daily
// Cron: 0 4 * * *  (04:00 UTC = 09:00 Toshkent UTC+5)
//
// Set these secrets:
//   supabase secrets set TELEGRAM_BOT_TOKEN=your_token
//   supabase secrets set TELEGRAM_CHAT_ID=your_chat_id
//   supabase secrets set SUPABASE_URL=https://xxx.supabase.co
//   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
const CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID")!;

async function sendMessage(text: string) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text,
      parse_mode: "HTML",
    }),
  });
}

Deno.serve(async () => {
  const now = new Date();
  // Toshkent UTC+5
  const tashkentOffset = 5 * 60 * 60 * 1000;
  const tashkentNow = new Date(now.getTime() + tashkentOffset);

  const todayStart = new Date(tashkentNow);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(tashkentNow);
  todayEnd.setHours(23, 59, 59, 999);

  // Adjust back to UTC for Supabase queries
  const startUTC = new Date(todayStart.getTime() - tashkentOffset).toISOString();
  const endUTC = new Date(todayEnd.getTime() - tashkentOffset).toISOString();

  const dateStr = `${todayStart.getDate().toString().padStart(2, "0")}.${(todayStart.getMonth() + 1).toString().padStart(2, "0")}.${todayStart.getFullYear()}`;

  // Today's pending follow-ups
  const { data: followUps } = await supabase
    .from("follow_ups")
    .select("*")
    .eq("status", "Kutilmoqda")
    .gte("scheduled_at", startUTC)
    .lte("scheduled_at", endUTC)
    .order("scheduled_at");

  // Today's deadline orders
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("order_type", "Keyinroqi")
    .gte("scheduled_at", startUTC)
    .lte("scheduled_at", endUTC)
    .order("scheduled_at");

  const hasData = (followUps?.length || 0) + (orders?.length || 0) > 0;

  if (!hasData) {
    await sendMessage(
      `<b>☀️ Sellora Plus CRM — ${dateStr}</b>\n\n✅ Bugun uchun rejalashtirilgan ish yo'q. Yaxshi kun!`
    );
    return new Response("OK");
  }

  let message = `<b>☀️ Sellora Plus CRM — ${dateStr}</b>\n`;

  if (followUps && followUps.length > 0) {
    message += `\n📞 <b>Bugungi qo'ng'iroqlar (${followUps.length} ta):</b>\n`;
    for (const fu of followUps) {
      const time = new Date(fu.scheduled_at);
      const localTime = new Date(time.getTime() + tashkentOffset);
      const timeStr = `${localTime.getHours().toString().padStart(2, "0")}:${localTime.getMinutes().toString().padStart(2, "0")}`;
      message += `• <b>${fu.source_name}</b> — ${fu.source_phone}`;
      if (fu.note) message += ` (${fu.note})`;
      message += ` — <code>${timeStr}</code>\n`;
    }
  }

  if (orders && orders.length > 0) {
    message += `\n📦 <b>Bugungi topshirishlar (${orders.length} ta):</b>\n`;
    for (const order of orders) {
      const time = new Date(order.scheduled_at);
      const localTime = new Date(time.getTime() + tashkentOffset);
      const timeStr = `${localTime.getHours().toString().padStart(2, "0")}:${localTime.getMinutes().toString().padStart(2, "0")}`;
      message += `• <b>${order.source_name}</b> — ${order.product} — <code>${timeStr}</code>\n`;
    }
  }

  message += `\n🔗 <a href="https://crm.selloraplus.uz">CRM ochish</a>`;

  await sendMessage(message);

  return new Response("OK", { status: 200 });
});
