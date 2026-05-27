import React, { useCallback, useEffect, useState } from "react";
import { apiRequest } from "../utils/api";
import { useCompany } from "../context/CompanyContext";

export default function SellerOfferServicePanel() {
  const { activeCompany, activeCompanyId } = useCompany();
  const [catalog, setCatalog] = useState([]);
  const [serviceId, setServiceId] = useState("");
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  const loadCatalog = useCallback(async () => {
    try {
      setLoadingCatalog(true);
      setError("");
      const response = await apiRequest("/services");
      setCatalog(response?.data || []);
    } catch (err) {
      setError(err.message || "No se pudo cargar el catálogo de servicios.");
    } finally {
      setLoadingCatalog(false);
    }
  }, []);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  const handleOffer = async (e) => {
    e.preventDefault();

    const id = Number(serviceId);
    const cid = activeCompanyId;

    if (!cid) {
      setError("Selecciona una empresa activa en el encabezado.");
      return;
    }

    if (!id) {
      setError("Selecciona un servicio del catálogo.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setFeedback("");

      await apiRequest("/company-services", {
        method: "POST",
        body: JSON.stringify({ serviceId: id, companyId: cid }),
      });

      setFeedback("Tu empresa ahora ofrece este servicio. Aparecerá en el listado público.");
      setServiceId("");
    } catch (err) {
      setError(err.message || "No se pudo registrar la oferta. ¿Ya la ofreces?");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-white shadow rounded-xl border border-gray-100 p-6 mb-10">
      <h3 className="text-lg font-semibold text-[#07a68a] mb-1">Ofrecer un servicio (empresa)</h3>
      <p className="text-sm text-gray-600 mb-6">
        Asocia un servicio del catálogo global a{" "}
        <span className="font-medium">{activeCompany?.name || "tu empresa activa"}</span>.
      </p>

      <form onSubmit={handleOffer} className="max-w-xl space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Servicio del catálogo</label>
          <select
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#07a68a]"
            disabled={loadingCatalog}
          >
            <option value="">
              {loadingCatalog ? "Cargando catálogo..." : "Selecciona un servicio"}
            </option>
            {catalog.map((s) => (
              <option key={s.id} value={String(s.id)}>
                {s.title}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={submitting || loadingCatalog || !catalog.length || !activeCompanyId}
          className="px-4 py-2 rounded-lg bg-[#07a68a] text-white text-sm font-medium hover:brightness-110 disabled:opacity-60"
        >
          {submitting ? "Registrando..." : "Ofrecer este servicio"}
        </button>
      </form>

      {feedback && <p className="text-sm text-emerald-700 mt-4">{feedback}</p>}
      {error && <p className="text-sm text-amber-700 mt-4">{error}</p>}

      {!loadingCatalog && catalog.length === 0 && (
        <p className="text-sm text-gray-500 mt-4">
          No hay servicios globales aún. Un administrador debe crearlos primero.
        </p>
      )}
    </section>
  );
}
