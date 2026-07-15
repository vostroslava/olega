"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { ChatCircleDots } from "@phosphor-icons/react/dist/csr/ChatCircleDots";
import { PaperPlaneTilt } from "@phosphor-icons/react/dist/csr/PaperPlaneTilt";
import { Sparkle } from "@phosphor-icons/react/dist/csr/Sparkle";
import { X } from "@phosphor-icons/react/dist/csr/X";
import { readApiError, siteApiEndpoint } from "@/lib/site-api";

type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at?: string;
};

const sessionStorageKey = "steklostroygroup.ai-chat.session";
const suggestions = [
  "Как подготовиться к замеру?",
  "ПВХ или алюминий?",
  "Что нужно для расчёта?",
];

const wait = (duration: number) => new Promise((resolve) => window.setTimeout(resolve, duration));

export function SiteAiChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [workerOnline, setWorkerOnline] = useState(false);
  const [status, setStatus] = useState("AI-помощник по остеклению");
  const [error, setError] = useState("");
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const sessionTokenRef = useRef("");
  const pollRunRef = useRef(0);
  const chatEndpoint = siteApiEndpoint("chat");

  const loadMessages = useCallback(async (token: string) => {
    if (!chatEndpoint || !token) return null;
    const response = await fetch(`${chatEndpoint}?session=${encodeURIComponent(token)}`, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;
    const body = await response.json() as {
      workerOnline?: boolean;
      messages?: ChatMessage[];
    };
    setWorkerOnline(Boolean(body.workerOnline));
    if (body.messages) setMessages(body.messages);
    return body.messages ?? [];
  }, [chatEndpoint]);

  useEffect(() => {
    if (!chatEndpoint) {
      setStatus("Чат временно недоступен");
      return;
    }

    const token = window.sessionStorage.getItem(sessionStorageKey) ?? "";
    sessionTokenRef.current = token;
    if (token) void loadMessages(token);

    void fetch(siteApiEndpoint("health"), { headers: { Accept: "application/json" } })
      .then((response) => response.ok ? response.json() : null)
      .then((body: { workerOnline?: boolean } | null) => setWorkerOnline(Boolean(body?.workerOnline)))
      .catch(() => setWorkerOnline(false));
  }, [chatEndpoint, loadMessages]);

  useEffect(() => {
    if (!open) return;
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, sending]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open]);

  const pollForReply = async (token: string, userMessageId: string, runId: number) => {
    for (let attempt = 0; attempt < 60 && pollRunRef.current === runId; attempt += 1) {
      await wait(attempt < 4 ? 1200 : 2000);
      const currentMessages = await loadMessages(token);
      if (!currentMessages) continue;
      const userIndex = currentMessages.findIndex((message) => message.id === userMessageId);
      const hasReply = userIndex >= 0 && currentMessages.slice(userIndex + 1).some((message) => message.role === "assistant");
      if (hasReply) {
        setStatus("Ответ готов");
        setSending(false);
        return;
      }
    }

    if (pollRunRef.current === runId) {
      setStatus("Вопрос сохранён — ответ может занять больше времени");
      setSending(false);
    }
  };

  const sendMessage = async (value: string) => {
    const message = value.trim();
    if (!message || sending || !chatEndpoint) return;

    setInput("");
    setError("");
    setSending(true);
    setStatus(workerOnline ? "Анализируем вопрос…" : "Ставим вопрос в очередь…");
    const optimisticId = `local-${Date.now()}`;
    setMessages((current) => [...current, { id: optimisticId, role: "user", content: message }]);

    try {
      const response = await fetch(chatEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          message,
          sessionToken: sessionTokenRef.current,
          company: "",
          page: window.location.href,
          locale: navigator.language || "ru-BY",
        }),
      });
      if (!response.ok) throw new Error(await readApiError(response));
      const body = await response.json() as {
        sessionToken: string;
        messageId: string;
        workerOnline?: boolean;
      };
      sessionTokenRef.current = body.sessionToken;
      window.sessionStorage.setItem(sessionStorageKey, body.sessionToken);
      setWorkerOnline(Boolean(body.workerOnline));
      setStatus(body.workerOnline ? "AI готовит ответ…" : "Вопрос в очереди локального AI");
      const runId = pollRunRef.current + 1;
      pollRunRef.current = runId;
      void pollForReply(body.sessionToken, body.messageId, runId);
    } catch (caught) {
      setMessages((current) => current.filter((messageItem) => messageItem.id !== optimisticId));
      setError(caught instanceof Error ? caught.message : "Не удалось отправить вопрос.");
      setStatus("Попробуйте ещё раз");
      setSending(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(input);
  };

  return (
    <div className={`site-ai-chat ${open ? "is-open" : ""}`}>
      {open ? (
        <section className="site-ai-chat-panel" role="dialog" aria-label="AI-консультант СтеклоСтройГрупп">
          <header>
            <div className="site-ai-chat-mark" aria-hidden="true"><Sparkle size={20} weight="thin" /></div>
            <div>
              <strong>Оптический консультант</strong>
              <span><i className={workerOnline ? "is-online" : ""} /> {status}</span>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Закрыть чат">
              <X size={20} weight="thin" aria-hidden="true" />
            </button>
          </header>

          <div className="site-ai-chat-messages" ref={messagesRef} aria-live="polite">
            <div className="site-ai-chat-intro">
              <p className="optical-label">ИНЖЕНЕРНЫЙ БРИФ · AI</p>
              <h2>Разберём задачу до разговора с инженером</h2>
              <p>Помогу с выбором системы и подготовкой исходных данных. Стоимость, сроки и технический расчёт подтвердит специалист.</p>
            </div>

            {messages.map((message) => (
              <div key={message.id} className={`site-ai-chat-message is-${message.role}`}>
                <span>{message.role === "assistant" ? "AI" : "Вы"}</span>
                <p>{message.content}</p>
              </div>
            ))}

            {sending ? (
              <div className="site-ai-chat-thinking" aria-label="AI готовит ответ">
                <i /><i /><i />
              </div>
            ) : null}
            {error ? <p className="site-ai-chat-error" role="alert">{error}</p> : null}
          </div>

          {messages.length === 0 ? (
            <div className="site-ai-chat-suggestions" aria-label="Популярные вопросы">
              {suggestions.map((suggestion) => (
                <button key={suggestion} type="button" onClick={() => void sendMessage(suggestion)}>
                  {suggestion}
                </button>
              ))}
            </div>
          ) : null}

          <form onSubmit={handleSubmit}>
            <label>
              <span className="sr-only">Ваш вопрос</span>
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void sendMessage(input);
                  }
                }}
                maxLength={1200}
                rows={1}
                placeholder="Опишите объект или задайте вопрос…"
                disabled={!chatEndpoint || sending}
              />
            </label>
            <button type="submit" disabled={!input.trim() || sending || !chatEndpoint} aria-label="Отправить вопрос">
              <PaperPlaneTilt size={21} weight="thin" aria-hidden="true" />
            </button>
          </form>

          <footer>
            <span>AI может ошибаться в деталях</span>
            <Link href="/raschet/">Передать проект инженеру</Link>
          </footer>
        </section>
      ) : null}

      <button
        className="site-ai-chat-trigger"
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-label="Открыть AI-консультант"
      >
        <span className="site-ai-chat-trigger-icon"><ChatCircleDots size={26} weight="thin" aria-hidden="true" /></span>
        <span><strong>Спросить AI</strong><small>Помощник по остеклению</small></span>
      </button>
    </div>
  );
}
