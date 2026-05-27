import React, { useCallback, useEffect, useState } from "react";
import { useCompany } from "../context/CompanyContext";
import { getCompanyOffers, getOfferRatings } from "../services/ratingsApi";
import StarDisplay from "./StarDisplay";

function formatReviewDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatAverage(value) {
  if (value == null || Number.isNaN(Number(value))) return null;
  return Number(value);
}

export default function CompanyRatingsBreakdown() {
  const { activeCompany, activeCompanyId } = useCompany();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const loadBreakdown = useCallback(async () => {
    if (!activeCompanyId) {
      setRows([]);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const offers = await getCompanyOffers(activeCompanyId);

      const breakdown = await Promise.all(
        offers.map(async (offer) => {
          const companyServiceId = offer.id;
          let ratings = [];
          try {
            ratings = await getOfferRatings(companyServiceId);
          } catch {
            ratings = [];
          }

          const avg = formatAverage(offer.averageRating);
          const computedAvg =
            ratings.length > 0
              ? ratings.reduce((sum, r) => sum + Number(r.rating), 0) / ratings.length
              : null;

          return {
            companyServiceId,
            serviceTitle: offer.serviceTitle || offer.title || `Oferta #${companyServiceId}`,
            serviceId: offer.serviceId,
            price: offer.price,
            averageRating: avg ?? computedAvg,
            ratings,
            reviewCount: ratings.length,
          };
        })
      );

      breakdown.sort((a, b) => b.reviewCount - a.reviewCount);
      setRows(breakdown);
    } catch (err) {
      setError(err.message || "No se pudieron cargar las calificaciones de la empresa.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [activeCompanyId]);

  useEffect(() => {
    setExpandedId(null);
    loadBreakdown();
  }, [loadBreakdown]);

  if (!activeCompanyId) {
    return null;
  }

  const totalReviews = rows.reduce((sum, row) => sum + row.reviewCount, 0);
  const offersWithReviews = rows.filter((row) => row.reviewCount > 0).length;

  return (
    <section className="bg-white shadow rounded-xl border border-gray-100 p-6 mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-[#07a68a]">
            Calificaciones recibidas — {activeCompany?.name}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Desglose por cada oferta (companyServiceId) que ofrece tu empresa.
          </p>
        </div>
        {!loading && rows.length > 0 && (
          <div className="text-xs text-gray-500 sm:text-right">
            <p>
              <span className="font-medium text-gray-700">{offersWithReviews}</span> ofertas con
              reseñas
            </p>
            <p>
              <span className="font-medium text-gray-700">{totalReviews}</span> reseñas en total
            </p>
          </div>
        )}
      </div>

      {loading && <p className="text-sm text-gray-500">Cargando desglose...</p>}
      {error && <p className="text-sm text-amber-700">{error}</p>}

      {!loading && !error && rows.length === 0 && (
        <p className="text-sm text-gray-500">
          Tu empresa aún no tiene servicios ofrecidos en el catálogo, o no hay ofertas registradas.
        </p>
      )}

      {!loading && rows.length > 0 && (
        <ul className="space-y-3">
          {rows.map((row) => {
            const isOpen = expandedId === row.companyServiceId;
            const avg = row.averageRating;

            return (
              <li
                key={row.companyServiceId}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpandedId(isOpen ? null : row.companyServiceId)
                  }
                  className="w-full px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-left bg-gray-50 hover:bg-gray-100 transition"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {row.serviceTitle}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Oferta #{row.companyServiceId}
                      {row.serviceId != null && ` · Servicio catálogo #${row.serviceId}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {avg != null ? (
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <StarDisplay value={avg} />
                        <span className="font-medium">{avg.toFixed(1)}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Sin promedio</span>
                    )}
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#07a68a]/10 text-[#07a68a]">
                      {row.reviewCount} reseña{row.reviewCount === 1 ? "" : "s"}
                    </span>
                    <span className="text-gray-400 text-sm">{isOpen ? "▲" : "▼"}</span>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 py-3 bg-white border-t border-gray-100">
                    {row.reviewCount === 0 ? (
                      <p className="text-xs text-gray-500">
                        Aún no hay reseñas para esta oferta.
                      </p>
                    ) : (
                      <ul className="space-y-2 max-h-48 overflow-y-auto">
                        {row.ratings.map((review) => (
                          <li
                            key={review.id}
                            className="text-xs border border-gray-100 rounded-lg px-3 py-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium text-gray-800">
                                {review.user?.name || "Cliente"}
                              </span>
                              <StarDisplay value={review.rating} />
                            </div>
                            {review.comment && (
                              <p className="text-gray-600 mt-1">{review.comment}</p>
                            )}
                            <p className="text-gray-400 mt-1">
                              {formatReviewDate(review.createdAt)}
                              {review.serviceRequestId != null &&
                                ` · Solicitud #${review.serviceRequestId}`}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
