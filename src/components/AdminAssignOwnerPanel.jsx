import React, { useCallback, useEffect, useState } from "react";
import { assignAdminCompanyOwner, fetchAdminCompanies } from "../utils/auth";
import OwnerAssignmentResult from "./OwnerAssignmentResult";

export default function AdminAssignOwnerPanel() {
  const [companies, setCompanies] = useState([]);
  const [companyId, setCompanyId] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const loadCompanies = useCallback(async () => {
    try {
      setLoadingCompanies(true);
      setError("");
      const list = await fetchAdminCompanies();
      setCompanies(list);
      if (list.length === 1) {
        setCompanyId(String(list[0].id));
      }
    } catch (err) {
      setCompanies([]);
      setError(err.message || "No se pudo cargar el listado de empresas.");
    } finally {
      setLoadingCompanies(false);
    }
  }, []);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const id = Number(companyId);
    const trimmedEmail = ownerEmail.trim();

    if (!id) {
      setError("Selecciona una empresa.");
      return;
    }

    if (!trimmedEmail) {
      setError("Indica el correo del nuevo propietario.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setResult(null);

      const data = await assignAdminCompanyOwner(id, { ownerEmail: trimmedEmail });
      setResult(data);
      setOwnerEmail("");
    } catch (err) {
      setError(err.message || "No se pudo asignar el propietario.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-white shadow rounded-xl border border-gray-100 p-6 mb-10">
      <h3 className="text-lg font-semibold text-[#07a68a] mb-1">
        Asignar propietario (empresa existente)
      </h3>
      <p className="text-sm text-gray-600 mb-6">
        Añade un propietario a una empresa ya creada. Si el usuario no existe, se genera invitación.
      </p>

      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Empresa</label>
          <select
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            disabled={loadingCompanies || companies.length === 0}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#07a68a]"
          >
            <option value="">
              {loadingCompanies
                ? "Cargando empresas..."
                : companies.length === 0
                  ? "No hay empresas disponibles"
                  : "Selecciona una empresa"}
            </option>
            {companies.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Email del propietario (OWNER)
          </label>
          <input
            type="email"
            value={ownerEmail}
            onChange={(e) => setOwnerEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#07a68a]"
            placeholder="nuevo.dueño@ejemplo.dev"
          />
        </div>
        <button
          type="submit"
          disabled={submitting || loadingCompanies || !companies.length}
          className="px-4 py-2 rounded-lg bg-[#07a68a] text-white text-sm font-medium hover:brightness-110 disabled:opacity-60"
        >
          {submitting ? "Asignando..." : "Asignar propietario"}
        </button>
      </form>

      {error && <p className="text-sm text-amber-700 mt-4">{error}</p>}

      <OwnerAssignmentResult
        result={result}
        successTitle="Propietario asignado — el usuario ya tiene acceso"
      />
    </section>
  );
}
