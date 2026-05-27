import { getAccessToken, logoutUser, refreshSession } from "./auth";
import { getStoredActiveCompanyId } from "./companyStorage";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");

const PUBLIC_PATH_PREFIXES = [
  "/accounts/login",
  "/accounts/users",
  "/accounts/refresh",
  "/company-services",
];

function buildUrl(path) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}

function isPublicPath(path) {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return PUBLIC_PATH_PREFIXES.some((prefix) => clean === prefix || clean.startsWith(`${prefix}?`));
}

function redirectToLogin() {
  const returnUrl = encodeURIComponent(
    `${window.location.pathname}${window.location.search}`
  );
  window.location.href = `/login?returnUrl=${returnUrl}`;
}

async function parseError(response, path = "") {
  let message = `Error HTTP ${response.status}`;
  let details = [];
  let type = "HttpError";

  let data = null;

  try {
    data = await response.json();
  } catch {

  }

  if (data?.error) {
    message = data.error.message || message;
    details = Array.isArray(data.error.details) ? data.error.details : [];
    type = data.error.type || type;
  } else if (data?.message) {
    message = data.message;
  }

  if (response.status === 403) {
    const isAdminPath = typeof path === "string" && path.includes("/admin/");
    if (!data?.error?.message) {
      message = isAdminPath
        ? "Platform admin access required"
        : "No tienes acceso a esta empresa";
    }
  }

  const err = new Error(message);
  err.details = details;
  err.type = type;
  err.status = response.status;

  throw err;
}

function buildHeaders(path, customHeaders, { skipAuth, skipCompanyHeader }) {
  const headers = {
    "Content-Type": "application/json",
    ...(customHeaders || {}),
  };

  if (!skipAuth) {
    const token = getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  if (!skipCompanyHeader) {
    const companyId = getStoredActiveCompanyId();
    if (companyId != null) {
      headers["X-Company-Id"] = String(companyId);
    }
  }

  return headers;
}

export async function apiRequest(path, options = {}) {
  const {
    headers: customHeaders,
    skipAuth = false,
    skipCompanyHeader = false,
    _retry = false,
    ...restOptions
  } = options;

  const response = await fetch(buildUrl(path), {
    credentials: "include",
    headers: buildHeaders(path, customHeaders, { skipAuth, skipCompanyHeader }),
    ...restOptions,
  });

  if (response.status === 401 && !_retry && !skipAuth && !isPublicPath(path)) {
    try {
      await refreshSession();
      return apiRequest(path, {
        ...options,
        _retry: true,
      });
    } catch {
      await logoutUser();
      redirectToLogin();
      throw new Error("Sesión expirada. Inicia sesión de nuevo.");
    }
  }

  if (!response.ok) {
    await parseError(response, path);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const apiBaseUrl = API_BASE_URL;
