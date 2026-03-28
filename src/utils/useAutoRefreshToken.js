import { useEffect, useState } from "react";
import { getAccessToken, getTokenExpiry, logoutUser, refreshSession } from "./auth";

// Refresca el access token automáticamente 2 minutos antes de que expire.
// Se reinicia cada vez que el token cambia (login, refresh previo).
export function useAutoRefreshToken() {
  // Estado local para forzar el re-cálculo cuando el token cambia
  const [tokenVersion, setTokenVersion] = useState(0);

  // Escuchar cambios de auth (login, logout, refresh)
  useEffect(() => {
    function handleAuthChange() {
      setTokenVersion((v) => v + 1);
    }

    window.addEventListener("auth:changed", handleAuthChange);
    return () => window.removeEventListener("auth:changed", handleAuthChange);
  }, []);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    const expiry = getTokenExpiry(token);
    if (!expiry) return;

    // Refrescar 2 minutos antes de expirar
    const MARGIN_MS = 2 * 60 * 1000;
    const delay = expiry - Date.now() - MARGIN_MS;

    if (delay <= 0) {
      // El token ya expiró o está a punto de expirar, refrescar de inmediato
      refreshSession().catch(() => logoutUser());
      return;
    }

    const timer = setTimeout(() => {
      refreshSession()
        .then(() => {
          // auth:changed se dispara dentro de refreshSession al actualizar el token
        })
        .catch(() => {
          logoutUser();
        });
    }, delay);

    return () => clearTimeout(timer);
  }, [tokenVersion]);
}
