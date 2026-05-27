import { apiRequest } from "./api";
import { setStoredActiveCompanyId } from "./companyStorage";

const CURRENT_USER_KEY = "currentUser";
const ACCESS_TOKEN_KEY = "accessToken";

function setCurrentUser(user) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("auth:changed"));
}

function setAccessToken(token) {
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
  window.dispatchEvent(new Event("auth:changed"));
}

export async function registerUser({ name, email, password }) {
  if (!name || !email || !password) {
    throw new Error("Campos incompletos");
  }

  await apiRequest("/accounts/users", {
    method: "POST",
    skipAuth: true,
    body: JSON.stringify({
      name,
      email,
      password,
      roles: ["customer"],
    }),
  });

  return loginUser({ email, password, name });
}

export async function fetchUserCompanies() {
  const response = await apiRequest("/accounts/users/companies", {
    method: "GET",
  });
  return response?.data || [];
}

export async function loginUser({ email, password, name }) {
  const response = await apiRequest("/accounts/login", {
    method: "POST",
    skipAuth: true,
    body: JSON.stringify({ email, password }),
  });

  const user = {
    name: name || email,
    email,
    roles: response?.roles || [],
  };

  setCurrentUser(user);
  setAccessToken(response?.token || null);

  return user;
}

export async function refreshSession() {
  const response = await apiRequest("/accounts/refresh", {
    method: "POST",
    skipAuth: true,
  });

  setAccessToken(response?.accessToken || null);
  return response;
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getTokenPayload() {
  const token = getAccessToken();
  if (!token) return null;
  try {
    const payloadBase64 = token.split(".")[1];
    const json = atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getUserIdFromToken() {
  const payload = getTokenPayload();
  if (!payload) return null;
  const raw = payload.userId ?? payload.id ?? payload.sub;
  const numeric = Number(raw);
  return Number.isFinite(numeric) ? numeric : raw;
}

export function getTokenExpiry(token) {
  if (!token) return null;
  try {
    const payload = token
      ? JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")))
      : getTokenPayload();
    if (!payload?.exp) return null;
    return payload.exp * 1000;
  } catch {
    return null;
  }
}

export function getCurrent() {
  return JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || "null");
}

export async function logoutUser() {
  try {
    await apiRequest("/accounts/logout", { method: "POST" });
  } finally {
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    setStoredActiveCompanyId(null);
    window.dispatchEvent(new Event("auth:changed"));
  }
}

export async function acceptInvitation(token) {
  const response = await apiRequest("/accounts/invitations/accept", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
  return response;
}

export async function createInvitation(companyId, { email, role }) {
  const response = await apiRequest(`/accounts/companies/${companyId}/invitations`, {
    method: "POST",
    body: JSON.stringify({ email, role }),
  });
  return response?.data;
}

export async function createAdminCompany({ name, ownerEmail }) {
  const response = await apiRequest("/accounts/admin/companies", {
    method: "POST",
    skipCompanyHeader: true,
    body: JSON.stringify({ name, ownerEmail }),
  });
  return response?.data;
}

export async function fetchAdminCompanies() {
  const response = await apiRequest("/accounts/admin/companies", {
    method: "GET",
    skipCompanyHeader: true,
  });
  return response?.data || [];
}

export async function assignAdminCompanyOwner(companyId, { ownerEmail }) {
  const response = await apiRequest(
    `/accounts/admin/companies/${companyId}/owners`,
    {
      method: "POST",
      skipCompanyHeader: true,
      body: JSON.stringify({ ownerEmail }),
    }
  );
  return response?.data;
}
