import React from "react";

export default function Beneficios() {
  const items = [
    { t: "Autonomía energética", d: "Reducción de dependencia de la red central y mayor resiliencia local." },
    { t: "Ahorro económico", d: "Disminución de facturas y optimización de recursos energéticos." },
    { t: "Impacto ambiental", d: "Reducción de CO₂ y fomento de energías limpias." },
    { t: "Desarrollo local", d: "Creación de empleo técnico y fortalecimiento del tejido social." },
  ];
  return (
    <section id="beneficios" className="py-16 bg-[#f7faf9]">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold text-dark mb-6">Beneficios</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {items.map((it,i)=>(
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <div className="font-semibold text-[#07a68a] mb-2">{it.t}</div>
              <div className="text-sm text-gray-600">{it.d}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
