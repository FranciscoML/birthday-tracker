import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  const { endpoint, keys } = await req.json();

  const { error } = await supabaseAdmin
    .from("push_subscriptions")
    .upsert(
      { endpoint, p256dh: keys.p256dh, auth: keys.auth },
      { onConflict: "endpoint" }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
