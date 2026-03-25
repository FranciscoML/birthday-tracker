import { NextResponse } from "next/server";
import webpush from "web-push";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isToday } from "@/lib/helpers";

export const dynamic = "force-dynamic";

export async function GET() {
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );

  const { data: birthdays } = await getSupabaseAdmin()
    .from("birthdays")
    .select("name, day, month");

  const todaysBirthdays = (birthdays ?? []).filter((b) =>
    isToday(b.day, b.month)
  );

  if (todaysBirthdays.length === 0) return NextResponse.json({ sent: 0 });

  const names   = todaysBirthdays.map((b) => b.name).join(", ");
  const payload = JSON.stringify({ title: "🎂 ¡Cumpleaños hoy!", body: names });

  const { data: subs } = await getSupabaseAdmin()
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth");

  let sent = 0;
  for (const sub of subs ?? []) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload
      );
      sent++;
    } catch {
      await getSupabaseAdmin()
        .from("push_subscriptions")
        .delete()
        .eq("endpoint", sub.endpoint);
    }
  }

  return NextResponse.json({ sent });
}