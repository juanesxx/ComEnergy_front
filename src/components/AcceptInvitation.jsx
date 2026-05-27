import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCompany } from "../context/CompanyContext";
import { acceptInvitation } from "../utils/auth";

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { loadCompanies } = useCompany();
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Falta el token de invitación en la URL.");
      return;
    }

    if (!isAuthenticated) {
      setStatus("needs-auth");
      return;
    }

    let cancelled = false;

    async function run() {
      try {
        setStatus("loading");
        const result = await acceptInvitation(token);
        const joinedId = result?.data?.companyId;
        await loadCompanies(joinedId ?? undefined);
        if (!cancelled) {
          setStatus("success");
          setMessage("Te uniste a la empresa correctamente.");
          setTimeout(() => navigate("/profile"), 2000);
        }
      } catch (err) {
        if (!cancelled) {
          setStatus("error");
          setMessage(err.message || "No se pudo aceptar la invitación.");
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [token, isAuthenticated, loadCompanies, navigate]);

  if (!token) {
    return (
      <main className="pt-28 min-h-screen flex items-center justify-center px-4">
        <p className="text-amber-700">{message}</p>
      </main>
    );
  }

  if (status === "needs-auth") {
    const returnUrl = encodeURIComponent(`/accept-invitation?token=${encodeURIComponent(token)}`);
    return (
      <main className="pt-28 min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <h2 className="text-2xl font-bold text-[#07a68a] mb-3">Aceptar invitación</h2>
        <p className="text-gray-600 mb-6 max-w-md">
          Inicia sesión con el mismo correo al que se envió la invitación para continuar.
        </p>
        <Link
          to={`/login?returnUrl=${returnUrl}`}
          className="px-5 py-2 bg-[#07a68a] text-white rounded-lg"
        >
          Ir a iniciar sesión
        </Link>
      </main>
    );
  }

  return (
    <main className="pt-28 min-h-screen flex flex-col items-center justify-center px-4 text-center">
      {status === "loading" && <p className="text-gray-600">Procesando invitación...</p>}
      {status === "success" && <p className="text-emerald-700">{message}</p>}
      {status === "error" && <p className="text-amber-700">{message}</p>}
    </main>
  );
}
