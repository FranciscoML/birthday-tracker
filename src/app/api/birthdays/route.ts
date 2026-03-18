import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import type { BirthdayFormData } from "@/types";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("birthdays")
    .select("*")
    .order("month", { ascending: true })
    .order("day", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body: BirthdayFormData = await req.json();

  const { data, error } = await supabaseAdmin
    .from("birthdays")
    .insert({
      name: body.name.trim(),
      note: body.note?.trim() || null,
      day: body.day,
      month: body.month,
      year: body.year || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
