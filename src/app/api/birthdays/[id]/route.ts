import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import type { BirthdayFormData } from "@/types";

export const dynamic = "force-dynamic";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body: BirthdayFormData = await req.json();

  const { data, error } = await supabaseAdmin
    .from("birthdays")
    .update({
      name: body.name.trim(),
      note: body.note?.trim() || null,
      day: body.day,
      month: body.month,
      year: body.year || null,
    })
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const { error } = await supabaseAdmin
    .from("birthdays")
    .delete()
    .eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}