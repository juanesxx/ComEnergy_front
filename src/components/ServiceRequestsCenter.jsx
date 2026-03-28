import React, { useEffect, useMemo, useRef, useState } from "react";
import { apiBaseUrl, apiRequest } from "../utils/api";
import { getAccessToken, getCurrent, logoutUser } from "../utils/auth";

const STATUS_LABELS = {
  pending: "Pendiente",
  en_progreso: "En progreso",
  finalizada: "Finalizada",
  cancelada: "Cancelada",
  rechazada: "Rechazada",
};

const ALLOWED_TRANSITIONS = {
  pending: ["en_progreso", "rechazada", "cancelada"],
  en_progreso: ["finalizada", "cancelada"],
  finalizada: [],
  cancelada: [],
  rechazada: [],
};

function toWsBaseUrl(httpBaseUrl) {
  if (httpBaseUrl.startsWith("https://")) {
    return `wss://${httpBaseUrl.slice("https://".length)}`;
  }

  if (httpBaseUrl.startsWith("http://")) {
    return `ws://${httpBaseUrl.slice("http://".length)}`;
  }

  return httpBaseUrl;
}

function formatDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusClass(status) {
  if (status === "finalizada") return "bg-emerald-100 text-emerald-700";
  if (status === "en_progreso") return "bg-blue-100 text-blue-700";
  if (status === "rechazada") return "bg-red-100 text-red-700";
  if (status === "cancelada") return "bg-gray-200 text-gray-700";
  return "bg-amber-100 text-amber-700";
}

function getRequestViewOptions(roles) {
  const options = [{ key: "customer", label: "Mis solicitudes", endpoint: "/service-requests/mine" }];

  if (roles.includes("seller")) {
    options.push({
      key: "seller",
      label: "Solicitudes de empresa",
      endpoint: "/service-requests/company",
    });
  }

  if (roles.includes("admin")) {
    options.push({
      key: "admin",
      label: "Panel admin",
      endpoint: "/service-requests/admin",
    });
  }

  return options;
}

