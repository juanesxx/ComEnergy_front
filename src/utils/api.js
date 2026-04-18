const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");

function buildUrl(path) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}

async function parseError(response) {
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

  const err = new Error(message);
  err.details = details; 
  err.type = type;
  err.status = response.status;

  throw err;
}

export async function apiRequest(path, options = {}) {
  const { headers: customHeaders, ...restOptions } = options;

  const response = await fetch(buildUrl(path), {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(customHeaders || {}),
    },
    ...restOptions,
  });

  if (!response.ok) {
    await parseError(response);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const apiBaseUrl = API_BASE_URL;
