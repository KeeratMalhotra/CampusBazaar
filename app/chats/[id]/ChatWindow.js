"use client";

import { useEffect, useRef, useState } from "react";
import { SendHorizontal } from "lucide-react";
import ReportButton from "@/components/ReportButton";
import { createClient } from "@/lib/supabase/client";

function timeOf(date) {
  return new Date(date).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

export default function ChatWindow({ conversationId, userId, initialMessages }) {
  const [messages, setMessages] = useState(initialMessages);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [live, setLive] = useState(false);
  const bottomRef = useRef(null);
  const supabaseRef = useRef(null);

  // add a message unless we already have it
  // (our own message comes back twice: once from insert, once from realtime)
  function addMessage(message) {
    setMessages((current) =>
      current.some((m) => m.id === message.id) ? current : [...current, message]
    );
  }

  // listen for new messages in this chat over a websocket (supabase realtime).
  // realtime follows our row level security rules, so you only get your own chats.
  useEffect(() => {
    const supabase = createClient();
    supabaseRef.current = supabase;

    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => addMessage(payload.new)
      )
      .subscribe((status) => setLive(status === "SUBSCRIBED"));

    // close the websocket when you leave the page
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  // keep the newest message in view
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function send(event) {
    event.preventDefault();
    const content = text.trim();
    if (!content || sending) return;

    setSending(true);
    setError("");
    // messages are saved in postgres first, realtime just delivers them
    const { data, error } = await supabaseRef.current
      .from("messages")
      .insert({ conversation_id: conversationId, content })
      .select("id, sender_id, content, created_at")
      .single();
    setSending(false);

    if (error) return setError("message didn't send, try again");
    addMessage(data);
    setText("");
  }

  return (
    <div className="mt-4 flex flex-col">
      <div className="card flex h-[60vh] flex-col gap-3 overflow-y-auto bg-white/70 p-4">
        <p className="mx-auto max-w-sm rounded-xl border-2 border-dashed border-ink/30 px-3 py-2 text-center text-xs text-ink/60">
          🔒 only you two can read this chat. share your number only if you want to,
          meet in public spots, and never pay before you see the item.
        </p>

        {messages.length === 0 && (
          <p className="m-auto text-center text-ink/50">say hi 👋 ask if it&apos;s still available</p>
        )}

        {messages.map((m) => {
          const mine = m.sender_id === userId;
          return (
            <div key={m.id} className={`group flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl border-[2.5px] border-ink px-4 py-2 shadow-brutal-sm ${
                  mine ? "rounded-br-sm bg-lime" : "rounded-bl-sm bg-white"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{m.content}</p>
                <p className="mt-0.5 text-right text-[10px] font-semibold text-ink/50">{timeOf(m.created_at)}</p>
              </div>
              {!mine && (
                <span className="opacity-0 transition-opacity group-hover:opacity-100">
                  <ReportButton targetType="message" targetId={m.id} small />
                </span>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="mt-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={2000}
          placeholder="type a message..."
          className="card flex-1 px-4 py-3 outline-none focus:shadow-brutal-lg"
        />
        <button disabled={sending || !text.trim()} aria-label="send" className="btn bg-ink px-4 text-white disabled:opacity-50">
          <SendHorizontal size={20} />
        </button>
      </form>

      <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-ink/50">
        <span className={`h-2 w-2 rounded-full ${live ? "bg-green-500" : "bg-ink/30"}`} />
        {live ? "live" : "connecting..."}
        {error && <span className="ml-2 text-red-600">{error}</span>}
      </p>
    </div>
  );
}
