export const prerender = false
import { supabase } from "../../../lib/supabaseServer";

export async function GET({ params }: { params: { date: Date } }) {
  const { date } = params;

  const { data, error } = await supabase.rpc('get_available_slots', {
    p_date: date
  });

  if (error) return new Response(error.message, { status: 400 });
  return Response.json(data);
}