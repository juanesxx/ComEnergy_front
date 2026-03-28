const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");

function buildUrl(path) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}

async function parseError(response) {
  let message = `Error HTTP ${response.status}`;

  try {
    const data = await response.json();

    if (data?.error?.message) {
      message = data.error.message;
    } else if (Array.isArray(data?.error?.details) && data.error.details.length > 0) {
      message = data.error.details.map((d) => d.message).join(". ");
    } else if (data?.message) {
      message = data.message;
    }
  } catch {
    // Keep default message when body is not JSON.
  }

  throw new Error(message);
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
