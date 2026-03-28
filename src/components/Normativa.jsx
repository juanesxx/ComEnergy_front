import React from "react";

export default function Normativa() {
  const docs = [
    {
      title: "Ley 2294 de 2023",
      org: "Congreso de la República de Colombia",
      text: "Establece el Plan Nacional de Desarrollo 2022–2026 'Colombia Potencia Mundial de la Vida', incluyendo estrategias de transición energética justa y participación comunitaria en proyectos renovables."
    },
    {
      title: "Decreto 2236 de 2023",
      org: "Ministerio de Minas y Energía",
      text: "Reglamenta el funcionamiento y operación de las comunidades energéticas, definiendo requisitos técnicos y financieros para acceder a beneficios e incentivos."
    },
    {
      title: "Resolución CREG 701 de 2024",
      org: "Comisión de Regulación de Energía y Gas",
      text: "Actualiza el marco técnico de la generación distribuida, permitiendo la inyección de excedentes y estableciendo esquemas de medición neta y compensación económica."
    },
    {
      title: "Resolución UPME 40545 de 2024",
      org: "Unidad de Planeación Minero Energética",
      text: "Define criterios de priorización para proyectos comunitarios de energías renovables no convencionales (FNCER) y apoyo financiero a comunidades rurales."
    },
  ];

  return (
    <section id="normativa" className="py-16 bg-[#f7faf9]">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-dark mb-4">Marco normativo en Colombia</h2>
        <p className="text-gray-600 mb-6">
          Normas clave que respaldan la creación y operación de comunidades energéticas en el país.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          {docs.map((d, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow">
              <div className="font-semibold text-[#07a68a] text-lg">{d.title}</div>
              <div className="text-xs text-gray-500">{d.org}</div>
              <p className="text-sm text-gray-700 mt-2">{d.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
