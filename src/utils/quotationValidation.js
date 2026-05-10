const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Valores exactos del enum `propertyTypeSchema` en el backend (Zod). */
export const PROPERTY_TYPES = [
  { value: "casa", label: "Casa" },
  { value: "apartamento", label: "Apartamento" },
  { value: "comercial", label: "Comercial" },
  { value: "industrial", label: "Industrial" },
  { value: "rural", label: "Rural" },
  { value: "otro", label: "Otro" },
];

/** Valores exactos del enum `installationTypeSchema` en el backend (Zod). */
export const INSTALLATION_TYPES = [
  { value: "techo", label: "Techo / cubierta" },
  { value: "suelo", label: "Suelo / terreno" },
  { value: "cochera", label: "Cochera / carport" },
  { value: "mixto", label: "Mixto" },
  { value: "otro", label: "Otro" },
];

function parsePositiveNumber(raw) {
  if (raw === "" || raw === null || raw === undefined) {
    return { ok: false, message: "Este campo es obligatorio." };
  }

  const n = Number(String(raw).replace(",", "."));
  if (!Number.isFinite(n)) {
    return { ok: false, message: "Ingresa un número válido." };
  }

  if (n < 0) {
    return { ok: false, message: "No se permiten valores negativos." };
  }

  if (n === 0) {
    return { ok: false, message: "El valor debe ser mayor que cero." };
  }

  return { ok: true, value: n };
}

function parseNonnegativeNumber(raw) {
  if (raw === "" || raw === null || raw === undefined) {
    return { ok: false, message: "Este campo es obligatorio." };
  }

  const n = Number(String(raw).replace(",", "."));
  if (!Number.isFinite(n)) {
    return { ok: false, message: "Ingresa un número válido." };
  }

  if (n < 0) {
    return { ok: false, message: "No se permiten valores negativos." };
  }

  return { ok: true, value: n };
}

/**
 * @param {object} values
 * @param {{ allowedCityLabels?: string[] }} [options] Si hay etiquetas, `city` debe coincidir con una (valor del desplegable).
 */
export function validateQuotationStep1(values, options = {}) {
  const { allowedCityLabels } = options;
  const errors = {};

  const kwh = parsePositiveNumber(values.monthlyConsumptionKwh);
  if (!kwh.ok) errors.monthlyConsumptionKwh = kwh.message;
  else if (kwh.value > 200_000) {
    errors.monthlyConsumptionKwh = "El consumo parece fuera de rango (máx. 200.000 kWh/mes).";
  }

  const bill = parseNonnegativeNumber(values.averageBillCop);
  if (!bill.ok) errors.averageBillCop = bill.message;
  else if (bill.value > 500_000_000) {
    errors.averageBillCop = "El valor de la factura parece fuera de rango.";
  }

  const city = String(values.city || "").trim();
  if (!city) errors.city = "Selecciona una ciudad.";
  else if (Array.isArray(allowedCityLabels) && allowedCityLabels.length > 0 && !allowedCityLabels.includes(city)) {
    errors.city = "Selecciona una ciudad válida de la lista.";
  } else if (city.length > 120) errors.city = "Máximo 120 caracteres.";

  if (!values.propertyType) errors.propertyType = "Selecciona el tipo de inmueble.";

  const area = parsePositiveNumber(values.availableAreaM2);
  if (!area.ok) errors.availableAreaM2 = area.message;
  else if (area.value > 50_000) {
    errors.availableAreaM2 = "El área parece fuera de rango (máx. 50.000 m²).";
  }

  if (!values.installationType) errors.installationType = "Selecciona el tipo de instalación.";

  return errors;
}

export function validateQuotationStep2(values) {
  const errors = {};

  const name = String(values.name || "").trim();
  if (!name) errors.name = "El nombre es obligatorio.";
  else if (name.length > 150) errors.name = "Máximo 150 caracteres.";

  const email = String(values.email || "").trim();
  if (!email) errors.email = "El correo es obligatorio.";
  else if (!EMAIL_RE.test(email)) errors.email = "El correo no es válido.";
  else if (email.length > 150) errors.email = "Máximo 150 caracteres.";

  const phone = String(values.phone || "").trim();
  if (!phone) errors.phone = "El teléfono es obligatorio.";
  else if (phone.length < 5 || phone.length > 50) {
    errors.phone = "El teléfono debe tener entre 5 y 50 caracteres.";
  }

  return errors;
}
