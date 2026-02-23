"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { FiMessageCircle, FiSend, FiX } from "react-icons/fi";

const WELCOME_TEXT =
  "Hi! Ami Bangla + English duita language e chat korte pari. Ask me anything.";

export default function CollegeChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([{ role: "bot", text: WELCOME_TEXT }]);
  const [isLoading, setIsLoading] = useState(false);

  const canSend = useMemo(() => input.trim().length > 0, [input]);

  const handleSend = async () => {
    const value = input.trim();
    if (!value || isLoading) return;

    const nextMessages = [...messages, { role: "user", text: value }];
    setMessages(nextMessages);
    setInput("");

    setIsLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: value,
          messages: nextMessages
        })
      });

      const data = await response.json();
      const reply =
        typeof data?.reply === "string" && data.reply
          ? data.reply
          : "I could not generate a response right now.";

      setMessages((prev) => [...prev, { role: "bot", text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Network problem. Please try again."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[70]">
      {isOpen ? (
        <div className="w-[320px] max-w-[92vw] rounded-2xl border border-[#A9D4DE] bg-[#EAFBFF] text-[#123B4A] shadow-2xl">
          <div className="flex items-center justify-between rounded-t-2xl bg-[#4FBBC6] px-4 py-3">
            <div className="flex items-center gap-2">
              <Image
                src="/favicon.ico"
                alt="College logo"
                width={26}
                height={26}
                className="rounded-full border border-white/60 bg-[#EAFBFF]"
              />
              <div>
                <p className="text-sm font-semibold leading-4">AI Chat Assistant</p>
                <p className="text-[11px] text-[#2F8FA8]">Bangla + English</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-md p-1 hover:bg-[#399CA8]"
              aria-label="Close chatbot"
            >
              <FiX size={16} />
            </button>
          </div>

          <div className="h-80 space-y-3 overflow-y-auto px-3 py-3">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-5 ${
                  msg.role === "user"
                    ? "ml-auto bg-[#4FBBC6] text-[#123B4A]"
                    : "bg-[#D8F3F0] text-[#123B4A]"
                }`}
              >
                {msg.text}
              </div>
            ))}
            {isLoading && (
              <div className="max-w-[85%] rounded-xl bg-[#D8F3F0] px-3 py-2 text-sm text-[#123B4A]">
                Typing...
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 border-t border-[#A9D4DE] p-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type in Bangla or English..."
              className="w-full rounded-lg border border-[#A9D4DE] bg-[#EAFBFF] px-3 py-2 text-sm text-[#123B4A] outline-none focus:border-[#4FBBC6]"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!canSend || isLoading}
              className="rounded-lg bg-[#4FBBC6] p-2 text-[#123B4A] disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Send message"
            >
              <FiSend size={16} />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 rounded-full bg-[#4FBBC6] px-4 py-3 text-[#123B4A] shadow-lg hover:bg-[#399CA8]"
          aria-label="Open college chatbot"
        >
          <Image
            src="/favicon.ico"
            alt="College logo"
            width={20}
            height={20}
            className="rounded-full bg-[#EAFBFF]"
          />
          <span className="text-sm font-semibold">Chat with AI</span>
          <FiMessageCircle size={16} />
        </button>
      )}
    </div>
  );
}
