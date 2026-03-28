import React, { useEffect, useState } from "react";
import { getCurrent, logoutUser } from "../utils/auth";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import ServiceRequestsCenter from "./ServiceRequestsCenter";

/* ---------- DASHBOARD PROFESIONAL ---------- */
export default function Profile() {
  const [user, setUser] = useState(getCurrent());
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulación de consulta a backend
    setTimeout(() => {
      setStats([
        { mes: "Jun", energia: 120 },
        { mes: "Jul", energia: 200 },
        { mes: "Ago", energia: 180 },
        { mes: "Sep", energia: 220 },
        { mes: "Oct", energia: 250 },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    window.location.href = "/";
  };

  if (!user)
    return (
      <main className="pt-28 min-h-screen flex flex-col items-center justify-center bg-[#f9fbfa] text-center">
        <h2 className="text-3xl font-bold text-[#07a68a] mb-4">Sesión no iniciada</h2>
        <p className="text-gray-600 mb-6">Inicia sesión para acceder a tu panel.</p>
        <a
          href="/login"
          className="px-5 py-2 bg-[#07a68a] text-white rounded-lg hover:brightness-110 transition"
        >
          Ir al login
        </a>
      </main>
    );

  return (
    <main className="pt-24 min-h-screen bg-[#f9fbfa]">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard de usuario</h1>
            <p className="text-gray-500">
              Bienvenido,{" "}
              <span className="font-semibold text-[#07a68a]">{user.name}</span> —{" "}
              {user.empresa || "ComEnergia"}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="mt-4 md:mt-0 px-5 py-2 bg-[#07a68a] text-white rounded hover:brightness-110 transition"
          >
            Cerrar sesión
          </button>
        </div>

        {/* Grid principal */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <DashboardCard title="Servicios completados" value="18" />
          <DashboardCard title="Comunidades activas" value="4" />
          <DashboardCard title="Energía compartida (kWh)" value="12,450" />
          <DashboardCard title="Calificación promedio" value="4.9 ★" />
        </div>

        {/* Gráfica de desempeño */}
        <div className="bg-white shadow rounded-xl border border-gray-100 p-6 mb-10">
          <h3 className="text-lg font-semibold text-[#07a68a] mb-2">Desempeño mensual</h3>
          <p className="text-sm text-gray-500 mb-4">
            Evolución del intercambio energético en los últimos meses.
          </p>
          {loading ? (
            <div className="text-center py-10 text-gray-400">Cargando datos...</div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="energia" stroke="#07a68a" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Sección de actividad reciente */}
        <div className="bg-white shadow rounded-xl border border-gray-100 p-6 mb-10">
          <h3 className="text-lg font-semibold text-[#07a68a] mb-2">Actividad reciente</h3>
          <ul className="divide-y divide-gray-200 text-sm text-gray-700">
            <li className="py-3 flex justify-between">
              <span>Servicio de auditoría energética completado</span>
              <span className="text-gray-500">24 Oct 2025</span>
            </li>
            <li className="py-3 flex justify-between">
              <span>Instalación fotovoltaica en comunidad EcoAndina</span>
              <span className="text-gray-500">17 Oct 2025</span>
            </li>
            <li className="py-3 flex justify-between">
              <span>Mantenimiento técnico periódico</span>
              <span className="text-gray-500">08 Oct 2025</span>
            </li>
          </ul>
        </div>

        {/* Panel de comunidades */}
        <div className="bg-white shadow rounded-xl border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-[#07a68a] mb-2">Comunidades energéticas</h3>
          <p className="text-sm text-gray-600 mb-4">
            Estas son las comunidades con las que colaboras dentro de la red ComEnergia:
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                name: "Solar Andes",
                miembros: 58,
                energia: "4500 kWh",
              },
              {
                name: "La Guajira Solar",
                miembros: 74,
                energia: "8300 kWh",
              },
              {
                name: "EcoAndina",
                miembros: 41,
                energia: "3100 kWh",
              },
            ].map((c, i) => (
              <div
                key={i}
                className="border border-[#07a68a]/20 rounded-xl p-4 bg-[#f7faf9] hover:shadow-md transition"
              >
                <h4 className="font-semibold text-[#07a68a]">{c.name}</h4>
                <p className="text-sm text-gray-600">Miembros: {c.miembros}</p>
                <p className="text-sm text-gray-600">Energía generada: {c.energia}</p>
                <button className="mt-3 text-sm text-[#07a68a] hover:underline">
                  Ver comunidad
                </button>
              </div>
            ))}
          </div>
        </div>

        <ServiceRequestsCenter />
      </div>
    </main>
  );
}

/* ---------- COMPONENTE REUTILIZABLE ---------- */
function DashboardCard({ title, value }) {
  return (
    <div className="bg-white border border-gray-100 shadow rounded-xl p-5 flex flex-col justify-center text-center hover:shadow-md transition">
      <h4 className="text-sm text-gray-500">{title}</h4>
      <p className="text-2xl font-bold text-[#07a68a] mt-1">{value}</p>
    </div>
  );
}
