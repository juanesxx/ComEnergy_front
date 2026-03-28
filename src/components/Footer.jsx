// src/components/Footer.jsx
import React from "react";

export default function Footer() {
  return (
    <footer className="bg-dark text-white mt-12">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-6">
        <div>
          <div className="font-semibold text-[#07a68a] mb-2">ComEnergia</div>
          <div className="text-sm text-gray-300">Proyecto académico — Tecnológico de Antioquia</div>
        </div>
        <div>
          <div className="font-semibold mb-2 text-[#07a68a]">Navegación</div>
          <ul className="text-sm text-gray-300 space-y-2">
            <li><a href="#que-es" className="hover:text-white">¿Qué es?</a></li>
            <li><a href="#servicios" className="hover:text-white">Servicios</a></li>
            <li><a href="#casos" className="hover:text-white">Casos</a></li>
            <li><a href="#normativa" className="hover:text-white">Normativa</a></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2 text-[#07a68a]">Contacto</div>
          <div className="text-sm text-gray-300">contacto@comenergia.org</div>
          <div className="text-sm text-gray-500 mt-4">© {new Date().getFullYear()} ComEnergia</div>
        </div>
      </div>
    </footer>
  );
}
