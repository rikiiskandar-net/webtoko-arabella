import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Fungsi parsing sederhana untuk Browser & OS
function parseUserAgent(uaString) {
  let browser = "Unknown";
  let os = "Unknown";

  if (!uaString) return { browser, os };

  if (uaString.includes("Edg")) browser = "Edge";
  else if (uaString.includes("Chrome")) browser = "Chrome";
  else if (uaString.includes("Safari") && !uaString.includes("Chrome")) browser = "Safari";
  else if (uaString.includes("Firefox")) browser = "Firefox";
  else if (uaString.includes("MSIE") || uaString.includes("Trident/")) browser = "IE";

  if (uaString.includes("Win")) os = "Windows";
  else if (uaString.includes("Mac")) os = "MacOS";
  else if (uaString.includes("X11")) os = "UNIX";
  else if (uaString.includes("Linux")) os = "Linux";
  if (uaString.includes("Android")) os = "Android";
  if (uaString.includes("iPhone") || uaString.includes("iPad")) os = "iOS";

  return { browser, os };
}

export async function POST(request) {
  try {
    const { path } = await request.json();
    
    // Vercel menyematkan negara di header ini
    const country = request.headers.get('x-vercel-ip-country') || 'Unknown';
    const userAgent = request.headers.get('user-agent') || '';
    
    const { browser, os } = parseUserAgent(userAgent);

    // 1. Catat kunjungan ke database
    await prisma.pageView.create({
      data: {
        path: path || '/',
        country,
        browser,
        os
      }
    });

    // 2. Sapu Otomatis (Self-Cleaning)
    // Hapus log yang usianya lebih dari 30 hari untuk menghemat database
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Gunakan query asinkron tanpa ditunggu (fire and forget)
    // atau ditunggu agar rapi (lebih aman di serverless)
    await prisma.pageView.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Tracking Error:', error);
    // Selalu kembalikan 200 agar frontend tidak panik jika gagal (karena ini hanya analytics)
    return NextResponse.json({ success: false, error: 'Tracking failed but ignored' });
  }
}
