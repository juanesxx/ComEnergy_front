import React, { useState } from "react";
import { createAdminCompany } from "../utils/auth";
import OwnerAssignmentResult from "./OwnerAssignmentResult";

export default function AdminCreateCompanyPanel() {
  const [name, setName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = ownerEmail.trim();

    if (trimmedName.length < 2) {
      setError("El nombre de la empresa debe tener al menos 2 caracteres.");
      return;
    }

    if (!trimmedEmail) {
      setError("Indica el correo del dueño.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setResult(null);

      const data = await createAdminCompany({
        name: trimmedName,
        ownerEmail: trimmedEmail,
      });

      setResult(data);
      setName("");
      setOwnerEmail("");
    } catch (err) {
      setError(err.message || "No se pudo crear la empresa.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-white shadow rounded-xl border border-gray-100 p-6 mb-10">
      <h3 className="text-lg font-semibold text-[#07a68a] mb-1">Nueva empresa (admin plataforma)</h3>
      <p className="text-sm text-gray-600 mb-6">
        Crea una empresa y asigna el primer propietario por correo.
      </p>

      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Nombre de la empresa</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            minLength={2}
            maxLength={150}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#07a68a]"
            placeholder="Solar Andes SAS"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Email del dueño (OWNER)</label>
          <input
            type="email"
            value={ownerEmail}
            onChange={(e) => setOwnerEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#07a68a]"
            placeholder="dueño@ejemplo.dev"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 rounded-lg bg-[#07a68a] text-white text-sm font-medium hover:brightness-110 disabled:opacity-60"
        >
          {submitting ? "Creando..." : "Crear empresa"}
        </button>
      </form>

      {error && <p className="text-sm text-amber-700 mt-4">{error}</p>}

      <OwnerAssignmentResult
        result={result}
        successTitle="Empresa creada, dueño ya tiene acceso"
      />
    </section>
  );
}
