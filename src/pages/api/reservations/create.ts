export const prerender = false
import { supabase } from "../../../lib/supabaseServer";

export async function POST({ request }: { request: Request }) {
  const body = await request.json();

  const { data, error } = await supabase.rpc('create_reservation', {
    p_slot_id: body.slot_id,
    p_first_name: body.first_name,
    p_last_name: body.last_name,
    p_phone: body.phone,
    p_email: body.email,
    p_direccion: body.direccion,
    p_mascotas: body.mascotas,
    p_personas_extra: body.personas_extra,
  });

  if (error) return new Response(error.message, { status: 400 });
  return Response.json({ success: true, reservation_id: data.id });
}

