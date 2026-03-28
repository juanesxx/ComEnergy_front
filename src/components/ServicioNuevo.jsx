import React, { useState, useEffect } from "react";

export default function ServicioNuevo() {
  const [form, setForm] = useState({ titulo: "", resumen: "", empresa: "", imagen: "" });
  const [servicios, setServicios] = useState([]);

  useEffect(() => {
    const guardados = JSON.parse(localStorage.getItem("serviciosExtras")) || [];
    setServicios(guardados);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const nuevos = [...servicios, form];
    localStorage.setItem("serviciosExtras", JSON.stringify(nuevos));
    setServicios(nuevos);
    setForm({ titulo: "", resumen: "", empresa: "", imagen: "" });
    alert(" Servicio agregado correctamente (mock)");
  };

  return (
    <section className="py-20 bg-[#f7faf9]">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Publicar nuevo servicio</h2>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-4">
          <input
            type="text"
            placeholder="Título del servicio"
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            className="w-full border rounded px-3 py-2"
            required
          />
          <textarea
            placeholder="Descripción o resumen del servicio"
            value={form.resumen}
            onChange={(e) => setForm({ ...form, resumen: e.target.value })}
            className="w-full border rounded px-3 py-2"
            required
          />
          <input
            type="text"
            placeholder="Empresa o comunidad"
            value={form.empresa}
            onChange={(e) => setForm({ ...form, empresa: e.target.value })}
            className="w-full border rounded px-3 py-2"
            required
          />
          <input
            type="text"
            placeholder="URL de imagen (opcional)"
            value={form.imagen}
            onChange={(e) => setForm({ ...form, imagen: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
          <button className="w-full py-2 bg-[#07a68a] text-white rounded hover:brightness-110">
            Publicar servicio
          </button>
        </form>

        {/* Mostrar servicios agregados */}
        {servicios.length > 0 && (
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {servicios.map((s, i) => (
              <div key={i} className="bg-white rounded-xl shadow p-4">
                {s.imagen && (
                  <img src={s.imagen} alt={s.titulo} className="h-40 w-full object-cover rounded mb-3" />
                )}
                <h3 className="font-bold text-[#07a68a]">{s.titulo}</h3>
                <p className="text-sm text-gray-600">{s.resumen}</p>
                <p className="mt-2 text-xs text-gray-500">Por: {s.empresa}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
