export const prerender = false;
import { supabase } from "../../../lib/supabaseServer";
import { resend } from "../../../lib/resend";
import { clientEmailTemplate } from "../../../utils/templates/clientEmail";
import { adminEmailTemplate } from "../../../utils/templates/adminEmail";

export async function POST({ request }: { request: Request }) {
  try {
    const form = await request.formData();
    const reservation_id = Number(form.get("reservation_id"));
    const file = form.get("file") as File;

    const filename = `transfers/${reservation_id}-${Date.now()}.jpg`;

    // 1) SUBIR IMAGEN
    await supabase.storage
      .from("transfers")
      .upload(filename, file, { upsert: true });

    const url = supabase.storage.from("transfers").getPublicUrl(filename)
      .data.publicUrl;

    // 2) CONFIRMAR LA RESERVA
    const { error: confirmError } = await supabase.rpc("confirm_reservation", {
      p_reservation_id: reservation_id,
      p_image_url: url,
    });

    if (confirmError) {
      return new Response(confirmError.message, { status: 400 });
    }

    // 3) OBTENER DETALLES COMPLETOS (JOIN CON SLOTS)
    const { data: reservation, error: fetchError } = await supabase
      .from("reservations")
      .select(
        `
        *,
        slot:slots(
          slot_date,
          slot_time
        )
      `
      )
      .eq("id", reservation_id)
      .single();

    if (fetchError) {
      return new Response(fetchError.message, { status: 400 });
    }

    const {
      first_name,
      last_name,
      email,
      direccion,
      mascotas,
      personas_extra,
      paquete,
      phone,
      slot,
    } = reservation;

    // FORMATO FECHA
    const formattedDate = new Date(slot.slot_date).toLocaleDateString("es-GT", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // FORMATO HORA 24h → 12h AM/PM
    function formatTimeToAmPm(time24: string) {
      const [hour, minute] = time24.split(":").map(Number);
      const suffix = hour >= 12 ? "PM" : "AM";
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minute.toString().padStart(2, "0")} ${suffix}`;
    }

    const formattedTime = formatTimeToAmPm(slot.slot_time.slice(0, 5));

    const precio = paquete === 1 ? "Q1600" : "Q2000";

    // 4) CORREO CLIENTE
    await resend.emails.send({
      from: "Christmas at home <noreply@andreaosoriophotography.com>",
      to: email,
      subject: "Tu sesión navideña ha sido confirmada 🎄",
      html: clientEmailTemplate({
        first_name,
        last_name,
        formattedDate,
        formattedTime,
      }),
    });

    // 5) CORREO ADMIN
    await resend.emails.send({
      from: "Christmas at home <noreply@andreaosoriophotography.com>",
      to: "Andreaosoriophotography@gmail.com",
      subject: `📌 Nueva cita confirmada - ${first_name} ${last_name}`,
      html: adminEmailTemplate({
        first_name,
        last_name,
        email,
        phone,
        direccion,
        mascotas,
        personas_extra,
        paquete,
        precio,
        formattedDate,
        formattedTime,
        imageUrl: url,
      }),
    });

    return Response.json({ success: true });
  } catch {
    return new Response("Server error", { status: 500 });
  }
}
