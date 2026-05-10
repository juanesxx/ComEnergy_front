import { apiRequest } from "../utils/api";

export async function fetchPhotovoltaicCities() {
  const raw = await apiRequest("/photovoltaic-quotes/cities", { method: "GET" });
  const list = raw && typeof raw === "object" && Array.isArray(raw.data) ? raw.data : [];

  return list
    .map((row) => ({
      cityKey: String(row.cityKey ?? row.city_key ?? "").trim(),
      label: String(row.label ?? row.city_key ?? "").trim(),
    }))
    .filter((row) => row.cityKey && row.label);
}


export async function requestSolarQuotationEstimate(input) {
  const body = {
    monthlyConsumptionKwh: Number(input.monthlyConsumptionKwh),
    averageBillCop: Number(input.averageBillCop),
    city: String(input.city || "").trim(),
    propertyType: input.propertyType,
    availableAreaM2: Number(input.availableAreaM2),
    installationType: input.installationType,
    name: String(input.name || "").trim(),
    email: String(input.email || "").trim(),
    phone: String(input.phone || "").trim(),
  };

  const raw = await apiRequest("/photovoltaic-quotes", {
    method: "POST",
    body: JSON.stringify(body),
  });

  return normalizePhotovoltaicQuoteResponse(raw);
}

export function normalizePhotovoltaicQuoteResponse(raw) {
  const payload =
    raw && typeof raw === "object" && "data" in raw && raw.data && typeof raw.data === "object"
      ? raw.data
      : raw && typeof raw === "object"
        ? raw
        : {};

  const n = (value) => {
    const x = Number(value);
    return Number.isFinite(x) ? x : null;
  };

  return {
    id: n(payload.id),
    designKwp: n(payload.designKwp),
    estimatedMonthlyGenerationKwh: n(payload.estimatedMonthlyGenerationKwh),
    approximatePanelCount: n(payload.approximatePanelCount),
    requiredAreaM2: n(payload.requiredAreaM2),
    estimatedMonthlySavingsCop: n(payload.estimatedMonthlySavingsCop),
    estimatedProjectValueCop: n(payload.estimatedProjectValueCop),
    peakSunHours: n(payload.peakSunHours),
    performanceRatio: n(payload.performanceRatio),
    averageDailyConsumptionKwh: n(payload.averageDailyConsumptionKwh),
    energyRequiredKwhPerDay: n(payload.energyRequiredKwhPerDay),
    kwpFromDemand: n(payload.kwpFromDemand),
    kwpFromAvailableArea: n(payload.kwpFromAvailableArea),
    impliedEnergyPriceCopPerKwh: n(payload.impliedEnergyPriceCopPerKwh),
  };
}
