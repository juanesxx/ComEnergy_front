import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCompany } from "../context/CompanyContext";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const { loadCompanies } = useCompany();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      await login({ email, password });
      await loadCompanies();
      const returnUrl = searchParams.get("returnUrl");
      navigate(returnUrl ? decodeURIComponent(returnUrl) : "/profile", { replace: true });
    } catch (error) {
      setErr(error.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
   <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-[#013220] relative overflow-hidden py-20">
      <div className="absolute inset-0">
        <div className="absolute w-96 h-96 bg-[#07a68a]/20 blur-3xl rounded-full top-1/3 left-1/3 animate-pulse"></div>
        <div className="absolute w-72 h-72 bg-[#09ffb4]/10 blur-2xl rounded-full bottom-10 right-20 animate-pulse"></div>
      </div>

      <div className="relative z-10 bg-white/10 backdrop-blur-xl border border-[#07a68a]/40 shadow-lg p-8 rounded-2xl w-96">
        <h3 className="text-3xl font-bold mb-6 text-center text-[#07a68a] drop-shadow-lg">
          Iniciar sesión
        </h3>
        <form onSubmit={handle} className="space-y-4">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-[#07a68a]/40 bg-transparent text-white placeholder-gray-400 rounded px-3 py-2 focus:ring-2 focus:ring-[#07a68a] outline-none"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-[#07a68a]/40 bg-transparent text-white placeholder-gray-400 rounded px-3 py-2 focus:ring-2 focus:ring-[#07a68a] outline-none"
          />
          {err && <div className="text-red-400 text-sm">{err}</div>}
          <button
            disabled={loading}
            className="w-full py-2 bg-[#07a68a] hover:brightness-110 text-white rounded shadow-md transition-all disabled:opacity-70"
            type="submit"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </main>
  );
}
