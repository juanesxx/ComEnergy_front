import React from "react";

export default function QueEs() {
  return (
    <section id="que-es" className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="text-3xl font-bold text-dark mb-4">¿Qué es una comunidad energética?</h2>
          <p className="text-gray-700 mb-3">
            Una comunidad energética es una asociación local de personas, empresas o instituciones que producen, consumen y gestionan energía renovable en conjunto, 
            buscando beneficios económicos, sociales y ambientales. 
          </p>
          <p className="text-gray-700">
            En Colombia, este modelo se impulsa mediante políticas del Ministerio de Minas y Energía y la CREG, para fomentar la generación distribuida y la participación ciudadana en la transición energética.
          </p>
        </div>
        <div className="bg-[#f9fdfc] rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-[#07a68a] mb-2">Misión de ComEnergia</h3>
          <p className="text-gray-700 text-sm">
            Promover redes colaborativas entre comunidades para compartir excedentes de energía, asistencia técnica y buenas prácticas en sostenibilidad.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded shadow text-center">
              <div className="text-xs text-gray-500">Comunidades activas</div>
              <div className="font-bold text-[#07a68a]">+45</div>
            </div>
            <div className="bg-white p-3 rounded shadow text-center">
              <div className="text-xs text-gray-500">Energía compartida (kWh)</div>
              <div className="font-bold text-[#07a68a]">130,000</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
