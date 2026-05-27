import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { fetchUserCompanies } from "../utils/auth";
import { getStoredActiveCompanyId, setStoredActiveCompanyId } from "../utils/companyStorage";
import { hasCompanyRole } from "../utils/companyRoles";
import { useAuth } from "./AuthContext";

const CompanyContext = createContext(null);

function pickActiveCompany(companies, storedId) {
  if (!companies.length) return null;
  if (storedId != null) {
    const id = Number(storedId);
    const match = companies.find((c) => Number(c.id) === id);
    if (match) return match;
  }
  return companies[0];
}

export function CompanyProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [activeCompany, setActiveCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const applyActive = useCallback((list, preferredId) => {
    const storedId = preferredId ?? getStoredActiveCompanyId();
    const next = pickActiveCompany(list, storedId);
    setActiveCompany(next);
    if (next) {
      setStoredActiveCompanyId(next.id, { silent: true });
    } else {
      setStoredActiveCompanyId(null, { silent: true });
    }
    return next;
  }, []);

  const loadCompanies = useCallback(async (preferredId) => {
    if (!isAuthenticated) {
      setCompanies([]);
      setActiveCompany(null);
      setStoredActiveCompanyId(null);
      return [];
    }

    setLoading(true);
    setError("");

    try {
      const list = await fetchUserCompanies();
      setCompanies(list);
      applyActive(list, preferredId);
      return list;
    } catch (err) {
      setError(err.message || "No se pudieron cargar tus empresas.");
      setCompanies([]);
      setActiveCompany(null);
      setStoredActiveCompanyId(null);
      return [];
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, applyActive]);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  useEffect(() => {
    function onCompanyChanged() {
      if (!companies.length) return;

      const storedId = getStoredActiveCompanyId();
      setActiveCompany((current) => {
        const next = pickActiveCompany(companies, storedId);
        if (!next) return current;
        return Number(next.id) === Number(current?.id) ? current : next;
      });
    }

    window.addEventListener("company:changed", onCompanyChanged);
    return () => window.removeEventListener("company:changed", onCompanyChanged);
  }, [companies]);

  const setActiveCompanyById = useCallback(
    (companyId) => {
      const match = companies.find((c) => c.id === Number(companyId));
      if (!match) return;
      setActiveCompany(match);
      setStoredActiveCompanyId(match.id);
    },
    [companies]
  );

  const value = useMemo(
    () => ({
      companies,
      activeCompany,
      activeCompanyId: activeCompany?.id ?? null,
      activeCompanyRole: activeCompany?.role ?? null,
      loading,
      error,
      loadCompanies,
      setActiveCompanyById,
      isCompanyAdmin: hasCompanyRole(activeCompany?.role, "ADMIN"),
      isCompanyMember: hasCompanyRole(activeCompany?.role, ['MEMBER', 'ADMIN', 'OWNER']),
    }),
    [
      companies,
      activeCompany,
      loading,
      error,
      loadCompanies,
      setActiveCompanyById,
    ]
  );

  return (
    <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>
  );
}

export function useCompany() {
  const ctx = useContext(CompanyContext);
  if (!ctx) {
    throw new Error("useCompany debe usarse dentro de CompanyProvider");
  }
  return ctx;
}
