import React, { useEffect, useMemo, useRef, useState } from "react";
import { apiBaseUrl, apiRequest } from "../utils/api";
import { useAuth } from "../context/AuthContext";

function toWsBaseUrl(httpBaseUrl) {
  if (httpBaseUrl.startsWith("https://")) {
    return `wss://${httpBaseUrl.slice("https://".length)}`;
  }

  if (httpBaseUrl.startsWith("http://")) {
    return `ws://${httpBaseUrl.slice("http://".length)}`;
  }

  return httpBaseUrl;
}

function formatTime(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ContactChatPanel({ serviceId, companyId, companyName }) {
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const wsRef = useRef(null);
  const bottomRef = useRef(null);

  const wsUrl = useMemo(() => {
    const base = toWsBaseUrl(apiBaseUrl);
    return `${base}/contact-chats/ws`;
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setMessages([]);
    setInput("");
    setError("");

    if (!serviceId || !companyId) {
      setStatus("unavailable");
      return undefined;
    }

    if (!token) {
      setStatus("unauthenticated");
      return undefined;
    }

    let isActive = true;

    async function loadHistory() {
      try {
        const response = await apiRequest(
          `/contact-chats/messages?serviceId=${serviceId}&companyId=${companyId}`
        );

        if (isActive) {
          setMessages(response?.data || []);
        }
      } catch (requestError) {
        if (isActive) {
          setError(requestError.message || "No se pudo cargar el historial del chat.");
        }
      }
    }

    loadHistory();
    setStatus("connecting");

    const ws = new WebSocket(`${wsUrl}?token=${encodeURIComponent(token)}`);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!isActive) {
        return;
      }

      setStatus("connected");
      ws.send(
        JSON.stringify({
          type: "join",
          serviceId,
          companyId,
        })
      );
    };

    ws.onmessage = (event) => {
      if (!isActive) {
        return;
      }

      try {
        const payload = JSON.parse(event.data);

        if (payload.type === "error") {
          setError(payload.message || "Error en el chat en tiempo real.");
          return;
        }

        if (payload.type !== "message") {
          return;
        }

        if (payload.serviceId !== serviceId || payload.companyId !== companyId) {
          return;
        }

        setMessages((current) => {
          if (current.some((message) => message.id === payload.id)) {
            return current;
          }

          return [...current, payload];
        });
      } catch {
        setError("Se recibió un mensaje con formato inválido.");
      }
    };

    ws.onclose = () => {
      if (isActive) {
        setStatus("disconnected");
      }
    };

    ws.onerror = () => {
      if (isActive) {
        setError("No se pudo mantener la conexión en tiempo real.");
      }
    };

    return () => {
      isActive = false;
      ws.close();
      wsRef.current = null;
    };
  }, [serviceId, companyId, wsUrl]);

  const canSend =
    status === "connected" && input.trim().length > 0 && input.trim().length <= 1000;

  const sendMessage = () => {
    if (!canSend || !wsRef.current) {
      return;
    }

    setSending(true);

    wsRef.current.send(
      JSON.stringify({
        type: "message",
        serviceId,
        companyId,
        content: input.trim(),
      })
    );

    setInput("");
    setSending(false);
  };

  if (status === "unavailable") {
    return (
      <div className="mt-6 rounded-xl border border-gray-200 p-4 text-sm text-gray-600">
        Este servicio no tiene una empresa asociada para chat.
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
        Inicia sesión para contactar a {companyName || "la empresa"} por chat en tiempo real.
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between bg-gray-50 px-4 py-3 border-b border-gray-200">
        <p className="text-sm font-semibold text-gray-700">
          Chat con {companyName || "empresa"}
        </p>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            status === "connected"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          {status === "connected" ? "En línea" : "Reconectando"}
        </span>
      </div>

      <div className="h-56 overflow-y-auto bg-white p-3 space-y-2">
        {messages.length === 0 && (
          <p className="text-xs text-gray-500">
            No hay mensajes todavía. Escribe el primero para iniciar la conversación.
          </p>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
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
              {formatTime(message.createdAt)}
            </p>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      <div className="border-t border-gray-200 bg-gray-50 p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Escribe tu mensaje..."
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
            disabled={!canSend || sending}
            className="px-4 py-2 rounded-lg bg-[#07a68a] text-white text-sm font-medium hover:brightness-110 disabled:opacity-60"
          >
            Enviar
          </button>
        </div>
        {error && <p className="mt-2 text-xs text-amber-700">{error}</p>}
      </div>
    </div>
  );
}
