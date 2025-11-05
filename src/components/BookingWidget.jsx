import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CalendarioEligeDia() {
  const [currentMonth, setCurrentMonth] = useState(11);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [daysData, setDaysData] = useState([]);
  const [slotsData, setSlotsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState(null);
  const [showTimeSelector, setShowTimeSelector] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [currentStep, setCurrentStep] = useState("calendar");
  const [reservationId, setReservationId] = useState(null); // calendar, time, personal, address, family, pets
  const [formData, setFormData] = useState({
    paquete: null,
    nombre: "",
    apellido: "",
    telefono: "",
    email: "",
    direccion: "",
    quiereFamiliares: null,
    cantidadFamiliares: 0,
    tieneMascotas: null,
    cantidadMascotas: 0,
  });

  const months = ["Noviembre", "Diciembre"];
  const monthIndex = currentMonth - 11;

  useEffect(() => {
    const fetchDaysData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/days/2025/${currentMonth}`);

        if (!response.ok) {
          throw new Error("Error al cargar los datos");
        }

        const data = await response.json();
        setDaysData(data);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching days:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDaysData();
  }, [currentMonth]);

  const fetchSlots = async (date) => {
    setLoadingSlots(true);
    try {
      const response = await fetch(`/api/slots/${date}`);

      if (!response.ok) {
        throw new Error("Error al cargar horarios");
      }

      const data = await response.json();
      setSlotsData(data);
    } catch (err) {
      console.error("Error fetching slots:", err);
      setSlotsData([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    const day = new Date(year, month - 1, 1).getDay();
    return (day + 6) % 7; // Ajusta para que Lunes sea 0
  };

  const generateCalendarDays = (year, month, availabilityData) => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDay = (new Date(year, month - 1, 1).getDay() + 6) % 7; // lunes = 0

    let calendar = [];
    let week = Array(firstDay).fill(null); // días vacíos antes del 1

    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${String(month).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;

      const availability = availabilityData.find((d) => d.day === dateString);

      week.push({
        day,
        color: availability?.color ?? null,
        freeSlots: availability?.free_slots ?? null,
      });

      if (week.length === 7) {
        calendar.push(week);
        week = [];
      }
    }

    if (week.length > 0) {
      calendar.push([...week, ...Array(7 - week.length).fill(null)]);
    }

    return calendar;
  };

  const calendarDays = generateCalendarDays(
    2025,
    currentMonth,
    daysData
  ).flat();

  const handlePrevMonth = () => {
    if (currentMonth > 11) {
      setCurrentMonth(11);
      setShowTimeSelector(false);
      setSelectedDate(null);
      setSelectedSlot(null);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth < 12) {
      setCurrentMonth(12);
      setShowTimeSelector(false);
      setSelectedDate(null);
      setSelectedSlot(null);
    }
  };

  const handleDayClick = (day, status, data) => {
    if (day && status !== "unavailable" && status !== "red") {
      const dateStr = data.day;
      setSelectedDate({ day, month: currentMonth, data, dateStr });
      setSelectedSlot(null);
      setShowTimeSelector(true);
      setCurrentStep("time");
      fetchSlots(dateStr);
    }
  };

  const handleSlotClick = (slot) => {
    setSelectedSlot(slot);
  };

  const handleContinue = () => {
    if (selectedSlot) {
      setCurrentStep("package");
    }
  };

  const handlePersonalContinue = () => {
    if (
      formData.nombre &&
      formData.apellido &&
      formData.telefono &&
      formData.email
    ) {
      setCurrentStep("address");
    }
  };

  const handleAddressContinue = () => {
    if (formData.direccion) {
      setCurrentStep("family");
    }
  };

  const handleFamilyContinue = () => {
    setCurrentStep("pets");
  };

  const handlePetsContinue = async () => {
    const mascotas = formData.tieneMascotas ? formData.cantidadMascotas : 0;
    const personas_extra = formData.quiereFamiliares
      ? formData.cantidadFamiliares
      : 0;

    const payload = {
      slot_id: selectedSlot.slot_id,
      paquete: formData.paquete,
      first_name: formData.nombre,
      last_name: formData.apellido,
      phone: formData.telefono,
      email: formData.email,
      direccion: formData.direccion,
      mascotas,
      personas_extra,
    };

    const response = await fetch("/api/reservations/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (data.success) {
      setReservationId(data.reservation_id); // lo guardamos
      setCurrentStep("payment"); // pasamos a la pantalla de pago
    } else {
      alert("Error creando la reserva");
    }
  };

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getDayClasses = (status, day) => {
    const base =
      "aspect-square rounded-full flex items-center justify-center text-base font-semibold transition-all";

    if (!day) return `${base} text-transparent`;

    const isSelected =
      selectedDate?.day === day && selectedDate?.month === currentMonth;

    if (status === "green") {
      return `${base} text-white bg-verde-apagado border-3 ${
        isSelected
          ? "ring-4 ring-verde-oscuro ring-offset-2"
          : "border-verde-apagado"
      } hover:bg-verde-oscuro cursor-pointer`;
    }
    if (status === "yellow") {
      return `${base} text-white bg-[#d4a574] border-3 ${
        isSelected ? "ring-4 ring-[#d4a574] ring-offset-2" : "border-[#d4a574]"
      } hover:bg-[#c49464] cursor-pointer`;
    }
    if (status === "red") {
      return `${base} text-white bg-rojo border-3 border-rojo cursor-not-allowed opacity-70`;
    }
    return `${base} text-stone-400`;
  };

  const isClickable = (status) => {
    return status === "green" || status === "yellow";
  };

  const getDayName = (dateStr) => {
    const days = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];
    const date = new Date(dateStr + "T00:00:00");
    return days[date.getDay()];
  };

  return (
    <div className="min-h-screen bg-naranja-claro flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-2xl">
        {currentStep === "calendar" && (
          <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={handlePrevMonth}
                disabled={currentMonth === 11 || loading}
                className="p-2 disabled:opacity-20 disabled:cursor-not-allowed text-verde-oscuro hover:text-verde-apagado transition-colors"
                aria-label="Mes anterior"
              >
                <ChevronLeft size={24} strokeWidth={2} />
              </button>

              <h2 className="text-2xl md:text-3xl text-verde-oscuro font-font-vintage">
                {months[monthIndex]} 2025
              </h2>

              <button
                onClick={handleNextMonth}
                disabled={currentMonth === 12 || loading}
                className="p-2 disabled:opacity-20 disabled:cursor-not-allowed text-verde-oscuro hover:text-verde-apagado transition-colors"
                aria-label="Mes siguiente"
              >
                <ChevronRight size={24} strokeWidth={2} />
              </button>
            </div>

            {loading && (
              <div className="text-center py-16 text-verde-oscuro">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-naranja-claro border-t-verde-oscuro mx-auto"></div>
              </div>
            )}

            {error && (
              <div className="text-center py-16 text-rojo">
                <p className="text-lg mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 border-2 border-rojo text-rojo rounded-full hover:bg-rojo hover:text-white transition-all"
                >
                  Reintentar
                </button>
              </div>
            )}

            {!loading && !error && (
              <>
                <div className="grid grid-cols-7 gap-3 md:gap-4 mb-6">
                  {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(
                    (day) => (
                      <div
                        key={day}
                        className="text-center text-verde-apagado text-xs md:text-sm font-medium"
                      >
                        {day}
                      </div>
                    )
                  )}
                </div>

                <div className="grid grid-cols-7 gap-3 md:gap-4 mb-8">
                  {calendarDays.map((item, index) => {
                    if (!item) {
                      return (
                        <div key={index} className="text-transparent">
                          .
                        </div>
                      );
                    }

                    const status =
                      item.color === "green"
                        ? "green"
                        : item.color === "yellow"
                        ? "yellow"
                        : item.color === "red"
                        ? "red"
                        : null;

                    return (
                      <button
                        key={index}
                        onClick={() =>
                          handleDayClick(item.day, status, {
                            day: `${2025}-${String(currentMonth).padStart(
                              2,
                              "0"
                            )}-${String(item.day).padStart(2, "0")}`,
                          })
                        }
                        disabled={!isClickable(status)}
                        className={getDayClasses(status, item.day)}
                      >
                        {item.day}
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap justify-center gap-4 md:gap-6 pt-6 border-t border-stone-200">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-verde-apagado border-3 border-verde-apagado"></div>
                    <span className="text-sm text-verde-oscuro font-medium">
                      Disponibles
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#d4a574] border-3 border-[#d4a574]"></div>
                    <span className="text-sm text-verde-oscuro font-medium">
                      Pocos espacios
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-rojo border-3 border-rojo opacity-70"></div>
                    <span className="text-sm text-verde-oscuro font-medium">
                      Sin espacios
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full text-stone-400 flex items-center justify-center text-lg font-bold">
                      —
                    </div>
                    <span className="text-sm text-verde-oscuro font-medium">
                      No disponible
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {currentStep === "time" && (
          <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm">
            <h1 className="text-3xl md:text-4xl text-center mb-2 text-verde-oscuro font-vintage">
              Elige tu hora para:
            </h1>
            <p className="text-xl md:text-2xl text-center mb-8 text-verde-apagado font-youngest">
              {getDayName(selectedDate.dateStr)} {selectedDate.day} de{" "}
              {months[selectedDate.month - 11]}
            </p>

            {loadingSlots ? (
              <div className="text-center py-16 text-verde-oscuro">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-naranja-claro border-t-verde-oscuro mx-auto"></div>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-8 max-h-96 overflow-y-auto">
                  {slotsData.map((slot) => (
                    <button
                      key={slot.slot_id}
                      onClick={() => handleSlotClick(slot)}
                      className={`w-full p-6 rounded-2xl text-2xl md:text-3xl font-vintage transition-all ${
                        selectedSlot?.slot_id === slot.slot_id
                          ? "bg-verde-apagado text-white ring-4 ring-verde-oscuro ring-offset-2"
                          : "bg-stone-100 text-verde-oscuro hover:bg-stone-200"
                      }`}
                    >
                      {slot.formatted_time.toLowerCase()}
                    </button>
                  ))}
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setCurrentStep("calendar");
                      setSelectedSlot(null);
                    }}
                    className="flex-1 py-4 rounded-2xl text-lg font-semibold text-verde-oscuro border-3 border-verde-oscuro hover:bg-verde-oscuro hover:text-white transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleContinue}
                    disabled={!selectedSlot}
                    className="flex-1 py-4 rounded-2xl text-lg font-semibold bg-verde-oscuro text-white hover:bg-verde-apagado transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Continuar
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {currentStep === "package" && (
          <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm">
            <h1 className="text-3xl md:text-4xl text-center mb-6 text-verde-oscuro font-youngest">
              Elige tu paquete
            </h1>

            <div className="space-y-4 mb-8">
              {/* PAQUETE 1 */}
              <button
                onClick={() => {
                  setSelectedPackage(1);
                  updateFormData("paquete", 1);
                }}
                className={`w-full p-6 rounded-2xl border-3 transition-all text-left ${
                  selectedPackage === 1
                    ? "bg-verde-apagado text-white border-verde-apagado"
                    : "bg-stone-100 text-verde-oscuro border-stone-200 hover:bg-stone-200"
                }`}
              >
                <h2 className="text-2xl font-vintage mb-1">Paquete 1</h2>
                <p className="text-lg mb-2">
                  1 a 3 personas — 20 min
                </p>
                <p className="font-youngest text-xl">
                  Q1,600 (15 fotos digitales)
                </p>
              </button>

              {/* PAQUETE 2 */}
              <button
                onClick={() => {
                  setSelectedPackage(2);
                  updateFormData("paquete", 2);
                }}
                className={`w-full p-6 rounded-2xl border-3 transition-all text-left ${
                  selectedPackage === 2
                    ? "bg-verde-apagado text-white border-verde-apagado"
                    : "bg-stone-100 text-verde-apagado border-stone-200 hover:bg-stone-200"
                }`}
              >
                <h2 className="text-2xl font-vintage mb-1">
                  Paquete 2 (Más Popular)
                </h2>
                <p className="text-lg mb-2">
                  4 a 6 personas — 40 min
                </p>
                <p className="font-youngest text-xl">
                  Q2,000 (25 fotos digitales)
                </p>
              </button>
            </div>

            <button
              onClick={() => selectedPackage && setCurrentStep("personal")}
              disabled={!selectedPackage}
              className="w-full py-4 rounded-2xl text-lg font-semibold bg-verde-oscuro text-white hover:bg-verde-apagado transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continuar
            </button>
          </div>
        )}

        {currentStep === "personal" && (
          <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm">
            <h1 className="text-3xl md:text-4xl text-center mb-8 text-verde-oscuro font-youngest">
              ¿Cuántos saber más de ti?
            </h1>

            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-verde-oscuro text-sm font-medium mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => updateFormData("nombre", e.target.value)}
                  className="w-full p-4 rounded-xl border-2 border-stone-200 focus:border-verde-apagado focus:outline-none text-verde-oscuro"
                  placeholder="Tu nombre"
                />
              </div>

              <div>
                <label className="block text-verde-oscuro text-sm font-medium mb-2">
                  Apellido
                </label>
                <input
                  type="text"
                  value={formData.apellido}
                  onChange={(e) => updateFormData("apellido", e.target.value)}
                  className="w-full p-4 rounded-xl border-2 border-stone-200 focus:border-verde-apagado focus:outline-none text-verde-oscuro"
                  placeholder="Tu apellido"
                />
              </div>

              <div>
                <label className="block text-verde-oscuro text-sm font-medium mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => updateFormData("telefono", e.target.value)}
                  className="w-full p-4 rounded-xl border-2 border-stone-200 focus:border-verde-apagado focus:outline-none text-verde-oscuro"
                  placeholder="1234-5678"
                />
              </div>

              <div>
                <label className="block text-verde-oscuro text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                  className="w-full p-4 rounded-xl border-2 border-stone-200 focus:border-verde-apagado focus:outline-none text-verde-oscuro"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <button
              onClick={handlePersonalContinue}
              disabled={
                !formData.nombre ||
                !formData.apellido ||
                !formData.telefono ||
                !formData.email
              }
              className="w-full py-4 rounded-2xl text-lg font-semibold bg-verde-oscuro text-white hover:bg-verde-apagado transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continuar
            </button>
          </div>
        )}

        {currentStep === "address" && (
          <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm">
            <h1 className="text-3xl md:text-4xl text-center mb-8 text-verde-oscuro font-youngest">
              Confirmanos tu dirección
            </h1>

            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-verde-oscuro text-sm font-medium mb-2">
                  Dirección completa
                </label>
                <textarea
                  value={formData.direccion}
                  onChange={(e) => updateFormData("direccion", e.target.value)}
                  className="w-full p-4 rounded-xl border-2 border-stone-200 focus:border-verde-apagado focus:outline-none text-verde-oscuro resize-none"
                  placeholder="Calle, número, colonia, referencias..."
                  rows={4}
                />
              </div>
            </div>

            <button
              onClick={handleAddressContinue}
              disabled={!formData.direccion}
              className="w-full py-4 rounded-2xl text-lg font-semibold bg-verde-oscuro text-white hover:bg-verde-apagado transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continuar
            </button>
          </div>
        )}

        {currentStep === "family" && (
          <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm">
            <h1 className="text-3xl md:text-4xl text-center mb-4 text-verde-oscuro font-youngest">
              ¿Quieres agregar más familiares?
            </h1>
            <p className="text-center text-verde-apagado mb-8">
              Para coordinar mejor la visita
            </p>

            {formData.quiereFamiliares === null ? (
              <div className="space-y-4">
                <button
                  onClick={() => updateFormData("quiereFamiliares", true)}
                  className="w-full py-6 rounded-2xl text-xl font-semibold bg-verde-oscuro text-white hover:bg-verde-apagado transition-all"
                >
                  Sí, agregar familiares
                </button>
                <button
                  onClick={() => {
                    updateFormData("quiereFamiliares", false);
                    handleFamilyContinue();
                  }}
                  className="w-full py-6 rounded-2xl text-xl font-semibold border-3 border-verde-oscuro text-verde-oscuro hover:bg-verde-oscuro hover:text-white transition-all"
                >
                  No, continuar con mi paquete
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-verde-oscuro text-lg font-medium mb-4 text-center">
                    ¿Cuántos familiares más?
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.cantidadFamiliares}
                    onChange={(e) =>
                      updateFormData(
                        "cantidadFamiliares",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="w-full p-6 rounded-xl border-2 border-stone-200 focus:border-verde-apagado focus:outline-none text-verde-oscuro text-center text-3xl font-bold"
                  />
                </div>
                <button
                  onClick={handleFamilyContinue}
                  disabled={formData.cantidadFamiliares < 1}
                  className="w-full py-4 rounded-2xl text-lg font-semibold bg-verde-oscuro text-white hover:bg-verde-apagado transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continuar
                </button>
              </div>
            )}
          </div>
        )}

        {currentStep === "pets" && (
          <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm">
            <h1 className="text-3xl md:text-4xl text-center mb-4 text-verde-oscuro font-youngest">
              ¿Tienes mascotas?
            </h1>
            <p className="text-center text-verde-apagado mb-8">
              Queremos conocer a todos en casa
            </p>

            {formData.tieneMascotas === null ? (
              <div className="space-y-4">
                <button
                  onClick={() => updateFormData("tieneMascotas", true)}
                  className="w-full py-6 rounded-2xl text-xl font-semibold bg-verde-oscuro text-white hover:bg-verde-apagado transition-all"
                >
                  Sí, tengo mascotas
                </button>
                <button
                  onClick={() => {
                    updateFormData("tieneMascotas", false);
                    handlePetsContinue();
                  }}
                  className="w-full py-6 rounded-2xl text-xl font-semibold border-3 border-verde-oscuro text-verde-oscuro hover:bg-verde-oscuro hover:text-white transition-all"
                >
                  No tengo mascotas
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-verde-oscuro text-lg font-medium mb-4 text-center">
                    ¿Cuántas mascotas tienes?
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.cantidadMascotas}
                    onChange={(e) =>
                      updateFormData(
                        "cantidadMascotas",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="w-full p-6 rounded-xl border-2 border-stone-200 focus:border-verde-apagado focus:outline-none text-verde-oscuro text-center text-3xl font-bold"
                  />
                </div>
                <button
                  onClick={handlePetsContinue}
                  disabled={formData.cantidadMascotas < 1}
                  className="w-full py-4 rounded-2xl text-lg font-semibold bg-verde-oscuro text-white hover:bg-verde-apagado transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Finalizar
                </button>
              </div>
            )}
          </div>
        )}

        {currentStep === "payment" && (
          <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm">
            <h1 className="text-3xl md:text-4xl text-center mb-4 text-verde-oscuro font-youngest">
              Estás a nada de terminar…
            </h1>

            <p className="text-center text-verde-apagado mb-8">
              Para finalizar tu reserva transfíere a esta cuenta:
              <br />
              <strong className="text-verde-oscuro">xxx-xxx-xxx</strong>
              <br />
              y sube tu comprobante.
              <br />
              <span className="text-rojo font-semibold">
                Tienes 10 minutos.
              </span>
            </p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const fileInput = e.target.comprobante.files[0];
                const form = new FormData();
                form.append("reservation_id", reservationId);
                form.append("file", fileInput);

                const res = await fetch("/api/reservations/confirm", {
                  method: "POST",
                  body: form,
                });

                const data = await res.json();
                if (data.success) {
                  setCurrentStep("done");
                }
              }}
              className="space-y-6"
            >
              <div
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) {
                    const input = e.target.querySelector('input[type="file"]');
                    const dt = new DataTransfer();
                    dt.items.add(file);
                    input.files = dt.files;
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
                className="relative border-3 border-dashed border-stone-300 rounded-2xl p-12 text-center hover:border-verde-apagado transition-all cursor-pointer bg-stone-50"
                onClick={() => document.getElementById("file-upload").click()}
              >
                <input
                  type="file"
                  id="file-upload"
                  name="comprobante"
                  accept="image/*"
                  required
                  className="hidden"
                  onChange={(e) => {
                    const fileName = e.target.files[0]?.name;
                    if (fileName) {
                      document.getElementById("file-name").textContent =
                        fileName;
                    }
                  }}
                />

                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-verde-apagado rounded-full flex items-center justify-center text-white text-3xl">
                    📷
                  </div>
                  <div>
                    <p className="text-verde-oscuro font-semibold text-lg mb-2">
                      Arrastra tu comprobante aquí
                    </p>
                    <p className="text-verde-apagado text-sm">
                      o haz clic para seleccionar
                    </p>
                    <p
                      id="file-name"
                      className="text-verde-oscuro text-sm mt-2 font-medium"
                    ></p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-2xl text-lg font-semibold bg-verde-oscuro text-white hover:bg-verde-apagado transition-all"
              >
                Confirmar
              </button>
            </form>
          </div>
        )}

        {currentStep === "done" && (
          <div className="bg-white rounded-3xl p-6 md:p-10 text-center">
            <h1 className="text-3xl md:text-4xl text-verde-oscuro font-youngest mb-6">
              ¡Gracias por tu reserva {formData.nombre}!
            </h1>

            <div className="w-40 h-40 rounded-full bg-green-300 mx-auto flex items-center justify-center text-6xl">
              ✓
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
