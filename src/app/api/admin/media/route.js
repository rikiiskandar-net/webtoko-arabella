import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyToken } from "@/lib/auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

function getClient() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env");
  }
  return createClient(supabaseUrl, supabaseKey);
}

async function await getSession(request) {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export async function GET(request) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getClient();
    
    // Fetch all files from product-images bucket
    const { data, error } = await supabase.storage.from('product-images').list('', {
      limit: 100,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' }
    });

    if (error) {
      throw error;
    }

    // Map to include public URL
    const files = data
      .filter(file => file.name !== '.emptyFolderPlaceholder') // Ignore empty folder placeholders
      .map(file => {
        const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(file.name);
        return {
          id: file.id,
          name: file.name,
          created_at: file.created_at,
          size: file.metadata?.size || 0,
          mimetype: file.metadata?.mimetype || 'image/webp',
          url: publicUrl
        };
      });

    return NextResponse.json(files);
  } catch (error) {
    console.error("Media GET Error:", error);
    return NextResponse.json({ error: "Gagal mengambil daftar media" }, { status: 500 });
  }
}

export async function DELETE(request) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('file');

    if (!fileName) {
      return NextResponse.json({ error: "Nama file tidak diberikan" }, { status: 400 });
    }

    const supabase = getClient();
    const { data, error } = await supabase.storage.from('product-images').remove([fileName]);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, message: "File berhasil dihapus" });
  } catch (error) {
    console.error("Media DELETE Error:", error);
    return NextResponse.json({ error: "Gagal menghapus file" }, { status: 500 });
  }
}
