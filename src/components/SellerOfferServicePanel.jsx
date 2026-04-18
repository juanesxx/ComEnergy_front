import React, { useCallback, useEffect, useState } from "react";
import { apiRequest } from "../utils/api";
import { getAccessToken } from "../utils/auth";

export default function SellerOfferServicePanel() {
  const token = getAccessToken();
  const [catalog, setCatalog] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [serviceId, setServiceId] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
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

  const loadCompanies = useCallback(async () => {
    if (!token) {
      setLoadingCompanies(false);
      return;
    }
    try {
      setLoadingCompanies(true);
      const response = await apiRequest("/accounts/users/companies", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const list = response?.data || [];
      setCompanies(list);
      if (list.length === 1) {
        setCompanyId(String(list[0].id));
      }
    } catch {
      setCompanies([]);
    } finally {
      setLoadingCompanies(false);
    }
  }, [token]);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  const handleOffer = async (e) => {
    e.preventDefault();
    if (!token) {
      setError("Debes iniciar sesión como usuario de empresa.");
      return;
    }

    const id = Number(serviceId);
    if (!id) {
      setError("Selecciona un servicio del catálogo.");
      return;
    }

    const cid = Number(companyId);
    if (!cid) {
      setError("Selecciona la empresa a la que asociar el servicio.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setFeedback("");

      await apiRequest("/company-services", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
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
        Elige un servicio creado por un administrador para asociarlo a tu empresa en el marketplace.
      </p>

      <form onSubmit={handleOffer} className="max-w-xl space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Empresa</label>
          <select
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#07a68a]"
            disabled={loadingCompanies || companies.length === 0}
          >
            <option value="">
              {loadingCompanies
                ? "Cargando empresas..."
                : companies.length === 0
                  ? "No hay empresas disponibles"
                  : "Selecciona tu empresa"}
            </option>
            {companies.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

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
          disabled={
            submitting ||
            loadingCatalog ||
            loadingCompanies ||
            !catalog.length ||
            !companyId
          }
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
