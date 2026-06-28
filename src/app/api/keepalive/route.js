import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // Jalankan query ringan ke Supabase untuk mencegah Auto-Pause
    await prisma.$queryRawUnsafe('SELECT 1');
    return NextResponse.json({ 
      status: 'ok', 
      message: 'Ping ke Supabase sukses! Database tetap aktif.' 
    }, { status: 200 });
  } catch (error) {
    console.error('Ping gagal:', error);
    return NextResponse.json({ 
      error: 'Gagal melakukan ping ke database.' 
    }, { status: 500 });
  }
}
