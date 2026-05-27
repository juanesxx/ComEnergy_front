import React, { useEffect, useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useAuth } from "../context/AuthContext";
import { useCompany } from "../context/CompanyContext";
import ServiceRequestsCenter from "./ServiceRequestsCenter";
import AdminServicesPanel from "./AdminServicesPanel";
import AdminCreateCompanyPanel from "./AdminCreateCompanyPanel";
import AdminAssignOwnerPanel from "./AdminAssignOwnerPanel";
import SellerOfferServicePanel from "./SellerOfferServicePanel";
import InviteMember from "./InviteMember";
import CompanyRatingsBreakdown from "./CompanyRatingsBreakdown";
import CanCompanyAdmin from "./guards/CanCompanyAdmin";
import IsPlatformAdmin from "./guards/IsPlatformAdmin";

export default function Profile() {
  const { user, logout } = useAuth();
  const { activeCompany, activeCompanyId, companies, loading: companiesLoading } = useCompany();
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    await logout();
    window.location.href = "/";
  };

  return (
    <main className="pt-24 min-h-screen bg-[#f9fbfa]">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard de usuario</h1>
            <p className="text-gray-500">
              Bienvenido,{" "}
              <span className="font-semibold text-[#07a68a]">{user?.name}</span>
              {companiesLoading ? (
                <span className="text-gray-400 text-sm ml-2">Cargando empresas...</span>
              ) : activeCompany ? (
                <>
                  {" "}
                  — <span className="text-gray-700">{activeCompany.name}</span>
                  <span className="text-xs text-gray-400 ml-1">({activeCompany.role})</span>
                </>
              ) : companies.length === 0 ? (
                <span className="text-amber-600 text-sm ml-2">Sin empresa asignada</span>
              ) : null}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="mt-4 md:mt-0 px-5 py-2 bg-[#07a68a] text-white rounded hover:brightness-110 transition"
          >
            Cerrar sesión
          </button>
        </div>
        <IsPlatformAdmin>
          <AdminCreateCompanyPanel />
          <AdminAssignOwnerPanel />
          <AdminServicesPanel />
        </IsPlatformAdmin>

        {!companiesLoading && (
          <>
            <CanCompanyAdmin>
              <SellerOfferServicePanel />
              <InviteMember />
            </CanCompanyAdmin>

            {activeCompanyId && <CompanyRatingsBreakdown />}

            <ServiceRequestsCenter />
          </>
        )}
      </div>
    </main>
  );
}

function DashboardCard({ title, value }) {
  return (
    <div className="bg-white border border-gray-100 shadow rounded-xl p-5 flex flex-col justify-center text-center hover:shadow-md transition">
      <h4 className="text-sm text-gray-500">{title}</h4>
      <p className="text-2xl font-bold text-[#07a68a] mt-1">{value}</p>
    </div>
  );
}
