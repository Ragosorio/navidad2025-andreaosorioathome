export const prerender = false
import { supabase } from "../../../lib/supabaseServer";

export async function POST({ request }: { request: Request }) {
  const form = await request.formData();
  const reservation_id = Number(form.get('reservation_id'));
  const file = form.get('file') as File;

  const filename = `transfers/${reservation_id}-${Date.now()}.jpg`;

  // 1) subir imagen
  const { data: uploadError } = await supabase
    .storage
    .from('transfers')
    .upload(filename, file, { upsert: true });

  const url = supabase.storage.from('transfers').getPublicUrl(filename).data.publicUrl;

  // 2) confirmar
  const { error } = await supabase.rpc('confirm_reservation', {
    p_reservation_id: reservation_id,
    p_image_url: url
  });

  if (error) return new Response(error.message, { status: 400 });
  return Response.json({ success: true });
}
