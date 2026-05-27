import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../utils/auth";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      await registerUser(form);
      navigate("/profile");
    } catch (error) {
      if (error.details?.length) {
        const mapped = {};
        error.details.forEach((detail) => {
          mapped[detail.path] = detail.message;
        });
        setFieldErrors(mapped);
        setErr("");
      } else {
        setFieldErrors({});
        setErr(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[100vh] flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-[#013220] relative overflow-hidden py-20">
      <div className="absolute inset-0">
        <div className="absolute w-96 h-96 bg-[#07a68a]/20 blur-3xl rounded-full top-1/3 left-1/3 animate-pulse"></div>
        <div className="absolute w-72 h-72 bg-[#09ffb4]/10 blur-2xl rounded-full bottom-10 right-20 animate-pulse"></div>
      </div>

      <div className="relative z-10 bg-white/10 backdrop-blur-xl border border-[#07a68a]/40 shadow-lg p-8 rounded-2xl w-96">
        <h3 className="text-3xl font-bold mb-2 text-center text-[#07a68a] drop-shadow-lg">
          Crear cuenta
        </h3>
        <p className="text-sm text-gray-400 text-center mb-6">
          Para unirte a una empresa como prestador, usa el enlace de invitación que te envíen.
        </p>
        <form onSubmit={handle} className="space-y-4">
          <input
            type="text"
            placeholder="Nombre completo"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="w-full border border-[#07a68a]/40 bg-transparent text-white placeholder-gray-400 rounded px-3 py-2 focus:ring-2 focus:ring-[#07a68a] outline-none"
          />
          {fieldErrors.name && (
            <div className="text-red-400 text-xs mt-1">{fieldErrors.name}</div>
          )}
          <input
            type="email"
            placeholder="Correo electrónico"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className="w-full border border-[#07a68a]/40 bg-transparent text-white placeholder-gray-400 rounded px-3 py-2 focus:ring-2 focus:ring-[#07a68a] outline-none"
          />
          {fieldErrors.email && (
            <div className="text-red-400 text-xs mt-1">{fieldErrors.email}</div>
          )}
          <input
            type="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            className="w-full border border-[#07a68a]/40 bg-transparent text-white placeholder-gray-400 rounded px-3 py-2 focus:ring-2 focus:ring-[#07a68a] outline-none"
          />
          {fieldErrors.password && (
            <div className="text-red-400 text-xs mt-1">{fieldErrors.password}</div>
          )}
          {err && <div className="text-red-400 text-sm">{err}</div>}
          <button
            disabled={loading}
            className="w-full py-2 bg-[#07a68a] hover:brightness-110 text-white rounded shadow-md transition-all disabled:opacity-70"
          >
            {loading ? "Creando cuenta..." : "Registrarse"}
          </button>
        </form>
      </div>
    </main>
  );
}
