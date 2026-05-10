import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCurrent, logoutUser } from "../utils/auth";

export default function Header({ onOpenQuote }) {
  const [user, setUser] = useState(getCurrent());

  useEffect(() => {
    const updateUser = () => setUser(getCurrent());
    window.addEventListener("storage", updateUser);
    window.addEventListener("auth:changed", updateUser);

    return () => {
      window.removeEventListener("storage", updateUser);
      window.removeEventListener("auth:changed", updateUser);
    };
  }, []);

  async function handleLogout() {
    await logoutUser();
    setUser(null);
    window.location.href = "/";
  }

  return (
    <header className="fixed w-full z-50 bg-white/90 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="ComEnergia" className="w-10 h-10" />
          <div>
            <div className="font-bold text-lg text-[#07a68a]">ComEnergia</div>
            <div className="text-xs text-gray-500">Comunidades energéticas conectadas</div>
          </div>
        </Link>

        <nav className="hidden lg:flex gap-6 items-center text-sm text-dark">
          <a href="#inicio" className="hover:text-[#07a68a]">Inicio</a>
          <a href="#que-es" className="hover:text-[#07a68a]">¿Qué es?</a>
          <a href="#beneficios" className="hover:text-[#07a68a]">Beneficios</a>
          <a href="#servicios" className="hover:text-[#07a68a]">Servicios</a>
          <a href="#casos" className="hover:text-[#07a68a]">Casos</a>
          <a href="#normativa" className="hover:text-[#07a68a]">Normativa</a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {typeof onOpenQuote === "function" && (
            <button
              type="button"
              onClick={onOpenQuote}
              className="hidden sm:inline-flex px-3 py-2 text-sm font-medium rounded-lg border border-[#07a68a] text-[#07a68a] hover:bg-[#07a68a]/10"
            >
              Cotiza ahora
            </button>
          )}
          {typeof onOpenQuote === "function" && (
            <button
              type="button"
              onClick={onOpenQuote}
              className="sm:hidden px-2 py-1.5 text-xs font-semibold rounded-lg bg-[#07a68a] text-white"
              aria-label="Cotiza ahora"
            >
              Cotiza
            </button>
          )}
          {user ? (
            <>
              <Link to="/profile" className="text-sm text-[#07a68a]">{user.name}</Link>
              <button onClick={handleLogout} className="px-3 py-1 bg-gray-100 rounded text-sm">Cerrar sesión</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm hover:text-[#07a68a]">Ingresar</Link>
              <Link to="/register" className="px-3 py-2 bg-[#07a68a] text-white rounded">Registrarse</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
