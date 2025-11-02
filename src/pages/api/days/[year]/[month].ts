export const prerender = false
import { supabase } from "../../../../lib/supabaseServer";

export async function GET({ params }: { params: { year: string; month: string } }) {
  const { year, month } = params;

  const { data, error } = await supabase.rpc('get_calendar_month', {
    p_year: Number(year),
    p_month: Number(month)
  });

  if (error) return new Response(error.message, { status: 400 });
  return Response.json(data);
}