import { NextResponse } from "next/server";
import { withClient } from "@/lib/db";

export async function GET() {
  try {
    await withClient(async (c) => {
      await c.query("SELECT 1");
    });
    return NextResponse.json({ ok: true, time: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
