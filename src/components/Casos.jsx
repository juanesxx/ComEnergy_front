import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "../utils/api";

export default function Casos() {
  const [modal, setModal] = useState(null);
  const [casos, setCasos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadCases() {
      try {
        setLoading(true);
        setError("");

        const response = await apiRequest("/cases");
        const casesList = response?.data || [];

        if (isMounted) {
          const mapped = casesList.map((c) => ({
            id: c.id,
            name: c.name,
            region: c.region,
            desc: c.desc,
            details: c.details,
            img: c.img_url,
            empresa: c.empresa,
            rating: c.rating,
            link: c.link,
          }));
          setCasos(mapped);
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

    loadCases();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="casos" className="py-20 bg-[#f7faf9]">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Casos y proyectos reales en Colombia
        </h2>
        <p className="text-center text-gray-600 mb-10 max-w-3xl mx-auto">
          Estos casos reflejan experiencias reales de comunidades energéticas que han logrado autonomía,
          sostenibilidad y desarrollo local gracias a la cooperación entre el sector público, privado y la ciudadanía.
        </p>

        {loading && (
          <p className="text-sm text-gray-500 mb-6">Cargando casos desde el backend...</p>
        )}

        {error && <p className="text-sm text-amber-700 mb-6">{error}</p>}

        {/* Tarjetas de casos */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {casos.map((c, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition"
              onClick={() => setModal(c)}
            >
              <img
                src={c.img}
                alt={c.name}
                className="h-48 w-full object-cover"
                onError={(e) => (e.target.src = "/paneles.png")}
              />
              <div className="p-5">
                <h3 className="font-semibold text-[#07a68a] text-lg">{c.name}</h3>
                <div className="text-sm text-gray-500">{c.region}</div>
                <p className="text-gray-600 text-sm mt-2">{c.desc}</p>
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-xs text-gray-500">Por: {c.empresa}</span>
                  <span className="text-[#07a68a] font-medium">★ {c.rating}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Modal de detalle */}
        <AnimatePresence>
          {modal && (
            <motion.div
              className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-lg relative"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
              >
                <button
                  onClick={() => setModal(null)}
                  className="absolute top-3 right-4 text-gray-500 text-lg"
                >
                  ✕
                </button>
                <img
                  src={modal.img}
                  alt={modal.name}
                  className="w-full h-56 object-cover rounded-lg mb-4"
                  onError={(e) => (e.target.src = "/paneles.png")}
                />
                <h3 className="text-2xl font-bold text-[#07a68a]">{modal.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{modal.region}</p>
                <p className="text-gray-700">{modal.details}</p>
                <div className="mt-4 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">
                      Empresa/Entidad: <strong>{modal.empresa}</strong>
                    </p>
                    <p className="text-sm text-gray-600">Calificación: ★ {modal.rating}</p>
                  </div>
                  <a
                    href={modal.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-[#07a68a] text-white rounded hover:brightness-110 transition"
                  >
                    Ver fuente oficial
                  </a>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
