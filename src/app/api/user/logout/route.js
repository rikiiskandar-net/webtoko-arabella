import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { USER_COOKIE_NAME } from "@/lib/userAuth";

export async function POST() {
  const cookieStore = cookies();
  cookieStore.delete(USER_COOKIE_NAME);
  
  return NextResponse.json({ success: true, message: "Berhasil logout" });
}
