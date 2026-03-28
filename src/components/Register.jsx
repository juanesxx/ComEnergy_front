import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCompanies, registerCompanyUser, registerUser } from "../utils/auth";
import { FcGoogle } from "react-icons/fc";
import { FaMicrosoft } from "react-icons/fa";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    accountType: "customer",
    companyMode: "existing",
    existingCompanyName: "",
    newCompanyName: "",
    companyRole: "owner",
  });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadCompanies() {
      try {
        setLoadingCompanies(true);
        const response = await getCompanies();

        if (mounted) {
          setCompanies(response);
          if (response.length > 0) {
            setForm((current) => ({
              ...current,
              existingCompanyName: current.existingCompanyName || response[0].name,
            }));
          }
        }
      } catch {
        if (mounted) {
          setCompanies([]);
        }
      } finally {
        if (mounted) {
          setLoadingCompanies(false);
        }
      }
    }

    loadCompanies();

    return () => {
      mounted = false;
    };
  }, []);

  const resolvedCompanyName = useMemo(() => {
    if (form.accountType !== "company") {
      return "";
    }

    if (form.companyMode === "new") {
      return form.newCompanyName.trim();
    }

    return form.existingCompanyName.trim();
  }, [form]);

  const handle = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      if (form.accountType === "company") {
        if (!resolvedCompanyName) {
          throw new Error("Debes seleccionar o escribir una empresa");
        }

        await registerCompanyUser({
          name: form.name,
          email: form.email,
          password: form.password,
          companyName: resolvedCompanyName,
          companyRole: form.companyRole,
        });
      } else {
        await registerUser(form);
      }

      navigate("/profile");
    } catch (error) {
      setErr(error.message || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = (provider) => {
    alert(`Registro simulado con ${provider}`);
    navigate("/profile");
  };

  return (
   <main className="min-h-[100vh] flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-[#013220] relative overflow-hidden py-20">
      {/*  EFECTO */}
      <div className="absolute inset-0">
        <div className="absolute w-96 h-96 bg-[#07a68a]/20 blur-3xl rounded-full top-1/3 left-1/3 animate-pulse"></div>
        <div className="absolute w-72 h-72 bg-[#09ffb4]/10 blur-2xl rounded-full bottom-10 right-20 animate-pulse"></div>
      </div>

      <div className="relative z-10 bg-white/10 backdrop-blur-xl border border-[#07a68a]/40 shadow-lg p-8 rounded-2xl w-96">
        <h3 className="text-3xl font-bold mb-6 text-center text-[#07a68a] drop-shadow-lg">
          Crear cuenta
        </h3>
        <form onSubmit={handle} className="space-y-4">
          <div>
            <label className="text-xs text-gray-300">Tipo de cuenta</label>
            <select
              value={form.accountType}
              onChange={(e) =>
                setForm({
                  ...form,
                  accountType: e.target.value,
                })
              }
              className="mt-1 w-full border border-[#07a68a]/40 bg-transparent text-white rounded px-3 py-2 focus:ring-2 focus:ring-[#07a68a] outline-none"
            >
              <option value="customer" className="text-black">
                Usuario / comunidad
              </option>
              <option value="company" className="text-black">
                Empresa prestadora
              </option>
            </select>
          </div>

          <input
            type="text"
            placeholder="Nombre completo"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="w-full border border-[#07a68a]/40 bg-transparent text-white placeholder-gray-400 rounded px-3 py-2 focus:ring-2 focus:ring-[#07a68a] outline-none"
          />
          <input
            type="email"
            placeholder="Correo electrónico"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className="w-full border border-[#07a68a]/40 bg-transparent text-white placeholder-gray-400 rounded px-3 py-2 focus:ring-2 focus:ring-[#07a68a] outline-none"
          />

          {form.accountType === "company" && (
            <>
              <div>
                <label className="text-xs text-gray-300">Empresa</label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className={`px-3 py-2 rounded border text-sm ${
                      form.companyMode === "existing"
                        ? "border-[#07a68a] text-[#07a68a]"
                        : "border-[#07a68a]/40 text-gray-300"
                    }`}
                    onClick={() => setForm({ ...form, companyMode: "existing" })}
                  >
                    Vincular existente
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-2 rounded border text-sm ${
                      form.companyMode === "new"
                        ? "border-[#07a68a] text-[#07a68a]"
                        : "border-[#07a68a]/40 text-gray-300"
                    }`}
                    onClick={() => setForm({ ...form, companyMode: "new" })}
                  >
                    Crear nueva
                  </button>
                </div>
              </div>

              {form.companyMode === "existing" ? (
                <select
                  value={form.existingCompanyName}
                  onChange={(e) =>
                    setForm({ ...form, existingCompanyName: e.target.value })
                  }
                  className="w-full border border-[#07a68a]/40 bg-transparent text-white rounded px-3 py-2 focus:ring-2 focus:ring-[#07a68a] outline-none"
                  required
                  disabled={loadingCompanies || companies.length === 0}
                >
                  {companies.length === 0 ? (
                    <option value="" className="text-black">
                      No hay empresas cargadas
                    </option>
                  ) : (
                    companies.map((company) => (
                      <option
                        key={company.id}
                        value={company.name}
                        className="text-black"
                      >
                        {company.name}
                      </option>
                    ))
                  )}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="Nombre de la nueva empresa"
                  value={form.newCompanyName}
                  onChange={(e) =>
                    setForm({ ...form, newCompanyName: e.target.value })
                  }
                  className="w-full border border-[#07a68a]/40 bg-transparent text-white placeholder-gray-400 rounded px-3 py-2 focus:ring-2 focus:ring-[#07a68a] outline-none"
                  required
                />
              )}

              <input
                type="text"
                placeholder="Rol en la empresa (ej. owner, manager)"
                value={form.companyRole}
                onChange={(e) => setForm({ ...form, companyRole: e.target.value })}
                className="w-full border border-[#07a68a]/40 bg-transparent text-white placeholder-gray-400 rounded px-3 py-2 focus:ring-2 focus:ring-[#07a68a] outline-none"
              />
            </>
          )}

          <input
            type="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            className="w-full border border-[#07a68a]/40 bg-transparent text-white placeholder-gray-400 rounded px-3 py-2 focus:ring-2 focus:ring-[#07a68a] outline-none"
          />
          {err && <div className="text-red-400 text-sm">{err}</div>}
          <button
            disabled={loading}
            className="w-full py-2 bg-[#07a68a] hover:brightness-110 text-white rounded shadow-md transition-all disabled:opacity-70"
          >
            {loading ? "Creando cuenta..." : "Registrarse"}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={() => handleOAuth("Google")}
            className="w-full py-2 border border-[#07a68a]/40 flex items-center justify-center gap-2 rounded text-white hover:bg-[#07a68a]/20 transition-all"
          >
            <FcGoogle className="text-xl" /> Registrarse con Google
          </button>
          <button
            onClick={() => handleOAuth("Microsoft")}
            className="w-full py-2 border border-[#07a68a]/40 flex items-center justify-center gap-2 rounded text-white hover:bg-[#07a68a]/20 transition-all"
          >
            <FaMicrosoft className="text-blue-400 text-xl" /> Registrarse con Microsoft
          </button>
        </div>
      </div>
    </main>
  );
}
