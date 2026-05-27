export function isRequestFinished(status) {
  const s = String(status || "").toLowerCase();
  return s === "finished" || s === "finalizada";
}

export function getRequestCompanyServiceId(request) {
  if (!request) return null;

  const candidates = [
    request.companyServiceId,
    request.company_service_id,
    request.companyService?.id,
    request.companyService?.companyServiceId,
    request.company_service?.id,
    request.offerId,
    request.offer?.id,
  ];

  for (const value of candidates) {
    if (value != null && value !== "") {
      const n = Number(value);
      if (Number.isFinite(n) && n > 0) return n;
    }
  }

  return null;
}

export function getRequestServiceId(request) {
  if (!request) return null;
  const id = request.service?.id ?? request.serviceId ?? request.service_id;
  const n = Number(id);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function getRequestCompanyId(request) {
  if (!request) return null;
  const id =
    request.company?.id ??
    request.companyId ??
    request.company_id ??
    request.companyService?.companyId ??
    request.companyService?.company?.id;
  const n = Number(id);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function matchOfferToRequest(offers, request) {
  if (!offers?.length || !request) return null;

  const directId = getRequestCompanyServiceId(request);
  if (directId) {
    const byId = offers.find((o) => Number(o.id) === directId);
    if (byId) return Number(byId.id);
  }

  const companyId = getRequestCompanyId(request);
  if (companyId != null) {
    const byCompany = offers.find(
      (o) =>
        Number(o.companyId) === companyId ||
        Number(o.company?.id) === companyId
    );
    if (byCompany) return Number(byCompany.id);
  }

  if (offers.length === 1) {
    return Number(offers[0].id);
  }

  return null;
}

/** Una calificación por solicitud: puede calificar si está finalizada y aún no hay reseña. */
export function canRateRequest(request, existingRating) {
  if (!request?.id) return false;
  if (!isRequestFinished(request.status)) return false;
  return !existingRating;
}

export function getRatingForRequest(ratings, serviceRequestId) {
  const id = Number(serviceRequestId);
  return (ratings || []).find(
    (r) => Number(r.serviceRequestId ?? r.service_request_id) === id
  );
}
