import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let supabase;

function getClient() {
  if (!supabase) {
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env");
    }
    supabase = createClient(supabaseUrl, supabaseKey);
  }
  return supabase;
}

export async function uploadProductImage(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  const safeName = file.name
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9._-]/g, '');
  const filename = `${Date.now()}-${safeName}`;

  const { data, error } = await getClient()
    .storage
    .from('product-images')
    .upload(filename, file, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw new Error(error.message);

  const { data: { publicUrl } } = getClient()
    .storage
    .from('product-images')
    .getPublicUrl(data.path);

  return publicUrl;
}

export async function uploadFromBuffer(buffer, filename, contentType) {
  const { data, error } = await getClient()
    .storage
    .from('product-images')
    .upload(filename, buffer, {
      contentType,
      cacheControl: '3600',
      upsert: true,
    });

  if (error) throw new Error(error.message);

  const { data: { publicUrl } } = getClient()
    .storage
    .from('product-images')
    .getPublicUrl(data.path);

  return publicUrl;
}

export function getPublicUrl(path) {
  const { data: { publicUrl } } = getClient()
    .storage
    .from('product-images')
    .getPublicUrl(path);
  return publicUrl;
}
