import React from "react";
import { useCompany } from "../../context/CompanyContext";
import { hasCompanyRole } from "../../utils/companyRoles";

export default function CanCompanyAdmin({ minRole = "ADMIN", children, fallback = null }) {
  const { activeCompanyRole } = useCompany();

  if (!hasCompanyRole(activeCompanyRole, minRole)) {
    return fallback;
  }

  return children;
}
