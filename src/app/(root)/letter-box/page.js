"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

const LETTER_TYPES = [
  { value: "complaint", label: "অভিযোগ" },
  { value: "suggestion", label: "পরামর্শ" },
  { value: "question", label: "প্রশ্ন" },
  { value: "other", label: "অন্যান্য" }
];

const typeColor = {
  complaint: "bg-[#FFE3E3] text-[#8C2F39]",
  suggestion: "bg-[#E4FBE7] text-[#1E6F3D]",
  question: "bg-[#E3F1FF] text-[#1D5B89]",
  other: "bg-[#ECEAFD] text-[#4A3A87]"
};

const typeLabel = {
  complaint: "অভিযোগ",
  suggestion: "পরামর্শ",
  question: "প্রশ্ন",
  other: "অন্যান্য"
};

export default function LetterBoxPage() {
  const [ownerToken, setOwnerToken] = useState("");
  const [letters, setLetters] = useState([]);
  const [deletingId, setDeletingId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", text: "" });
  const [form, setForm] = useState({
    type: "complaint",
    title: "",
    message: "",
    name: "",
    isAnonymous: false
  });

  const canSubmit = useMemo(() => {
    return form.title.trim() && form.message.trim() && !isSubmitting;
  }, [form.title, form.message, isSubmitting]);

  const loadLetters = async (token) => {
    try {
      const response = await fetch("/api/letter-box", {
        cache: "no-store",
        headers: { "x-letter-owner-token": token }
      });
      if (!response.ok) return;
      const data = await response.json();
      setLetters(Array.isArray(data?.posts) ? data.posts : []);
    } catch {
      // Non-critical
    }
  };

  useEffect(() => {
    const key = "letter_box_owner_token";
    const existing = window.localStorage.getItem(key);
    if (existing) {
      setOwnerToken(existing);
      return;
    }

    const created = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
    window.localStorage.setItem(key, created);
    setOwnerToken(created);
  }, []);

  useEffect(() => {
    if (!ownerToken) return;
    loadLetters(ownerToken);
  }, [ownerToken]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit || !ownerToken) return;

    setIsSubmitting(true);
    setStatus({ type: "", text: "" });

    try {
      const response = await fetch("/api/letter-box", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, ownerToken })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "লেটার জমা দেওয়া যায়নি।");
      }

      setLetters((prev) => [data.post, ...prev]);
      setForm({
        type: "complaint",
        title: "",
        message: "",
        name: "",
        isAnonymous: false
      });
      setStatus({ type: "success", text: data?.message || "লেটার সফলভাবে জমা হয়েছে।" });
    } catch (error) {
      setStatus({ type: "error", text: error?.message || "লেটার জমা ব্যর্থ হয়েছে।" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id || deletingId || !ownerToken) return;

    setDeletingId(id);
    setStatus({ type: "", text: "" });
    try {
      const response = await fetch("/api/letter-box", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ownerToken })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "লেটার মুছা যায়নি।");
      }

      setLetters((prev) => prev.filter((item) => item.id !== id));
      setStatus({ type: "success", text: data?.message || "লেটার সফলভাবে মুছে ফেলা হয়েছে।" });
    } catch (error) {
      setStatus({ type: "error", text: error?.message || "লেটার মুছতে ব্যর্থ হয়েছে।" });
    } finally {
      setDeletingId("");
    }
  };

  return (
    <main className="min-h-screen bg-[#DDF3FF] px-6 py-20 text-[#123B4A] md:px-20">
      <div className="mx-auto mb-10 max-w-5xl text-center">
        <h1 className="text-4xl font-bold text-[#2A7F9E]">অভিযোগ ও পরামর্শ বাক্স</h1>
        <p className="mt-3 text-[#123B4A]">আপনার মূল্যবান অভিযোগ, পরামর্শ বা প্রশ্ন এখানে পোস্ট করুন।</p>
      </div>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto mb-10 max-w-5xl rounded-2xl border border-[#A9D4DE] bg-[#EAFBFF] p-6 shadow-sm md:p-8"
      >
        <h2 className="mb-4 text-xl font-semibold text-[#2A7F9E]">লেটার জমা দিন</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <select
            value={form.type}
            onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
            className="w-full rounded-lg border border-[#A9D4DE] bg-[#EAFBFF] px-4 py-3 text-sm outline-none focus:border-[#4FBBC6]"
          >
            {LETTER_TYPES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="আপনার নাম "
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            disabled={form.isAnonymous}
            className="w-full rounded-lg border border-[#A9D4DE] bg-[#EAFBFF] px-4 py-3 text-sm outline-none focus:border-[#4FBBC6] disabled:opacity-60"
          />
          <input
            type="text"
            placeholder="লেটারের শিরোনাম"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            className="w-full rounded-lg border border-[#A9D4DE] bg-[#EAFBFF] px-4 py-3 text-sm outline-none focus:border-[#4FBBC6] md:col-span-2"
            required
          />
          <textarea
            rows={6}
            placeholder="আপনার লেটার লিখুন..."
            value={form.message}
            onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
            className="w-full rounded-lg border border-[#A9D4DE] bg-[#EAFBFF] px-4 py-3 text-sm outline-none focus:border-[#4FBBC6] md:col-span-2"
            required
          />
          <label className="inline-flex items-center gap-2 text-sm text-[#123B4A] md:col-span-2">
            <input
              type="checkbox"
              checked={form.isAnonymous}
              onChange={(e) => setForm((prev) => ({ ...prev, isAnonymous: e.target.checked }))}
            />
            নাম গোপন রেখে পোস্ট করুন
          </label>
        </div>

        {status.text && (
          <p className={`mt-4 text-sm ${status.type === "success" ? "text-[#2F8FA8]" : "text-[#256D86]"}`}>
            {status.text}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-5 rounded-lg bg-[#4FBBC6] px-5 py-3 text-sm font-semibold text-[#123B4A] hover:bg-[#399CA8] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "জমা হচ্ছে..." : "লেটার পোস্ট করুন"}
        </button>
      </motion.form>

      <section className="mx-auto max-w-5xl">
        <h2 className="mb-4 text-2xl font-semibold text-[#2A7F9E]">সবার লেটার</h2>
        {letters.length === 0 ? (
          <div className="rounded-xl border border-[#A9D4DE] bg-[#EAFBFF] p-6 text-sm text-[#123B4A]">
            এখনো কোনো লেটার পোস্ট হয়নি।
          </div>
        ) : (
          <div className="space-y-4">
            {letters.map((item) => (
              <article key={item.id} className="rounded-2xl border border-[#A9D4DE] bg-[#EAFBFF] p-5 shadow-sm">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${typeColor[item.type] || typeColor.other}`}>
                    {typeLabel[item.type] || "অন্যান্য"}
                  </span>
                  <span className="text-xs text-[#256D86]">
                    {new Date(item.createdAt).toLocaleString("bn-BD", {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-[#123B4A]">{item.title}</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm text-[#123B4A]">{item.message}</p>
                <p className="mt-3 text-xs text-[#256D86]">
                  পোস্ট করেছেন: {item.isAnonymous ? "নাম প্রকাশে অনিচ্ছুক" : item.name || "শিক্ষার্থী"}
                </p>
                {item.canDelete && (
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="mt-3 rounded-md bg-[#256D86] px-3 py-2 text-xs font-semibold text-[#EAFBFF] hover:bg-[#1D5569] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingId === item.id ? "মুছছে..." : "মুছুন"}
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
