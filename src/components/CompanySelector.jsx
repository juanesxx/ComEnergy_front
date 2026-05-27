import React from "react";
import { useCompany } from "../context/CompanyContext";
import { useAuth } from "../context/AuthContext";

export default function CompanySelector() {
  const { isAuthenticated } = useAuth();
  const {
    companies,
    activeCompanyId,
    activeCompany,
    loading,
    setActiveCompanyById,
  } = useCompany();

  if (!isAuthenticated) return null;

  if (loading && companies.length === 0) {
    return (
      <span className="text-xs text-gray-500 hidden sm:inline">Empresas...</span>
    );
  }

  if (companies.length === 0) {
    return (
      <span className="text-xs text-amber-700 hidden sm:inline" title="Sin empresas">
        Sin empresa
      </span>
    );
  }

  if (companies.length === 1) {
    return (
      <span
        className="text-xs text-gray-600 hidden sm:inline max-w-[140px] truncate"
        title={activeCompany?.name}
      >
        {activeCompany?.name}
      </span>
    );
  }

  return (
    <select
      value={activeCompanyId ?? ""}
      onChange={(e) => setActiveCompanyById(e.target.value)}
      className="text-xs border border-gray-200 rounded px-2 py-1 max-w-[160px] truncate bg-white"
      aria-label="Empresa activa"
      title={activeCompany?.name}
    >
      {companies.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  );
}
