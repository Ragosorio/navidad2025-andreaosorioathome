export const prerender = false
import { supabase } from "../../../lib/supabaseServer";

export async function POST({ request }: { request: Request }) {
  const { reservation_id } = await request.json();

  const { error } = await supabase.rpc('cancel_reservation', {
    p_reservation_id: reservation_id
  });

  if (error) return new Response(error.message, { status: 400 });
  return Response.json({ success: true });
}
