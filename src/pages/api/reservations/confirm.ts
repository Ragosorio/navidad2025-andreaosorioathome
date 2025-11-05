export const prerender = false;
import { supabase } from "../../../lib/supabaseServer";
import { resend } from "../../../lib/resend";

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

    const url = supabase.storage.from("transfers").getPublicUrl(filename).data.publicUrl;

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
      .select(`
        *,
        slot:slots(
          slot_date,
          slot_time
        )
      `)
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
      slot
    } = reservation;

    // FORMATO FECHA Y HORA DESDE slot
    const formattedDate = new Date(slot.slot_date).toLocaleDateString("es-GT", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const formattedTime = slot.slot_time.slice(0, 5); // "14:30:00" → "14:30"

    const precio = paquete === 1 ? "Q1600" : "Q2000";

    // 4) CORREO CLIENTE
    await resend.emails.send({
      from: "Navidad <noreply@andreaosoriophotography.com>",
      to: email,
      subject: "🎄 Tu sesión navideña ha sido confirmada",
      html: `
        <p>Hola ${first_name} ${last_name},</p>
        <p>Tu cita ha sido <strong>confirmada</strong>.</p>
        <p><strong>Fecha:</strong> ${formattedDate}<br>
        <strong>Hora:</strong> ${formattedTime}</p>
        <p>Gracias por confiar en nosotros 💜</p>
      `,
    });

    // 5) CORREO ADMIN
    await resend.emails.send({
      from: "Navidad <noreply@andreaosoriophotography.com>",
      to: "Andreaosoriophotography@gmail.com",
      subject: `📌 Nueva cita confirmada - ${first_name} ${last_name}`,
      html: `
        <h2>Nueva reserva confirmada</h2>
        <p><strong>Nombre:</strong> ${first_name} ${last_name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Tel:</strong> ${phone}</p>
        <p><strong>Dirección:</strong> ${direccion}</p>
        <p><strong>Mascotas:</strong> ${mascotas}</p>
        <p><strong>Personas extra:</strong> ${personas_extra}</p>
        <p><strong>Paquete:</strong> ${paquete} (${precio})</p>
        <p><strong>Fecha:</strong> ${formattedDate}</p>
        <p><strong>Hora:</strong> ${formattedTime}</p>
        <p><strong>Imagen de comprobante:</strong></p>
        <img src="${url}" style="max-width:350px;border-radius:8px;" />
      `,
    });

    return Response.json({ success: true });

  } catch {
    return new Response("Server error", { status: 500 });
  }
}