export default function ServiceRequestsCenter() {
  const user = getCurrent();
  const token = getAccessToken();
  const roles = user?.roles || [];
  const viewOptions = useMemo(() => getRequestViewOptions(roles), [roles.join(",")]);

  const [activeView, setActiveView] = useState(viewOptions[0]?.key || "customer");
  const [requests, setRequests] = useState([]);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [wsConnectionFailed, setWsConnectionFailed] = useState(false);
  const wsRef = useRef(null);
  const messagesBottomRef = useRef(null);

  const wsUrl = useMemo(() => `${toWsBaseUrl(apiBaseUrl)}/service-requests/ws`, []);

  const selectedRequest = useMemo(
    () => requests.find((requestItem) => requestItem.id === selectedRequestId) || null,
    [requests, selectedRequestId]
  );

  const activeViewConfig = useMemo(
    () => viewOptions.find((option) => option.key === activeView),
    [viewOptions, activeView]
  );
  const activeViewEndpoint = activeViewConfig?.endpoint || null;

  useEffect(() => {
    messagesBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!token || !activeViewEndpoint) {
      return;
    }

    let isMounted = true;

    async function loadRequests() {
      try {
        setStatus("loading");
        setError("");
        const response = await apiRequest(activeViewEndpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!isMounted) {
          return;
        }

        const list = response?.data || [];
        setRequests(list);

        if (!selectedRequestId && list.length > 0) {
          setSelectedRequestId(list[0].id);
        }

        if (selectedRequestId && !list.some((requestItem) => requestItem.id === selectedRequestId)) {
          setSelectedRequestId(list[0]?.id || null);
        }

        setStatus("ready");
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message || "No se pudieron cargar las solicitudes. Intenta recargar la página.");
          setStatus("error");
        }
      }
    }

    loadRequests();

    return () => {
      isMounted = false;
    };
  }, [activeViewEndpoint, token]);

  // Conexión WebSocket - una sola vez al montar
  useEffect(() => {
    if (!token) {
      return;
    }

    let componentStillMounted = true;
    const ws = new WebSocket(`${wsUrl}?token=${encodeURIComponent(token)}`);
    wsRef.current = ws;

    const handleOpen = () => {
      if (componentStillMounted && selectedRequestId) {
        ws.send(
          JSON.stringify({
            type: "join_request",
            requestId: selectedRequestId,
          })
        );
      }
    };

    const handleMessage = (event) => {
      if (!componentStillMounted) return;

      try {
        const payload = JSON.parse(event.data);

        if (payload.type === "request_message") {
          if (payload.requestId === selectedRequestId) {
            setMessages((current) => {
              if (current.some((message) => message.id === payload.id)) {
                return current;
              }
              return [...current, payload];
            });
          }
          return;
        }

        if (
          payload.type === "request_created" ||
          payload.type === "request_status_changed" ||
          payload.type === "request_new_message"
        ) {
          if (!activeViewEndpoint) return;

          apiRequest(activeViewEndpoint, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
            .then((response) => {
              if (componentStillMounted) {
                setRequests(response?.data || []);
              }
            })
            .catch(() => {});
        }
      } catch {
        if (componentStillMounted) {
          setError("Error al procesar evento en tiempo real.");
        }
      }
    };

    const handleError = () => {
      if (componentStillMounted) {
        setError("No se pudo conectar a tiempo real. Verifica tu conexión.");
        setWsConnectionFailed(true);
        ws.close(1000, "Error - Sin reintentos automáticos");
      }
    };

    const handleClose = (event) => {
      if (!componentStillMounted) return;
      wsRef.current = null;
      // Token expirado o inválido - cerrar sesión y redirigir al login
      if (event.code === 4001) {
        logoutUser().finally(() => {
          window.location.href = "/";
        });
      }
    };

    ws.addEventListener("open", handleOpen);
    ws.addEventListener("message", handleMessage);
    ws.addEventListener("error", handleError);
    ws.addEventListener("close", handleClose);

    return () => {
      componentStillMounted = false;
      ws.removeEventListener("open", handleOpen);
      ws.removeEventListener("message", handleMessage);
      ws.removeEventListener("error", handleError);
      ws.removeEventListener("close", handleClose);
      
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
      wsRef.current = null;
    };
  }, [token, activeViewEndpoint]);

  // Enviar join_request cuando selectedRequestId cambia
  useEffect(() => {
    if (!selectedRequestId || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    wsRef.current.send(
      JSON.stringify({
        type: "join_request",
        requestId: selectedRequestId,
      })
    );
  }, [selectedRequestId]);

  // Cargar mensajes cuando se selecciona una solicitud
  useEffect(() => {
    if (!selectedRequest || !token) {
      setMessages([]);
      return;
    }

    const requestId = selectedRequest.id;
    let isMounted = true;

    async function loadMessages() {
      try {
        const response = await apiRequest(`/service-requests/${requestId}/messages`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (isMounted) {
          setMessages(response?.data || []);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message || "No se pudieron cargar los mensajes. Recarga la página.");
        }
      }
    }

    loadMessages();

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "join_request",
          requestId,
        })
      );
    }

    return () => {
      isMounted = false;
    };
  }, [selectedRequest, token]);

  const sendMessage = () => {
    if (!wsRef.current || !selectedRequest) {
      return;
    }

    const content = messageInput.trim();

    if (!content) {
      return;
    }

    wsRef.current.send(
      JSON.stringify({
        type: "request_message",
        requestId: selectedRequest.id,
        content,
      })
    );

    setMessageInput("");
  };

  const updateStatus = async (requestId, nextStatus) => {
    if (!token || !nextStatus) {
      return;
    }

    try {
      await apiRequest(`/service-requests/${requestId}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: nextStatus,
        }),
      });

      if (!activeViewEndpoint) {
        return;
      }

      const response = await apiRequest(activeViewEndpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRequests(response?.data || []);
    } catch (updateError) {
      setError(updateError.message || "No se pudo actualizar el estado.");
    }
  };

  const getAvailableStatusChanges = (requestItem) => {
    const transitions = ALLOWED_TRANSITIONS[requestItem.status] || [];

    if (roles.includes("admin")) {
      return transitions;
    }

    if (activeView === "seller") {
      return transitions.filter((value) =>
        ["en_progreso", "finalizada", "rechazada"].includes(value)
      );
    }

    if (activeView === "customer") {
      return transitions.filter((value) => value === "cancelada");
    }

    return [];
  };

  if (!token) {
    return null;
  }

  return (
    <section className="bg-white shadow rounded-xl border border-gray-100 p-6 mt-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h3 className="text-lg font-semibold text-[#07a68a]">Gestión de solicitudes</h3>
        <div className="flex flex-wrap gap-2">
          {viewOptions.map((option) => (
            <button
              key={option.key}
              onClick={() => setActiveView(option.key)}
              className={`px-3 py-1.5 rounded text-sm border ${
                activeView === option.key
                  ? "border-[#07a68a] text-[#07a68a]"
                  : "border-gray-300 text-gray-600"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {status === "loading" && <p className="text-sm text-gray-500 mt-4">Cargando solicitudes...</p>}
      {error && (
        <div className="flex items-center justify-between gap-3 bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
          <p className="text-sm text-amber-700">{error}</p>
          {(wsConnectionFailed || status === "error") && (
            <button
              onClick={() => {
                setWsConnectionFailed(false);
                setError("");
                setStatus("idle");
              }}
              className="text-xs px-3 py-1 rounded border border-amber-300 text-amber-700 hover:bg-amber-100 whitespace-nowrap"
            >
              Reintentar
            </button>
          )}
        </div>
      )}

      {requests.length > 0 && (
        <div className="grid lg:grid-cols-[360px_1fr] gap-4 mt-4">
          <aside className="border border-gray-200 rounded-lg overflow-hidden">
            <ul className="max-h-96 overflow-y-auto divide-y divide-gray-100">
              {requests.map((requestItem) => {
                const selected = requestItem.id === selectedRequestId;
                const availableStatuses = getAvailableStatusChanges(requestItem);

                return (
                  <li key={requestItem.id} className={selected ? "bg-[#07a68a]/10" : ""}>
                    <div className="px-4 py-3">
                      <button
                        onClick={() => setSelectedRequestId(requestItem.id)}
                        className="w-full text-left"
                      >
                        <p className="text-sm font-semibold text-gray-800">#{requestItem.id} · {requestItem.service?.title}</p>
                        <p className="text-xs text-gray-600">{requestItem.company?.name}</p>
                        {requestItem.user?.name && (
                          <p className="text-xs text-gray-500">Solicitante: {requestItem.user.name}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">Actualizado: {formatDate(requestItem.updatedAt)}</p>
                      </button>
                      <div className="mt-2 flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusClass(requestItem.status)}`}>
                          {STATUS_LABELS[requestItem.status] || requestItem.status}
                        </span>
                      </div>

                      {availableStatuses.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {availableStatuses.map((nextStatus) => (
                            <button
                              key={nextStatus}
                              className="text-[11px] px-2 py-1 border border-gray-300 rounded hover:border-[#07a68a] hover:text-[#07a68a]"
                              onClick={() => updateStatus(requestItem.id, nextStatus)}
                            >
                              {STATUS_LABELS[nextStatus] || nextStatus}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </aside>

          <div className="border border-gray-200 rounded-lg overflow-hidden flex flex-col min-h-[420px]">
            {selectedRequest ? (
              <>
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                  <p className="text-sm font-semibold text-gray-800">
                    Solicitud #{selectedRequest.id}
                  </p>
                  <p className="text-xs text-gray-600">
                    {selectedRequest.company?.name} · {selectedRequest.service?.title}
                  </p>
                </div>

                <div className="flex-1 p-3 overflow-y-auto bg-white space-y-2">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                        message.isMine
                          ? "ml-auto bg-[#07a68a] text-white"
                          : "mr-auto bg-gray-100 text-gray-800"
                      }`}
                    >
                      <p>{message.content}</p>
                      <p
                        className={`mt-1 text-[11px] ${
                          message.isMine ? "text-emerald-100" : "text-gray-500"
                        }`}
                      >
                        {formatDate(message.createdAt)}
                      </p>
                    </div>
                  ))}
                  <div ref={messagesBottomRef} />
                </div>

                <div className="border-t border-gray-200 bg-gray-50 p-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(event) => setMessageInput(event.target.value)}
                      placeholder="Escribe un mensaje de la solicitud..."
                      maxLength={1000}
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#07a68a]"
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          sendMessage();
                        }
                      }}
                    />
                    <button
                      onClick={sendMessage}
                      className="px-4 py-2 rounded-lg bg-[#07a68a] text-white text-sm font-medium hover:brightness-110"
                    >
                      Enviar
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-sm text-gray-500">
                Selecciona una solicitud para ver el chat.
              </div>
            )}
          </div>
        </div>
      )}

      {requests.length === 0 && status !== "loading" && (
        <p className="text-sm text-gray-500 mt-4">No hay solicitudes para mostrar.</p>
      )}
    </section>
  );
}
