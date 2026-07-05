import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// ----------------------------------------------------------------------
// 1. IN-MEMORY RATE LIMITER (ANTI-DDOS & SPAM)
// ----------------------------------------------------------------------
// Variabel ini hidup di memori server dan bertahan antar-request
const rateLimitMap = new Map();
const MAX_REQUESTS = 10;      // Maksimal 10 request
const WINDOW_MS = 60 * 1000;  // Dalam kurun waktu 1 menit (60 detik)

// ----------------------------------------------------------------------
// 2. PARSER BROWSER & OS
// ----------------------------------------------------------------------
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
    // ----------------------------------------------------------------------
    // 3. CEK RATE LIMIT (TEMBOK PELINDUNG)
    // ----------------------------------------------------------------------
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const now = Date.now();

    // Lazy sweep: Jika map terlalu besar (serangan masif), reset paksa untuk hindari server crash
    if (rateLimitMap.size > 10000) {
      rateLimitMap.clear();
    }

    const requestData = rateLimitMap.get(ip);
    if (requestData) {
      // Jika sudah lewat 1 menit, reset hitungan kembali ke 1
      if (now - requestData.startTime > WINDOW_MS) {
        rateLimitMap.set(ip, { count: 1, startTime: now });
      } else {
        // Jika masih dalam 1 menit, tambah hitungan
        requestData.count += 1;
        if (requestData.count > MAX_REQUESTS) {
          // BINTANG KEMBALI SEBELUM MENYENTUH DATABASE! (Tembok Aktif)
          return NextResponse.json(
            { success: false, error: 'Too Many Requests (Anti-DDoS Active)' },
            { status: 429 } 
          );
        }
      }
    } else {
      // Kunjungan IP pertama kali
      rateLimitMap.set(ip, { count: 1, startTime: now });
    }

    // ----------------------------------------------------------------------
    // 4. EKSEKUSI DATA (HANYA JIKA LOLOS TEMBOK)
    // ----------------------------------------------------------------------
    const { path } = await request.json();
    
    // Vercel menyematkan negara di header ini
    const country = request.headers.get('x-vercel-ip-country') || 'Unknown';
    const userAgent = request.headers.get('user-agent') || '';
    
    const { browser, os } = parseUserAgent(userAgent);

    // 4.1. Catat kunjungan ke database
    await prisma.pageView.create({
      data: {
        path: path || '/',
        country,
        browser,
        os
      }
    });

    // 4.2. Sapu Otomatis (Self-Cleaning)
    // Hapus log yang usianya lebih dari 30 hari untuk menghemat database
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
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
