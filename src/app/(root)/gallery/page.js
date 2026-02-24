"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const staticGalleryImages = [
  { id: 1, src: "/image/one.jpg", alt: "Campus view 1" },
  { id: 2, src: "/image/banners.jpg", alt: "Campus view 2" },
  { id: 3, src: "/image/two.jpg", alt: "Lab session" },
  { id: 4, src: "/image/tre.jpg", alt: "Student event" },
  { id: 5, src: "/image/li.jpg", alt: "Library" },
  { id: 6, src: "/image/sp.jpg", alt: "Sports activity" },
  { id: 7, src: "/image/sj.jpg", alt: "Sports activity 2" },
  { id: 8, src: "/image/g1.jpg", alt: "Sports activity 1" },
  { id: 9, src: "/image/g2.jpg", alt: "Sports activity 2" },
  { id: 10, src: "/image/g3.jpg", alt: "Sports activity 3" },
  { id: 11, src: "/image/g4.jpg", alt: "Sports activity 4" },
  { id: 12, src: "/image/g5.jpg", alt: "Sports activity 5" },
  { id: 13, src: "/image/g6.jpg", alt: "Sports activity 6" },
  { id: 14, src: "/image/g7.jpg", alt: "Sports activity 7" },
  { id: 15, src: "/image/g8.jpg", alt: "Sports activity 8" },
  { id: 16, src: "/image/g9.jpg", alt: "Sports activity 9" }
];

const REACTION_OPTIONS = ["❤️", "😂", "🔥", "😍", "👍"];

