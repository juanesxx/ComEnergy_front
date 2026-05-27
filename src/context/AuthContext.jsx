import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  getAccessToken,
  getCurrent,
  loginUser as authLogin,
  logoutUser as authLogout,
} from "../utils/auth";
import { isPlatformAdmin } from "../utils/platformRoles";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getCurrent());
  const [token, setToken] = useState(() => getAccessToken());

  const syncFromStorage = useCallback(() => {
    setUser(getCurrent());
    setToken(getAccessToken());
  }, []);

  useEffect(() => {
    window.addEventListener("auth:changed", syncFromStorage);
    window.addEventListener("storage", syncFromStorage);
    return () => {
      window.removeEventListener("auth:changed", syncFromStorage);
      window.removeEventListener("storage", syncFromStorage);
    };
  }, [syncFromStorage]);

  const login = useCallback(async (credentials) => {
    const loggedIn = await authLogin(credentials);
    setUser(loggedIn);
    setToken(getAccessToken());
    return loggedIn;
  }, []);

  const logout = useCallback(async () => {
    await authLogout();
    setUser(null);
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      platformRoles: user?.roles || [],
      isAuthenticated: Boolean(user && token),
      isPlatformAdmin: isPlatformAdmin(user?.roles),
      login,
      logout,
      refreshUser: syncFromStorage,
    }),
    [user, token, login, logout, syncFromStorage]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return ctx;
}
