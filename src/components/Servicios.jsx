import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaStar } from "react-icons/fa";
import { apiRequest } from "../utils/api";
import { getAccessToken } from "../utils/auth";

export default function Servicios() {
  const [modal, setModal] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [requestFeedback, setRequestFeedback] = useState("");
  const [requestError, setRequestError] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadServices() {
      try {
        setLoading(true);
        setError("");

        const servicesResponse = await apiRequest("/services");
        const serviceList = servicesResponse?.data || [];

        const enriched = await Promise.all(
          serviceList.map(async (service) => {
            try {
              const companiesResponse = await apiRequest(
                `/company-services?serviceId=${service.id}`
              );
              const companies = companiesResponse?.data || [];
              const primaryCompany = companies[0];

              return {
                id: service.id,
                title: service.title,
                imageUrl: service.imageUrl,
                summary: service.summary,
                detail: service.detail,
                companyId: primaryCompany?.companyId || null,
                empresa: primaryCompany?.companyName || "Comunidad asociada",
                rating: primaryCompany?.averageRating ?? null,
                companies,
              };
            } catch {
              return {
                id: service.id,
                title: service.title,
                imageUrl: service.imageUrl,
                summary: service.summary,
                detail: service.detail,
                companyId: null,
                empresa: "Comunidad asociada",
                rating: null,
                companies: [],
              };
            }
          })
        );

        if (isMounted) {
          setServicios(enriched);
        }
      } catch {
        if (isMounted) {
          setError("No se pudo conectar con el backend.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadServices();

    return () => {
      isMounted = false;
    };
  }, []);

  const openServiceModal = (service) => {
    setModal(service);
    setSelectedCompanyId(String(service.companies?.[0]?.companyId || ""));
    setRequestMessage("");
    setRequestFeedback("");
    setRequestError("");
  };

  const closeServiceModal = () => {
    setModal(null);
    setSelectedCompanyId("");
    setRequestMessage("");
    setRequestFeedback("");
    setRequestError("");
    setRequestLoading(false);
  };

  const createServiceRequest = async () => {
    const token = getAccessToken();

    if (!token) {
      setRequestError("Debes iniciar sesión para solicitar este servicio.");
      return;
    }

    if (!modal?.id || !selectedCompanyId) {
      setRequestError("Selecciona una empresa para continuar.");
      return;
    }

    const trimmedMessage = requestMessage.trim();

    if (!trimmedMessage) {
      setRequestError("Debes escribir un mensaje inicial para la solicitud.");
      return;
    }

    try {
      setRequestLoading(true);
      setRequestError("");
      setRequestFeedback("");

      await apiRequest("/service-requests", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceId: modal.id,
          companyId: Number(selectedCompanyId),
          message: trimmedMessage,
        }),
      });

      setRequestFeedback(
        "Solicitud creada. Puedes hacer seguimiento y chatear desde tu perfil."
      );
      setRequestMessage("");
    } catch (createError) {
      setRequestError(
        createError.message || "No se pudo crear la solicitud del servicio."
      );
    } finally {
      setRequestLoading(false);
    }
  };

  return (
    <section id="servicios" className="py-20 bg-[#f7faf9]">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold text-gray-800 mb-6">
          Servicios e intercambios
        </h2>
        <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
          Oferta de servicios colaborativos entre comunidades energéticas
          locales y empresas especializadas. Puedes consultar detalles,
          calificaciones y contactar a la empresa prestadora.
        </p>

        {loading && (
          <p className="text-sm text-gray-500 mb-6">Cargando servicios desde el backend...</p>
        )}

        {error && <p className="text-sm text-amber-700 mb-6">{error}</p>}

        {/* Tarjetas de servicios */}
        <div className="grid md:grid-cols-3 gap-8">
          {servicios.map((s) => (
            <motion.div
              key={s.id}
              whileHover={{ scale: 1.03 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col"
            >
              <img
                src={s.imageUrl}
                alt={s.title}
                className="h-48 w-full object-cover"
              />
              <div className="p-5 flex flex-col justify-between flex-grow">
                <div>
                  <h3 className="text-lg font-bold text-[#07a68a] mb-2">
                    {s.title}
                  </h3>
                  <p className="text-sm text-gray-600">{s.summary}</p>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <button
                    onClick={() => openServiceModal(s)}
                    className="px-4 py-2 text-sm bg-[#07a68a] text-white rounded-lg hover:brightness-110"
                  >
                    Ver detalles
                  </button>
                  <div className="flex items-center text-yellow-400">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <FaStar
                          key={i}
                          className={`${
                            i < Math.round(s.rating || 0) ? "" : "opacity-30"
                          }`}
                        />
                      ))}
                    <span className="ml-2 text-gray-500 text-sm">
                      {typeof s.rating === "number" ? s.rating.toFixed(1) : "Sin calificar"}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal de detalle */}
      <AnimatePresence>
        {modal && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-[90%] relative"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <button
                onClick={closeServiceModal}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
              <h3 className="text-2xl font-bold text-[#07a68a] mb-2">
                {modal.title}
              </h3>
              <img
                src={modal.imageUrl}
                alt={modal.title}
                className="w-full h-56 object-cover rounded-lg mb-4"
              />
              <p className="text-gray-700 mb-4 text-sm">{modal.detail}</p>

              <div className="flex justify-between items-center border-t pt-4">
                <div>
                  <p className="text-sm text-gray-600">
                    Prestado por:{" "}
                    <span className="font-semibold text-[#07a68a]">
                      {modal.empresa}
                    </span>
                  </p>
                  <div className="flex items-center text-yellow-400">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <FaStar
                          key={i}
                          className={`${
                            i < Math.round(modal.rating || 0) ? "" : "opacity-30"
                          }`}
                        />
                      ))}
                    <span className="ml-2 text-gray-500 text-sm">
                      {typeof modal.rating === "number" ? modal.rating.toFixed(1) : "Sin calificar"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-gray-200 p-4 bg-gray-50">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">
                  Solicitar este servicio
                </h4>

                <div className="space-y-3">
                  <select
                    value={selectedCompanyId}
                    onChange={(event) => setSelectedCompanyId(event.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#07a68a]"
                  >
                    <option value="">Selecciona una empresa</option>
                    {(modal.companies || []).map((company) => (
                      <option key={company.companyId} value={company.companyId}>
                        {company.companyName}
                      </option>
                    ))}
                  </select>

                  <textarea
                    value={requestMessage}
                    onChange={(event) => setRequestMessage(event.target.value)}
                    placeholder="Mensaje inicial de la solicitud"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#07a68a] min-h-24"
                    maxLength={500}
                  />

                  <button
                    onClick={createServiceRequest}
                    disabled={requestLoading}
                    className="px-4 py-2 rounded-lg bg-[#07a68a] text-white text-sm font-medium hover:brightness-110 disabled:opacity-60"
                  >
                    {requestLoading ? "Creando solicitud..." : "Crear solicitud"}
                  </button>

                  {requestFeedback && (
                    <p className="text-xs text-emerald-700">{requestFeedback}</p>
                  )}
                  {requestError && (
                    <p className="text-xs text-amber-700">{requestError}</p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
