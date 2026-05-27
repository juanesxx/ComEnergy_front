export const ACTIVE_COMPANY_KEY = "activeCompanyId";

export function getStoredActiveCompanyId() {
  const raw = localStorage.getItem(ACTIVE_COMPANY_KEY);
  if (!raw) return null;
  const id = Number(raw);
  return Number.isFinite(id) ? id : null;
}

export function setStoredActiveCompanyId(companyId, options = {}) {
  const { silent = false } = options;

  if (companyId == null) {
    localStorage.removeItem(ACTIVE_COMPANY_KEY);
  } else {
    localStorage.setItem(ACTIVE_COMPANY_KEY, String(companyId));
  }

  if (!silent) {
    window.dispatchEvent(new Event("company:changed"));
  }
}
