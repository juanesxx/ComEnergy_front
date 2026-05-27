import { apiRequest } from "../utils/api";
import {
  getRequestCompanyServiceId,
  getRequestServiceId,
  matchOfferToRequest,
} from "../utils/ratingHelpers";

const publicFetch = { skipAuth: true, skipCompanyHeader: true };

/** Promedio público del catálogo (solo lectura en UI). */
export async function getCompanyServicesByServiceId(serviceId) {
  const response = await apiRequest(
    `/company-services?serviceId=${serviceId}`,
    publicFetch
  );
  return response?.data || [];
}

/** Ofertas de la empresa activa (auth + X-Company-Id). */
export async function getCompanyOffers(companyId) {
  const query = companyId ? `?companyId=${companyId}` : "";
  const response = await apiRequest(`/company-services${query}`);
  const list = response?.data || [];
  if (!companyId) return list;
  return list.filter(
    (o) =>
      Number(o.companyId) === Number(companyId) ||
      Number(o.company?.id) === Number(companyId)
  );
}

/** Reseñas públicas de una oferta (companyServiceId). */
export async function getOfferRatings(companyServiceId) {
  const response = await apiRequest(
    `/company-services/${companyServiceId}/ratings`,
    publicFetch
  );
  return response?.data || [];
}

export async function resolveCompanyServiceIdForRequest(request) {
  const direct = getRequestCompanyServiceId(request);
  if (direct) return direct;

  const serviceId = getRequestServiceId(request);
  if (!serviceId) return null;

  const offers = await getCompanyServicesByServiceId(serviceId);
  return matchOfferToRequest(offers, request);
}

export async function getRequestRatings(serviceRequestId) {
  const response = await apiRequest(
    `/service-requests/${serviceRequestId}/ratings`
  );
  const data = response?.data;
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") return [data];
  return [];
}

export async function createRequestRating(serviceRequestId, { rating, comment }) {
  const body = { rating: Number(rating) };
  const trimmed = comment?.trim();
  if (trimmed) body.comment = trimmed;

  const response = await apiRequest(
    `/service-requests/${serviceRequestId}/ratings`,
    {
      method: "POST",
      body: JSON.stringify(body),
    }
  );
  return response?.data ?? response;
}