export default function Gallery() {
  const [communityPosts, setCommunityPosts] = useState([]);
  const [form, setForm] = useState({ author: "", caption: "" });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [ownerToken, setOwnerToken] = useState("");
  const [userReactions, setUserReactions] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [reactingId, setReactingId] = useState("");
  const [status, setStatus] = useState({ type: "", text: "" });

  const canSubmit = useMemo(() => !!imageFile && !isSubmitting, [imageFile, isSubmitting]);

  useEffect(() => {
    const key = "gallery_owner_token";
    const existingToken = window.localStorage.getItem(key);
    if (existingToken) {
      setOwnerToken(existingToken);
      return;
    }

    const newToken = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
    window.localStorage.setItem(key, newToken);
    setOwnerToken(newToken);
  }, []);

  useEffect(() => {
    const key = "gallery_user_reactions";
    try {
      const rawValue = window.localStorage.getItem(key);
      const parsed = JSON.parse(rawValue || "{}");
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        setUserReactions(parsed);
      }
    } catch {
      setUserReactions({});
    }
  }, []);

  useEffect(() => {
    if (!ownerToken) return;

    const loadPosts = async () => {
      try {
        const response = await fetch("/api/gallery", {
          cache: "no-store",
          headers: { "x-gallery-owner-token": ownerToken }
        });
        if (!response.ok) return;
        const data = await response.json();
        setCommunityPosts(Array.isArray(data?.posts) ? data.posts : []);
      } catch {
        // Non-critical block
      }
    };

    loadPosts();
  }, [ownerToken]);

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    if (!file) {
      setImageFile(null);
      setPreviewUrl("");
      return;
    }

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;
    if (!ownerToken) {
      setStatus({ type: "error", text: "Could not verify post owner. Please refresh and try again." });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: "", text: "" });

    try {
      const body = new FormData();
      body.append("author", form.author);
      body.append("caption", form.caption);
      body.append("image", imageFile);
      body.append("ownerToken", ownerToken);

      const response = await fetch("/api/gallery", {
        method: "POST",
        body
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Could not post image.");
      }

      setCommunityPosts((prev) => [data.post, ...prev]);
      setForm({ author: "", caption: "" });
      setImageFile(null);
      setStatus({ type: "success", text: data?.message || "Image posted successfully." });

      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl("");
    } catch (error) {
      setStatus({ type: "error", text: error?.message || "Image post failed." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPostDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleString("en-BD", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const handleDeletePost = async (id) => {
    if (!id || deletingId) return;
    if (!ownerToken) {
      setStatus({ type: "error", text: "Could not verify post owner. Please refresh and try again." });
      return;
    }

    setDeletingId(id);
    setStatus({ type: "", text: "" });

    try {
      const response = await fetch("/api/gallery", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ownerToken })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Could not delete post.");
      }

      setCommunityPosts((prev) => prev.filter((post) => post.id !== id));
      setStatus({ type: "success", text: data?.message || "Post deleted successfully." });
    } catch (error) {
      setStatus({ type: "error", text: error?.message || "Delete failed." });
    } finally {
      setDeletingId("");
    }
  };

  const saveReactionMap = (nextValue) => {
    setUserReactions(nextValue);
    window.localStorage.setItem("gallery_user_reactions", JSON.stringify(nextValue));
  };

  const handleReaction = async (postId, emoji) => {
    if (!postId || !emoji || reactingId) return;
    const previousEmoji = userReactions[postId] || "";
    if (previousEmoji === emoji) {
      return;
    }

    setReactingId(postId);
    setStatus({ type: "", text: "" });

    try {
      const response = await fetch("/api/gallery", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: postId, emoji, previousEmoji, ownerToken })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Could not react to this post.");
      }

      setCommunityPosts((prev) => prev.map((post) => (post.id === postId ? data.post : post)));
      saveReactionMap({ ...userReactions, [postId]: emoji });
    } catch (error) {
      setStatus({ type: "error", text: error?.message || "Reaction failed." });
    } finally {
      setReactingId("");
    }
  };

  return (
    <main className="bg-[#DDF3FF] text-[#123B4A] py-20 px-6 md:px-20">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold text-[#2A7F9E]">গ্যালারি</h1>
        <p className="text-[#123B4A] mt-4">
          আমাদের ক্যাম্পাস ও বিভিন্ন ইভেন্ট ঘুরে দেখুন, আর এখন আপনিও আপনার নিজের ছবি পোস্ট করুন।
        </p>
      </div>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto mb-12 max-w-4xl rounded-2xl border border-[#A9D4DE] bg-[#EAFBFF] p-6 shadow-sm"
      >
        <h2 className="mb-4 text-xl font-semibold text-[#2A7F9E]">আপনার ছবি পোস্ট করুন</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <input
            type="text"
            placeholder="আপনার নাম"
            value={form.author}
            onChange={(event) => setForm((prev) => ({ ...prev, author: event.target.value }))}
            className="w-full rounded-lg border border-[#A9D4DE] bg-[#EAFBFF] px-4 py-3 text-sm outline-none focus:border-[#4FBBC6]"
          />
          <input
            type="text"
            placeholder="ক্যাপশন"
            value={form.caption}
            onChange={(event) => setForm((prev) => ({ ...prev, caption: event.target.value }))}
            className="w-full rounded-lg border border-[#A9D4DE] bg-[#EAFBFF] px-4 py-3 text-sm outline-none focus:border-[#4FBBC6]"
          />
          <div className="md:col-span-2 w-full">
            <label
              htmlFor="gallery-photo-upload"
              className="inline-flex cursor-pointer items-center rounded-lg border border-[#A9D4DE] bg-[#EAFBFF] px-4 py-3 text-sm font-medium text-[#123B4A] hover:border-[#4FBBC6]"
            >
              আপনার ছবি দিন
            </label>
            <input
              id="gallery-photo-upload"
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
              onChange={handleImageChange}
              className="sr-only"
            />
            <p className="mt-2 text-xs text-[#123B4A]">নির্বাচিত ছবি: {imageFile?.name || "প্রযোজ্য নয়"}</p>
          </div>
          {previewUrl && (
            <div className="md:col-span-2 overflow-hidden rounded-xl border border-[#A9D4DE] bg-white p-2">
              <img src={previewUrl} alt="Preview" className="h-56 w-full rounded-lg object-cover" />
            </div>
          )}
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
          {isSubmitting ? "Posting..." : "গ্যালারিতে পোস্ট করুন"}
        </button>
      </motion.form>

      {communityPosts.length > 0 && (
        <section className="max-w-6xl mx-auto mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-[#2A7F9E]">Community Posts</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {communityPosts.map((post, index) => (
              <motion.article
                key={post.id}
                whileHover={{ scale: 1.03 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="overflow-hidden rounded-2xl shadow-lg bg-[#EAFBFF]"
              >
                <img
                  src={post.imageUrl}
                  alt={post.caption || "Community post"}
                  className="h-64 w-full object-cover"
                />
                <div className="p-4">
                  <p className="text-sm font-semibold text-[#123B4A]">{post.author || "Anonymous"}</p>
                  <p className="mt-1 text-sm text-[#123B4A]">{post.caption || "New gallery post"}</p>
                  <p className="mt-2 text-xs text-[#256D86]">
                    Posted: {formatPostDate(post.createdAt) || "N/A"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {REACTION_OPTIONS.map((emoji) => {
                      const count = Number(post?.reactions?.[emoji] || 0);
                      const isSelected = userReactions[post.id] === emoji;
                      const isDisabled = reactingId === post.id;

                      return (
                        <button
                          key={`${post.id}-${emoji}`}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => handleReaction(post.id, emoji)}
                          className={`rounded-full border px-2.5 py-1 text-xs transition ${
                            isSelected
                              ? "border-[#2A7F9E] bg-[#4FBBC6] text-[#123B4A]"
                              : "border-[#A9D4DE] bg-white text-[#123B4A] hover:border-[#4FBBC6]"
                          } disabled:cursor-not-allowed disabled:opacity-70`}
                        >
                          {emoji} {count}
                        </button>
                      );
                    })}
                  </div>
                  {post.canDelete && (
                    <button
                      type="button"
                      onClick={() => handleDeletePost(post.id)}
                      disabled={deletingId === post.id}
                      className="mt-3 rounded-md bg-[#256D86] px-3 py-2 text-xs font-semibold text-[#EAFBFF] hover:bg-[#1D5569] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingId === post.id ? "Deleting..." : "Delete Post"}
                    </button>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        </section>
      )}

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {staticGalleryImages.map((img, index) => (
          <motion.div
            key={img.id}
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="overflow-hidden rounded-2xl shadow-lg bg-[#EAFBFF]"
          >
            <Image
              src={img.src}
              alt={img.alt}
              width={500}
              height={500}
              className="object-cover w-full h-64 md:h-48 transition-transform duration-300 hover:scale-105"
            />
          </motion.div>
        ))}
      </div>
    </main>
  );
}
