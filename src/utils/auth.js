import { apiRequest } from "./api";

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
    body: JSON.stringify({
      name,
      email,
      password,
      roles: ["customer"],
    }),
  });

  // Login after successful registration for a smoother UX.
  return loginUser({ email, password, name });
}

export async function getCompanies() {
  const response = await apiRequest("/accounts/companies", {
    method: "GET",
  });

  return response?.data || [];
}

export async function registerCompanyUser({
  name,
  email,
  password,
  companyName,
  companyRole,
}) {
  if (!name || !email || !password || !companyName) {
    throw new Error("Campos incompletos");
  }

  await apiRequest("/accounts/company-users", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      password,
      companyName,
      companyRole,
    }),
  });

  return loginUser({ email, password, name });
}

export async function loginUser({ email, password, name }) {
  const response = await apiRequest("/accounts/login", {
    method: "POST",
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
  });

  setAccessToken(response?.accessToken || null);
  return response;
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

// Devuelve la fecha de expiración del token en milisegundos (Unix ms) o null si no es válido
export function getTokenExpiry(token) {
  if (!token) return null;
  try {
    const payloadBase64 = token.split(".")[1];
    const json = atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(json);
    if (!payload.exp) return null;
    return payload.exp * 1000; // convertir segundos a ms
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
    window.dispatchEvent(new Event("auth:changed"));
  }
}
