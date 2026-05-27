import React, { useState } from "react";
import { useCompany } from "../context/CompanyContext";
import { createInvitation } from "../utils/auth";
import { canInviteRole } from "../utils/companyRoles";
import CanCompanyAdmin from "./guards/CanCompanyAdmin";

const ROLE_OPTIONS = [
  { value: "MEMBER", label: "Miembro" },
  { value: "ADMIN", label: "Administrador" },
  { value: "OWNER", label: "Propietario" },
];

export default function InviteMember() {
  const { activeCompany, activeCompanyId, activeCompanyRole } = useCompany();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MEMBER");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [invitationToken, setInvitationToken] = useState("");

  const availableRoles = ROLE_OPTIONS.filter((opt) =>
    canInviteRole(activeCompanyRole, opt.value)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeCompanyId) {
      setError("Selecciona una empresa activa.");
      return;
    }

    if (!canInviteRole(activeCompanyRole, role)) {
      setError("No puedes asignar ese rol con tu membresía actual.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setInvitationToken("");

      const data = await createInvitation(activeCompanyId, {
        email: email.trim(),
        role,
      });

      setInvitationToken(data?.invitationToken || "");
      setEmail("");
      setRole("MEMBER");
    } catch (err) {
      setError(err.message || "No se pudo crear la invitación.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CanCompanyAdmin>
      <section className="bg-white shadow rounded-xl border border-gray-100 p-6 mb-10">
        <h3 className="text-lg font-semibold text-[#07a68a] mb-1">
          Invitar miembro — {activeCompany?.name}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Se generará un enlace de un solo uso.
        </p>

        <form onSubmit={handleSubmit} className="max-w-md space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Correo</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Rol</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              {availableRoles.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={submitting || !email.trim()}
            className="px-4 py-2 rounded-lg bg-[#07a68a] text-white text-sm disabled:opacity-60"
          >
            {submitting ? "Enviando..." : "Crear invitación"}
          </button>
        </form>

        {error && <p className="text-sm text-amber-700 mt-3">{error}</p>}

        {invitationToken && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm">
            <p className="font-medium text-emerald-800 mb-1">Invitación creada</p>
            <p className="text-gray-700 break-all">
              Enlace:{" "}
              <a
                className="text-[#07a68a] underline"
                href={`/accept-invitation?token=${encodeURIComponent(invitationToken)}`}
              >
                /accept-invitation?token=…
              </a>
            </p>
            <p className="text-xs text-gray-500 mt-2">
              No compartas este token en logs ni capturas en producción.
            </p>
          </div>
        )}
      </section>
    </CanCompanyAdmin>
  );
}
