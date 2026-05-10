import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { fetchPhotovoltaicCities, requestSolarQuotationEstimate } from "../services/quotationApi";
import {
  INSTALLATION_TYPES,
  PROPERTY_TYPES,
  validateQuotationStep1,
  validateQuotationStep2,
} from "../utils/quotationValidation";

const initialForm = () => ({
  monthlyConsumptionKwh: "",
  averageBillCop: "",
  city: "",
  propertyType: "",
  availableAreaM2: "",
  installationType: "",
  name: "",
  email: "",
  phone: "",
});

function formatNumberEs(value, options) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) {
    return "—";
  }
  return new Intl.NumberFormat("es-CO", options).format(Number(value));
}

function formatCurrencyCOP(value, currency) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) {
    return "—";
  }
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: currency || "COP",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export default function CotizaAhoraModal({ open, onClose }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [cityOptions, setCityOptions] = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [citiesError, setCitiesError] = useState("");

  const loadCities = useCallback(async () => {
    setCitiesLoading(true);
    setCitiesError("");
    try {
      const list = await fetchPhotovoltaicCities();
      setCityOptions(list);
      if (list.length === 0) {
        setCitiesError("No hay ciudades disponibles en este momento.");
      }
    } catch (e) {
      setCityOptions([]);
      setCitiesError(e.message || "No se pudieron cargar las ciudades.");
    } finally {
      setCitiesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    loadCities();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open, loadCities]);

  const titleId = useMemo(() => "cotiza-ahora-title", []);

  const cityValidationOptions = useMemo(
    () => ({ allowedCityLabels: cityOptions.map((c) => c.label) }),
    [cityOptions],
  );

  const citiesReady = !citiesLoading && !citiesError && cityOptions.length > 0;

  const resetAll = () => {
    setStep(1);
    setForm(initialForm());
    setFieldErrors({});
    setFormError("");
    setLoading(false);
    setResult(null);
  };

  const handleClose = () => {
    resetAll();
    onClose();
  };

  const goNextFromStep1 = () => {
    const errors = validateQuotationStep1(form, cityValidationOptions);
    setFieldErrors(errors);
    setFormError("");

    if (Object.keys(errors).length === 0) {
      setStep(2);
    }
  };

  const submitEstimate = async () => {
    const step1Errors = validateQuotationStep1(form, cityValidationOptions);
    const errors = { ...step1Errors, ...validateQuotationStep2(form) };
    setFieldErrors(errors);
    setFormError("");

    if (Object.keys(errors).length > 0) {
      setStep(Object.keys(step1Errors).length ? 1 : 2);
      return;
    }

    try {
      setLoading(true);
      setFormError("");
      const estimate = await requestSolarQuotationEstimate(form);
      setResult(estimate);
      setStep(3);
    } catch (error) {
      if (Array.isArray(error.details) && error.details.length) {
        const mapped = {};
        error.details.forEach((detail) => {
          const path = detail?.path;
          if (path && path !== "form") mapped[path] = detail.message;
        });
        setFieldErrors(mapped);
        setFormError(Object.keys(mapped).length ? "" : error.message || "");
      } else {
        setFieldErrors({});
        setFormError(error.message || "No se pudo generar la cotización. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#07a68a]";

  const labelClass = "block text-xs font-semibold text-gray-700 mb-1";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center px-4 py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="presentation"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 text-gray-500 hover:text-gray-800 rounded-full p-2"
              aria-label="Cerrar cotización"
            >
              ✕
            </button>

            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4 pr-10">
                <div>
                  <p className="text-xs font-semibold text-[#07a68a] uppercase tracking-wide">
                    Cotización aproximada
                  </p>
                  <h2 id={titleId} className="text-2xl font-bold text-gray-900 mt-1">
                    Cotiza ahora
                  </h2>
                  <p className="text-sm text-gray-600 mt-2">
                    Completa la información para estimar un sistema fotovoltaico o comunidad energética.
                    Los resultados son orientativos.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 text-xs text-gray-600">
                <span
                  className={`px-2 py-1 rounded-full ${step === 1 ? "bg-[#07a68a] text-white" : "bg-gray-100"}`}
                >
                  1 · Proyecto
                </span>
                <span className="text-gray-300">›</span>
                <span
                  className={`px-2 py-1 rounded-full ${step === 2 ? "bg-[#07a68a] text-white" : "bg-gray-100"}`}
                >
                  2 · Contacto
                </span>
                <span className="text-gray-300">›</span>
                <span
                  className={`px-2 py-1 rounded-full ${step === 3 ? "bg-[#07a68a] text-white" : "bg-gray-100"}`}
                >
                  3 · Resultado
                </span>
              </div>

              {step === 1 && (
                <div className="mt-6 grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-1">
                    <label className={labelClass} htmlFor="monthlyConsumptionKwh">
                      Consumo mensual (kWh)
                    </label>
                    <input
                      id="monthlyConsumptionKwh"
                      name="monthlyConsumptionKwh"
                      inputMode="decimal"
                      className={inputClass}
                      value={form.monthlyConsumptionKwh}
                      onChange={(e) => setForm({ ...form, monthlyConsumptionKwh: e.target.value })}
                    />
                    {fieldErrors.monthlyConsumptionKwh && (
                      <p className="text-xs text-red-600 mt-1">{fieldErrors.monthlyConsumptionKwh}</p>
                    )}
                  </div>

                  <div className="sm:col-span-1">
                    <label className={labelClass} htmlFor="averageBillCop">
                      Valor promedio factura (COP / mes)
                    </label>
                    <input
                      id="averageBillCop"
                      name="averageBillCop"
                      inputMode="decimal"
                      className={inputClass}
                      value={form.averageBillCop}
                      onChange={(e) => setForm({ ...form, averageBillCop: e.target.value })}
                    />
                    {fieldErrors.averageBillCop && (
                      <p className="text-xs text-red-600 mt-1">{fieldErrors.averageBillCop}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelClass} htmlFor="city">
                      Ciudad
                    </label>
                    <select
                      id="city"
                      name="city"
                      className={`${inputClass} disabled:bg-gray-100 disabled:text-gray-500`}
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      disabled={citiesLoading || Boolean(citiesError) || cityOptions.length === 0}
                      aria-busy={citiesLoading}
                    >
                      <option value="">
                        {citiesLoading ? "Cargando ciudades…" : "Selecciona una ciudad…"}
                      </option>
                      {cityOptions.map((opt) => (
                        <option key={opt.cityKey} value={opt.label}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {citiesLoading && (
                      <p className="text-xs text-gray-500 mt-1">Obteniendo listado desde el servidor…</p>
                    )}
                    {citiesError && !citiesLoading && (
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <p className="text-xs text-amber-800">{citiesError}</p>
                        <button
                          type="button"
                          onClick={() => loadCities()}
                          className="text-xs font-medium text-[#07a68a] underline hover:no-underline"
                        >
                          Reintentar
                        </button>
                      </div>
                    )}
                    {fieldErrors.city && <p className="text-xs text-red-600 mt-1">{fieldErrors.city}</p>}
                  </div>

                  <div className="sm:col-span-1">
                    <label className={labelClass} htmlFor="propertyType">
                      Tipo de inmueble
                    </label>
                    <select
                      id="propertyType"
                      name="propertyType"
                      className={inputClass}
                      value={form.propertyType}
                      onChange={(e) => setForm({ ...form, propertyType: e.target.value })}
                    >
                      <option value="">Selecciona…</option>
                      {PROPERTY_TYPES.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.propertyType && (
                      <p className="text-xs text-red-600 mt-1">{fieldErrors.propertyType}</p>
                    )}
                  </div>

                  <div className="sm:col-span-1">
                    <label className={labelClass} htmlFor="installationType">
                      Tipo de instalación
                    </label>
                    <select
                      id="installationType"
                      name="installationType"
                      className={inputClass}
                      value={form.installationType}
                      onChange={(e) => setForm({ ...form, installationType: e.target.value })}
                    >
                      <option value="">Selecciona…</option>
                      {INSTALLATION_TYPES.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.installationType && (
                      <p className="text-xs text-red-600 mt-1">{fieldErrors.installationType}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelClass} htmlFor="availableAreaM2">
                      Área disponible aproximada (m²)
                    </label>
                    <input
                      id="availableAreaM2"
                      name="availableAreaM2"
                      inputMode="decimal"
                      className={inputClass}
                      value={form.availableAreaM2}
                      onChange={(e) => setForm({ ...form, availableAreaM2: e.target.value })}
                    />
                    {fieldErrors.availableAreaM2 && (
                      <p className="text-xs text-red-600 mt-1">{fieldErrors.availableAreaM2}</p>
                    )}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="mt-6 grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className={labelClass} htmlFor="name">
                      Nombre completo
                    </label>
                    <input
                      id="name"
                      name="name"
                      autoComplete="name"
                      className={inputClass}
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                    {fieldErrors.name && <p className="text-xs text-red-600 mt-1">{fieldErrors.name}</p>}
                  </div>

                  <div className="sm:col-span-1">
                    <label className={labelClass} htmlFor="email">
                      Correo electrónico
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      className={inputClass}
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                    {fieldErrors.email && <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>}
                  </div>

                  <div className="sm:col-span-1">
                    <label className={labelClass} htmlFor="phone">
                      Teléfono
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      className={inputClass}
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="Ej. 3001234567"
                    />
                    {fieldErrors.phone && <p className="text-xs text-red-600 mt-1">{fieldErrors.phone}</p>}
                  </div>
                </div>
              )}

              {step === 3 && result && (
                <div className="mt-6 space-y-4">
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                    <p className="text-sm font-semibold text-emerald-900">Resultado estimado</p>
                    <p className="text-xs text-emerald-800 mt-1">
                      Cifras calculadas en el servidor (modelo alineado al libro de trabajo del backend). No
                      constituye oferta comercial.
                      {result.id != null && Number.isFinite(result.id) ? (
                        <span className="block mt-1 text-emerald-900/80">
                          Referencia de cotización: #{formatNumberEs(result.id, { maximumFractionDigits: 0 })}
                        </span>
                      ) : null}
                    </p>
                  </div>

                  <dl className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div className="rounded-lg border border-gray-200 p-4">
                      <dt className="text-gray-500">Potencia de diseño estimada</dt>
                      <dd className="text-lg font-semibold text-gray-900 mt-1">
                        {formatNumberEs(result.designKwp, { maximumFractionDigits: 2 })} kWp
                      </dd>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4">
                      <dt className="text-gray-500">Generación estimada (mensual)</dt>
                      <dd className="text-lg font-semibold text-gray-900 mt-1">
                        {formatNumberEs(result.estimatedMonthlyGenerationKwh, { maximumFractionDigits: 0 })} kWh/mes
                      </dd>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4">
                      <dt className="text-gray-500">Cantidad de paneles (aprox.)</dt>
                      <dd className="text-lg font-semibold text-gray-900 mt-1">
                        {formatNumberEs(result.approximatePanelCount, { maximumFractionDigits: 0 })}
                      </dd>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4">
                      <dt className="text-gray-500">Área requerida</dt>
                      <dd className="text-lg font-semibold text-gray-900 mt-1">
                        {formatNumberEs(result.requiredAreaM2, { maximumFractionDigits: 1 })} m²
                      </dd>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4">
                      <dt className="text-gray-500">Ahorro aproximado (mensual)</dt>
                      <dd className="text-lg font-semibold text-gray-900 mt-1">
                        {formatCurrencyCOP(result.estimatedMonthlySavingsCop, "COP")}
                      </dd>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4">
                      <dt className="text-gray-500">Valor estimado del proyecto</dt>
                      <dd className="text-lg font-semibold text-gray-900 mt-1">
                        {formatCurrencyCOP(result.estimatedProjectValueCop, "COP")}
                      </dd>
                    </div>
                  </dl>

                  {result.peakSunHours != null && result.performanceRatio != null ? (
                    <p className="text-xs text-gray-500">
                      Referencias técnicas: HSP {formatNumberEs(result.peakSunHours, { maximumFractionDigits: 1 })} h,
                      PR{" "}
                      {formatNumberEs(result.performanceRatio, {
                        style: "percent",
                        maximumFractionDigits: 1,
                      })}
                    </p>
                  ) : null}

                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
                    <strong className="font-semibold">Aviso importante:</strong> esta cotización es preliminar y
                    orientativa. Depende de condiciones reales de red, sombras, normativa local y visita técnica. Un
                    especialista debe validar el diseño final.
                  </div>
                </div>
              )}

              {formError && (
                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  {formError}
                </div>
              )}

              <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3">
                {step < 3 ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        if (step === 1) handleClose();
                        else setStep(1);
                      }}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-800 hover:bg-gray-50"
                    >
                      {step === 1 ? "Cancelar" : "Volver"}
                    </button>
                    <div className="flex gap-3 justify-end">
                      {step === 2 && (
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-800 hover:bg-gray-50 sm:hidden"
                        >
                          Volver
                        </button>
                      )}
                      {step === 1 ? (
                        <button
                          type="button"
                          onClick={goNextFromStep1}
                          disabled={!citiesReady}
                          className="px-5 py-2 rounded-lg bg-[#07a68a] text-white text-sm font-medium hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          Continuar
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={submitEstimate}
                          disabled={loading}
                          className="px-5 py-2 rounded-lg bg-[#07a68a] text-white text-sm font-medium hover:brightness-110 disabled:opacity-60"
                        >
                          {loading ? "Generando…" : "Generar cotización"}
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={resetAll}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-800 hover:bg-gray-50"
                    >
                      Nueva cotización
                    </button>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-5 py-2 rounded-lg bg-[#07a68a] text-white text-sm font-medium hover:brightness-110"
                    >
                      Cerrar
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
