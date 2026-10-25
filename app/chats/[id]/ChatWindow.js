"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  const boxRef = useRef(null);
  const supabaseRef = useRef(null);

  // add messages we don't have yet, oldest first
  // (our own message comes back twice: once from insert, once from realtime)
  const addMessages = useCallback((incoming) => {
    setMessages((current) => {
      const known = new Set(current.map((m) => m.id));
      const fresh = incoming.filter((m) => !known.has(m.id));
      if (fresh.length === 0) return current;
      return [...current, ...fresh].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    });
  }, []);

  // grab anything we missed (e.g. while the phone screen was locked)
  const catchUp = useCallback(async () => {
    const supabase = supabaseRef.current;
    if (!supabase) return;
    const { data } = await supabase
      .from("messages")
      .select("id, sender_id, content, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) addMessages(data);
  }, [conversationId, addMessages]);

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
        (payload) => addMessages([payload.new])
      )
      .subscribe((status) => {
        setLive(status === "SUBSCRIBED");
        // (re)connected -> fill the gap from while we were offline
        if (status === "SUBSCRIBED") catchUp();
      });

    // coming back to the tab after the phone slept
    function onVisible() {
      if (document.visibilityState === "visible") catchUp();
    }
    document.addEventListener("visibilitychange", onVisible);

    // close the websocket when you leave the page
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      supabase.removeChannel(channel);
    };
  }, [conversationId, addMessages, catchUp]);

  // keep the newest message in view, scrolling only the chat box (not the whole page)
  useEffect(() => {
    const box = boxRef.current;
    if (box) box.scrollTo({ top: box.scrollHeight, behavior: "smooth" });
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
    addMessages([data]);
    setText("");
  }

  return (
    <div className="mt-4 flex flex-col">
      <div ref={boxRef} className="card flex h-[60vh] flex-col gap-3 overflow-y-auto bg-white/70 p-4">
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
              {/* always visible on phones (no hover there), hover-only on laptops */}
              {!mine && (
                <span className="sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                  <ReportButton targetType="message" targetId={m.id} small />
                </span>
              )}
            </div>
          );
        })}
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
