import React from "react";
import RatingStars from "./RatingStars";
import { motion } from "framer-motion";

export default function ServiceModal({ service, onClose }) {
  if (!service) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="relative bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-800 dark:text-gray-100 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-[#07a68a]/40"
      >
        {/* Imagen superior */}
        <div className="relative h-56 w-full">
          <img
            src={service.img}
            alt={service.title}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-black/40 text-white rounded-full p-2 hover:bg-red-500/80 transition"
          >
            ✕
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-[#07a68a] mb-2">
            {service.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
            {service.description}
          </p>

          <div className="mt-4 flex flex-col gap-2">
            <div>
              <span className="font-semibold">Empresa: </span>
              {service.company}
            </div>
            {service.companyContact && (
              <div>
                <span className="font-semibold">Contacto: </span>
                <a
                  href={`mailto:${service.companyContact}`}
                  className="text-[#07a68a] hover:underline"
                >
                  {service.companyContact}
                </a>
              </div>
            )}
          </div>

          {/* Calificación */}
          <div className="mt-6">
            <span className="font-semibold">Califica este servicio:</span>
            <RatingStars serviceId={service.id} />
          </div>

          {/* Botón de acción */}
          {service.companyContact && (
            <div className="mt-6 text-center">
              <a
                href={`mailto:${service.companyContact}`}
                className="inline-block px-5 py-2 bg-[#07a68a] text-white rounded-lg hover:brightness-110 transition"
              >
                Contactar empresa
              </a>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
