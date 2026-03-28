import React, { useEffect, useMemo, useRef, useState } from "react";
import { apiBaseUrl, apiRequest } from "../utils/api";
import { getAccessToken } from "../utils/auth";

function toWsBaseUrl(httpBaseUrl) {
  if (httpBaseUrl.startsWith("https://")) {
    return `wss://${httpBaseUrl.slice("https://".length)}`;
  }

  if (httpBaseUrl.startsWith("http://")) {
    return `ws://${httpBaseUrl.slice("http://".length)}`;
  }

  return httpBaseUrl;
}

function formatDateTime(value) {
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

export default function CompanyChatInbox() {
  const [conversations, setConversations] = useState([]);
  const [selectedKey, setSelectedKey] = useState("");
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [input, setInput] = useState("");
  const wsRef = useRef(null);
  const bottomRef = useRef(null);

  const wsUrl = useMemo(() => {
    const base = toWsBaseUrl(apiBaseUrl);
    return `${base}/contact-chats/ws`;
  }, []);

  const selectedConversation = useMemo(
    () => conversations.find((item) => getConversationKey(item) === selectedKey) || null,
    [conversations, selectedKey]
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const token = getAccessToken();

    if (!token) {
      setStatus("unauthenticated");
      return undefined;
    }

    let active = true;

    async function loadInbox() {
      try {
        setStatus("loading");
        const response = await apiRequest("/contact-chats/inbox", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!active) {
          return;
        }

        const inboxItems = response?.data || [];
        setConversations(inboxItems);

        if (inboxItems.length > 0) {
          setSelectedKey(getConversationKey(inboxItems[0]));
        }

        setStatus("ready");
      } catch (requestError) {
        if (active) {
          setStatus("error");
          setError(requestError.message || "No se pudo cargar la bandeja de chats.");
        }
      }
    }

    loadInbox();
    setStatus("connecting");

    const ws = new WebSocket(`${wsUrl}?token=${encodeURIComponent(token)}`);
    wsRef.current = ws;

    ws.onopen = () => {
      if (active) {
        setStatus("ready");
      }
    };

    ws.onmessage = (event) => {
      if (!active) {
        return;
      }

      try {
        const payload = JSON.parse(event.data);

        if (payload.type === "error") {
          setError(payload.message || "Error en WebSocket");
          return;
        }

        if (payload.type !== "message") {
          return;
        }

        const incomingKey = `${payload.serviceId}:${payload.companyId}:${payload.conversationUserId}`;

        setConversations((current) => {
          const updated = current.map((conversation) => {
            const key = getConversationKey(conversation);

            if (key !== incomingKey) {
              return conversation;
            }

            return {
              ...conversation,
              lastMessage: payload.content,
              lastMessageAt: payload.createdAt,
              lastSenderRole: payload.senderRole,
            };
          });

          return updated.sort(
            (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
          );
        });

        if (incomingKey === selectedKey) {
          setMessages((current) => {
            if (current.some((message) => message.id === payload.id)) {
              return current;
            }

            return [...current, payload];
          });
        }
      } catch {
        setError("Se recibió un mensaje inválido desde el servidor.");
      }
    };

    ws.onclose = () => {
      if (active) {
        setStatus("disconnected");
      }
    };

    ws.onerror = () => {
      if (active) {
        setError("Se perdió la conexión en tiempo real.");
      }
    };

    return () => {
      active = false;
      ws.close();
      wsRef.current = null;
    };
  }, [wsUrl]);

  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }

    const token = getAccessToken();

    if (!token) {
      return;
    }

    let active = true;

    async function loadConversationMessages() {
      try {
        const response = await apiRequest(
          `/contact-chats/messages?serviceId=${selectedConversation.serviceId}&companyId=${selectedConversation.companyId}&conversationUserId=${selectedConversation.conversationUserId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (active) {
          setMessages(response?.data || []);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.message || "No se pudieron cargar los mensajes.");
        }
      }
    }

    loadConversationMessages();

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "join",
          serviceId: selectedConversation.serviceId,
          companyId: selectedConversation.companyId,
          conversationUserId: selectedConversation.conversationUserId,
        })
      );
    }

    return () => {
      active = false;
    };
  }, [selectedConversation]);

  const canSend =
    Boolean(selectedConversation) &&
    input.trim().length > 0 &&
    input.trim().length <= 1000 &&
    wsRef.current?.readyState === WebSocket.OPEN;

  const sendMessage = () => {
    if (!canSend || !selectedConversation || !wsRef.current) {
      return;
    }

    wsRef.current.send(
      JSON.stringify({
        type: "message",
        serviceId: selectedConversation.serviceId,
        companyId: selectedConversation.companyId,
        conversationUserId: selectedConversation.conversationUserId,
        content: input.trim(),
      })
    );

    setInput("");
  };

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <section className="bg-white shadow rounded-xl border border-gray-100 p-6 mt-10">
      <h3 className="text-lg font-semibold text-[#07a68a] mb-2">Bandeja de chats</h3>
      <p className="text-sm text-gray-600 mb-4">
        Conversaciones activas con clientes interesad@s en tus servicios.
      </p>

      {status === "loading" && (
        <p className="text-sm text-gray-500">Cargando conversaciones...</p>
      )}

      {conversations.length === 0 && status !== "loading" && (
        <p className="text-sm text-gray-500">
          Aún no tienes conversaciones activas en la bandeja.
        </p>
      )}

      {conversations.length > 0 && (
        <div className="grid md:grid-cols-[320px_1fr] gap-4">
          <aside className="border border-gray-200 rounded-lg overflow-hidden">
            <ul className="max-h-96 overflow-y-auto divide-y divide-gray-100">
              {conversations.map((conversation) => {
                const key = getConversationKey(conversation);
                const selected = key === selectedKey;

                return (
                  <li key={key}>
                    <button
                      onClick={() => setSelectedKey(key)}
                      className={`w-full text-left px-4 py-3 transition ${
                        selected ? "bg-[#07a68a]/10" : "hover:bg-gray-50"
                      }`}
                    >
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {conversation.customerName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {conversation.companyName} · {conversation.serviceTitle}
                      </p>
                      <p className="text-xs text-gray-600 mt-1 truncate">
                        {conversation.lastMessage}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        {formatDateTime(conversation.lastMessageAt)}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          <div className="border border-gray-200 rounded-lg overflow-hidden flex flex-col min-h-[420px]">
            {selectedConversation ? (
              <>
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                  <p className="text-sm font-semibold text-gray-800">
                    {selectedConversation.customerName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedConversation.customerEmail}
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
                        {formatDateTime(message.createdAt)}
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
                      placeholder="Responder mensaje..."
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
                      disabled={!canSend}
                      className="px-4 py-2 rounded-lg bg-[#07a68a] text-white text-sm font-medium hover:brightness-110 disabled:opacity-60"
                    >
                      Enviar
                    </button>
                  </div>
                  {error && <p className="mt-2 text-xs text-amber-700">{error}</p>}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-sm text-gray-500">
                Selecciona una conversación para responder.
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function getConversationKey(conversation) {
  return `${conversation.serviceId}:${conversation.companyId}:${conversation.conversationUserId}`;
}
