import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  canRateRequest,
  getRatingForRequest,
  isRequestFinished,
} from "../utils/ratingHelpers";
import {
  createRequestRating,
  getCompanyServicesByServiceId,
  getRequestRatings,
  resolveCompanyServiceIdForRequest,
} from "../services/ratingsApi";
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

export default function RequestRatingSection({ request, allowRate = false }) {
  const { isAuthenticated } = useAuth();
  const serviceRequestId = request?.id;

  const [requestRating, setRequestRating] = useState(null);
  const [averageRating, setAverageRating] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [draftRating, setDraftRating] = useState(0);
  const [draftComment, setDraftComment] = useState("");

  const loadData = useCallback(async () => {
    if (!serviceRequestId) return;

    try {
      setLoading(true);
      setError("");

      const list = await getRequestRatings(serviceRequestId);
      const forThisRequest =
        getRatingForRequest(list, serviceRequestId) ?? list[0] ?? null;
      setRequestRating(forThisRequest);

      const companyServiceId = await resolveCompanyServiceIdForRequest(request);
      const serviceId = request?.service?.id ?? request?.serviceId;
      if (companyServiceId && serviceId) {
        const offers = await getCompanyServicesByServiceId(serviceId);
        const offer = offers.find((o) => Number(o.id) === Number(companyServiceId));
        const avg = offer?.averageRating;
        setAverageRating(
          avg != null && !Number.isNaN(Number(avg)) ? Number(avg) : null
        );
      } else {
        setAverageRating(null);
      }
    } catch (err) {
      if (err.status === 404) {
        setRequestRating(null);
      } else {
        setError(err.message || "No se pudo cargar la calificación.");
      }
    } finally {
      setLoading(false);
    }
  }, [serviceRequestId, request]);

  useEffect(() => {
    setRequestRating(null);
    setAverageRating(null);
    setDraftRating(0);
    setDraftComment("");
    setFeedback("");
    setError("");
    loadData();
  }, [loadData]);

  const showForm =
    allowRate &&
    isAuthenticated &&
    serviceRequestId &&
    isRequestFinished(request?.status) &&
    canRateRequest(request, requestRating);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!serviceRequestId) return;

    if (draftRating < 1 || draftRating > 5) {
      setError("Elige una calificación entre 1 y 5 estrellas.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setFeedback("");

      const created = await createRequestRating(serviceRequestId, {
        rating: draftRating,
        comment: draftComment,
      });

      setRequestRating(created);
      setFeedback("Calificación enviada correctamente.");
      setDraftRating(0);
      setDraftComment("");
      await loadData();
    } catch (err) {
      if (err.status === 403) {
        setError("Solo puedes calificar una solicitud finalizada.");
      } else if (err.status === 409) {
        setError("Esta solicitud ya tiene una calificación.");
        await loadData();
      } else if (err.status === 404) {
        setError("Solicitud no encontrada.");
      } else if (err.status === 422) {
        setError("La calificación debe ser un número entero del 1 al 5.");
      } else {
        setError(err.message || "No se pudo enviar la calificación.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!serviceRequestId) {
    return null;
  }

  if (!isRequestFinished(request?.status)) {
    return (
      <div className="px-4 py-2 border-b border-gray-200 bg-amber-50/60 text-xs text-gray-600">
        Cuando la solicitud esté <strong>finalizada</strong>, podrás calificar el servicio aquí.
      </div>
    );
  }

  return (
    <div className="px-4 py-3 border-b border-gray-200 bg-slate-50 shrink-0">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <h4 className="text-sm font-semibold text-gray-800">
          Calificación — solicitud #{serviceRequestId}
        </h4>
        {averageRating != null && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Promedio del servicio:</span>
            <StarDisplay value={averageRating} />
            <span>{averageRating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {loading && <p className="text-xs text-gray-500">Cargando...</p>}

      {!loading && requestRating && (
        <div className="text-xs bg-white rounded-lg border border-gray-100 px-2 py-1.5 mb-2">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-gray-800">
              {requestRating.user?.name || "Tu calificación"}
            </span>
            <StarDisplay value={requestRating.rating} />
          </div>
          {requestRating.comment && (
            <p className="text-gray-600 mt-1">{requestRating.comment}</p>
          )}
          <p className="text-gray-400 mt-0.5">{formatReviewDate(requestRating.createdAt)}</p>
        </div>
      )}

      {requestRating && !showForm && (
        <p className="text-xs text-emerald-700">Esta solicitud ya fue calificada.</p>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-2 pt-2 border-t border-gray-200 space-y-2">
          <p className="text-xs text-gray-600">Califica tu experiencia con esta solicitud:</p>
          <StarDisplay value={draftRating} size="lg" interactive onChange={setDraftRating} />
          <textarea
            value={draftComment}
            onChange={(e) => setDraftComment(e.target.value)}
            placeholder="Comentario opcional (máx. 500 caracteres)"
            maxLength={500}
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs outline-none focus:border-[#07a68a]"
          />
          <button
            type="submit"
            disabled={submitting || draftRating < 1}
            className="px-3 py-1.5 rounded-lg bg-[#07a68a] text-white text-xs font-medium disabled:opacity-60"
          >
            {submitting ? "Enviando..." : "Enviar calificación"}
          </button>
        </form>
      )}

      {feedback && <p className="text-xs text-emerald-700 mt-2">{feedback}</p>}
      {error && <p className="text-xs text-amber-700 mt-2">{error}</p>}
    </div>
  );
}
