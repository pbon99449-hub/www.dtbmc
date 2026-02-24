"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

export default function LatestNoticesHome() {
  const [posts, setPosts] = useState([]);
  const [ownerToken, setOwnerToken] = useState("");
  const [noticeText, setNoticeText] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [status, setStatus] = useState({ type: "", text: "" });

  const canPost = useMemo(() => noticeText.trim().length > 0 && !isPosting, [noticeText, isPosting]);

  useEffect(() => {
    const key = "home_notices_owner_token";
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

    const load = async () => {
      try {
        const response = await fetch("/api/notices", {
          cache: "no-store",
          headers: { "x-notices-owner-token": ownerToken }
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.message || "Could not load notices.");
        }
        setPosts(Array.isArray(data?.posts) ? data.posts : []);
      } catch (error) {
        setStatus({ type: "error", text: error?.message || "Could not load notices." });
      }
    };

    load();
  }, [ownerToken]);

  const handlePost = async (event) => {
    event.preventDefault();
    const text = noticeText.trim();
    if (!text || !ownerToken || isPosting) return;

    setIsPosting(true);
    setStatus({ type: "", text: "" });

    try {
      const response = await fetch("/api/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, ownerToken })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Could not post notice.");
      }

      setPosts((prev) => [data.post, ...prev]);
      setNoticeText("");
      setStatus({ type: "success", text: data?.message || "Notice posted successfully." });
    } catch (error) {
      setStatus({ type: "error", text: error?.message || "Could not post notice." });
    } finally {
      setIsPosting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id || !ownerToken || deletingId) return;

    setDeletingId(id);
    setStatus({ type: "", text: "" });

    try {
      const response = await fetch("/api/notices", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ownerToken })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Could not delete notice.");
      }

      setPosts((prev) => prev.filter((item) => item.id !== id));
      setStatus({ type: "success", text: data?.message || "Notice deleted successfully." });
    } catch (error) {
      setStatus({ type: "error", text: error?.message || "Could not delete notice." });
    } finally {
      setDeletingId("");
    }
  };

  return (
    <>
      <form onSubmit={handlePost} className="max-w-4xl mx-auto mb-6">
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            type="text"
            value={noticeText}
            onChange={(event) => setNoticeText(event.target.value)}
            placeholder="নতুন বিজ্ঞপ্তি লিখুন"
            className="w-full rounded-lg border border-[#A9D4DE] bg-white px-4 py-3 text-sm text-[#123B4A] outline-none focus:border-[#4FBBC6]"
          />
          <button
            type="submit"
            disabled={!canPost}
            className="rounded-lg bg-[#4FBBC6] px-5 py-3 text-sm font-semibold text-[#123B4A] hover:bg-[#399CA8] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPosting ? "পোস্ট হচ্ছে..." : "বিজ্ঞপ্তি পোস্ট করুন"}
          </button>
        </div>
      </form>

      {status.text && (
        <p className={`max-w-4xl mx-auto mb-4 text-sm ${status.type === "error" ? "text-[#C84B4B]" : "text-[#2F8FA8]"}`}>
          {status.text}
        </p>
      )}

      <div className="max-w-4xl mx-auto space-y-6">
        {posts.map((notice, index) => (
          <motion.div
            key={notice.id || index}
            whileHover={{ scale: 1.02 }}
            className="bg-[#D8F3F0] p-6 rounded-lg hover:bg-[#CDEFF2] transition"
          >
            <p className="font-medium text-[#123B4A]">{notice.text}</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs text-[#256D86]">
                {notice.createdAt ? new Date(notice.createdAt).toLocaleString("en-BD") : ""}
              </p>
              {notice.canDelete && (
                <button
                  type="button"
                  onClick={() => handleDelete(notice.id)}
                  disabled={deletingId === notice.id}
                  className="rounded-md bg-[#256D86] px-3 py-2 text-xs font-semibold text-[#EAFBFF] hover:bg-[#1D5569] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deletingId === notice.id ? "মুছছে..." : "ডিলেট"}
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
}
