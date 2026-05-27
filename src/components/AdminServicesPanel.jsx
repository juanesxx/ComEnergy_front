import React, { useCallback, useEffect, useState } from "react";
import { apiRequest } from "../utils/api";
import { useAuth } from "../context/AuthContext";

const emptyForm = {
  title: "",
  summary: "",
  detail: "",
  imageUrl: "",
};

export default function AdminServicesPanel() {
  const { isAuthenticated } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [services, setServices] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  const loadServices = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoadingList(true);
      setError("");
      const response = await apiRequest("/services");
      setServices(response?.data || []);
    } catch (err) {
      setError(err.message || "No se pudo cargar el catálogo de servicios.");
    } finally {
      setLoadingList(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError("Sesión no válida.");
      return;
    }

    const title = form.title.trim();
    const summary = form.summary.trim();
    const detail = form.detail.trim();
    const imageUrl = form.imageUrl.trim();

    if (!title || !summary || !detail) {
      setError("Completa título, resumen y detalle.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setFeedback("");

      await apiRequest("/services", {
        method: "POST",
        body: JSON.stringify({
          title,
          summary,
          detail,
          ...(imageUrl ? { imageUrl } : {}),
        }),
      });

      setForm(emptyForm);
      setFeedback("Servicio global creado correctamente.");
      await loadServices();
    } catch (err) {
      setError(err.message || "No se pudo crear el servicio.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-white shadow rounded-xl border border-gray-100 p-6 mb-10">
      <h3 className="text-lg font-semibold text-[#07a68a] mb-1">Catálogo global (administrador)</h3>
      <p className="text-sm text-gray-600 mb-6">
        Crea servicios que las empresas podrán ofrecer en la plataforma.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 mb-10 max-w-2xl">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Título</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#07a68a]"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Resumen</label>
          <textarea
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#07a68a] min-h-20"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Detalle</label>
          <textarea
            value={form.detail}
            onChange={(e) => setForm({ ...form, detail: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#07a68a] min-h-28"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            URL de imagen (opcional)
          </label>
          <input
            type="url"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#07a68a]"
            placeholder="https://..."
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 rounded-lg bg-[#07a68a] text-white text-sm font-medium hover:brightness-110 disabled:opacity-60"
        >
          {submitting ? "Guardando..." : "Crear servicio global"}
        </button>
      </form>

      {feedback && <p className="text-sm text-emerald-700 mb-4">{feedback}</p>}
      {error && <p className="text-sm text-amber-700 mb-4">{error}</p>}

      <div>
        <h4 className="text-sm font-semibold text-gray-800 mb-3">Servicios en catálogo</h4>
        {loadingList && <p className="text-sm text-gray-500">Cargando...</p>}
        {!loadingList && services.length === 0 && (
          <p className="text-sm text-gray-500">Aún no hay servicios registrados.</p>
        )}
        {!loadingList && services.length > 0 && (
          <ul className="divide-y divide-gray-100 border border-gray-100 rounded-lg max-h-72 overflow-y-auto">
            {services.map((s) => (
              <li key={s.id} className="px-4 py-3 text-sm">
                <span className="font-medium text-[#07a68a]">{s.title}</span>
                {s.summary && (
                  <p className="text-gray-600 mt-1 line-clamp-2">{s.summary}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
