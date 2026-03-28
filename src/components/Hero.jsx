import React from "react";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section id="inicio" className="pt-24 bg-gradient-to-br from-white via-[#f2fffb] to-[#e6fffa]">
      <div className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <span className="inline-block bg-[#07a68a]/10 text-[#07a68a] px-4 py-1 rounded-full text-xs font-semibold mb-4">Red de comunidades</span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-dark mb-4">
            Energía compartida, <span className="text-[#07a68a]">comunidad conectada</span>
          </h1>
          <p className="text-gray-700 mb-6 max-w-xl">
            ComEnergia es una plataforma para el intercambio de servicios, excedentes y conocimiento entre comunidades energéticas. 
            Facilita la cooperación técnica, la capacitación y la puesta en marcha de proyectos renovables a escala local.
          </p>
          <div className="flex gap-4">
            <a href="#servicios" className="px-5 py-3 bg-[#07a68a] text-white rounded-lg">Explorar servicios</a>
            <a href="#que-es" className="px-5 py-3 border border-[#07a68a] text-[#07a68a] rounded-lg">Saber más</a>
          </div>
        </div>
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="rounded-xl overflow-hidden shadow-lg">
          <img src="/hero.png" alt="Hero ComEnergia" className="w-full h-full object-cover" />
        </motion.div>
      </div>
    </section>
  );
}
