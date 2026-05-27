import React from "react";

export default function OwnerAssignmentResult({ result, successTitle }) {
  const owner = result?.owner;
  const invitationToken =
    owner?.type === "invitation" ? owner.invitationToken : null;

  if (!owner) return null;

  if (owner.type === "membership") {
    return (
      <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800">
        <p className="font-medium">{successTitle}</p>
        <p className="mt-1 text-gray-700">
          {owner.email}
          {owner.userId != null ? ` (usuario #${owner.userId})` : ""}
        </p>
        {result?.company?.name && (
          <p className="mt-1 text-gray-600">Empresa: {result.company.name}</p>
        )}
      </div>
    );
  }

  if (owner.type === "invitation") {
    return (
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
        <p className="font-medium text-blue-900">Invitación OWNER pendiente</p>
        <p className="text-gray-700 mt-1">
          {owner.email}
          {owner.expiresAt && (
            <span className="block text-xs text-gray-500 mt-1">
              Expira: {new Date(owner.expiresAt).toLocaleString("es-CO")}
            </span>
          )}
        </p>
        {invitationToken && (
          <p className="mt-2 break-all text-gray-700">
            Enlace (solo desarrollo):{" "}
            <a
              className="text-[#07a68a] underline"
              href={`/accept-invitation?token=${encodeURIComponent(invitationToken)}`}
            >
              /accept-invitation?token=…
            </a>
          </p>
        )}
        <p className="text-xs text-gray-500 mt-2">
          En producción envía este enlace por email; no lo registres en logs.
        </p>
      </div>
    );
  }

  return null;
}
