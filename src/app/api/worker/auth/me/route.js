import { NextResponse } from "next/server";
import { getWorkerAuthSession } from "@/lib/workerAuth";

export async function GET() {
  const session = await getWorkerAuthSession();
  
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: session
  });
}
