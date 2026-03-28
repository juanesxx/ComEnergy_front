import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FAQ() {
  const faqs = [
    {
      q: "¿Qué es una comunidad energética?",
      a: "Una comunidad energética es una agrupación de ciudadanos, empresas o instituciones locales que cooperan para producir, consumir y gestionar energía renovable, buscando beneficios sociales, ambientales y económicos.",
    },
    {
      q: "¿Qué beneficios ofrece formar parte de una comunidad energética?",
      a: "Entre los principales beneficios se encuentran la reducción de costos de energía, el aprovechamiento de excedentes, la generación de empleo local, la sostenibilidad ambiental y el fortalecimiento del tejido social.",
    },
    {
      q: "¿Cómo se regulan las comunidades energéticas en Colombia?",
      a: "Actualmente se rigen bajo la Ley 2294 de 2023, el Decreto 2236 de 2023 y la Resolución CREG 701 de 2024, que establecen las condiciones técnicas y comerciales para su implementación.",
    },
    {
      q: "¿Qué tipos de energía pueden gestionarse en una comunidad energética?",
      a: "Principalmente energía solar fotovoltaica y eólica, pero también se pueden incluir proyectos de biomasa, microhidráulica y eficiencia energética.",
    },
    {
      q: "¿Cómo se financia una comunidad energética?",
      a: "A través de aportes de los miembros, programas de incentivos estatales, cooperación internacional y esquemas de financiación colectiva o ‘crowdfunding’ energético.",
    },
    {
      q: "¿Qué papel juega la plataforma ComEnergia?",
      a: "ComEnergia facilita el intercambio de servicios, conocimiento y recursos entre comunidades energéticas, promoviendo la colaboración técnica y la creación de redes locales sostenibles.",
    },
    {
      q: "¿Cómo puedo unirme o crear una comunidad energética?",
      a: "Puedes registrarte en la plataforma, elegir una comunidad existente o iniciar un nuevo grupo local. La plataforma ofrece apoyo técnico, guías y contactos con otras comunidades.",
    },
  ];

  const [open, setOpen] = useState(null);

  return (
    <section id="faq" className="py-20 bg-[#f7faf9]">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-dark mb-8">
          Preguntas Frecuentes
        </h2>
        <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto">
          Encuentra respuestas sobre el funcionamiento, beneficios y marco legal
          de las comunidades energéticas y el papel de ComEnergia en su
          desarrollo.
        </p>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm border border-gray-100"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex justify-between items-center px-5 py-4 text-left focus:outline-none"
              >
                <span className="font-medium text-gray-800">{faq.q}</span>
                <span className="text-[#07a68a] text-xl">
                  {open === i ? "−" : "+"}
                </span>
              </button>

              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-5 pb-4 text-gray-600 text-sm"
                  >
                    {faq.a}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <div className="text-center mt-12 text-sm text-gray-500">
          Basado en datos de <strong>Minenergía</strong>,{" "}
          <strong>CREG</strong> y la{" "}
          <strong>Hoja de Ruta de Comunidades Energéticas en Colombia (2024)</strong>.
        </div>
      </div>
    </section>
  );
}
