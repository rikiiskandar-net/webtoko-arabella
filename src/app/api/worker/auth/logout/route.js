import { NextResponse } from "next/server";
import { clearWorkerAuthCookie } from "@/lib/workerAuth";

export async function POST() {
  await clearWorkerAuthCookie();
  return NextResponse.json({ success: true });
}
