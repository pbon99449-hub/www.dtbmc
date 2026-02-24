"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

export default function Teachers() {
  const [teacherPosts, setTeacherPosts] = useState([]);
  const [form, setForm] = useState({ name: "", phone: "", subject: "" });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [ownerToken, setOwnerToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [status, setStatus] = useState({ type: "", text: "" });

  const canSubmit = useMemo(() => !!imageFile && !isSubmitting, [imageFile, isSubmitting]);

  useEffect(() => {
    const key = "teachers_owner_token";
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
    if (!ownerToken) return;

    const loadPosts = async () => {
      try {
        const response = await fetch("/api/teachers", {
          cache: "no-store",
          headers: { "x-teachers-owner-token": ownerToken }
        });
        if (!response.ok) return;

        const data = await response.json();
        setTeacherPosts(Array.isArray(data?.posts) ? data.posts : []);
      } catch {
        // non-blocking
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
      setStatus({ type: "error", text: "মালিক যাচাই করা যায়নি। রিফ্রেশ করে আবার চেষ্টা করুন।" });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: "", text: "" });

    try {
      const body = new FormData();
      body.append("name", form.name);
      body.append("phone", form.phone);
      body.append("subject", form.subject);
      body.append("image", imageFile);
      body.append("ownerToken", ownerToken);

      const response = await fetch("/api/teachers", {
        method: "POST",
        body
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "শিক্ষকের ছবি আপলোড করা যায়নি।");
      }

      setTeacherPosts((prev) => [data.post, ...prev]);
      setForm({ name: "", phone: "", subject: "" });
      setImageFile(null);
      setStatus({ type: "success", text: data?.message || "শিক্ষকের ছবি সফলভাবে আপলোড হয়েছে।" });

      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl("");
    } catch (error) {
      setStatus({ type: "error", text: error?.message || "আপলোড ব্যর্থ হয়েছে।" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (id) => {
    if (!id || deletingId) return;
    if (!ownerToken) {
      setStatus({ type: "error", text: "মালিক যাচাই করা যায়নি। রিফ্রেশ করে আবার চেষ্টা করুন।" });
      return;
    }

    setDeletingId(id);
    setStatus({ type: "", text: "" });

    try {
      const response = await fetch("/api/teachers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ownerToken })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "পোস্ট মুছা যায়নি।");
      }

      setTeacherPosts((prev) => prev.filter((post) => post.id !== id));
      setStatus({ type: "success", text: data?.message || "পোস্ট সফলভাবে মুছে ফেলা হয়েছে।" });
    } catch (error) {
      setStatus({ type: "error", text: error?.message || "মুছা ব্যর্থ হয়েছে।" });
    } finally {
      setDeletingId("");
    }
  };

  return (
    <section className="bg-[#EAFBFF] text-[#123B4A] py-20 px-6 md:px-20">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="mb-12 text-3xl font-bold text-[#2A7F9E] md:text-4xl">আমাদের শিক্ষকবৃন্দ</h2>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-12 max-w-4xl rounded-2xl border border-[#A9D4DE] bg-[#D8F3F0] p-6 shadow-sm"
        >
          <h3 className="mb-4 text-xl font-semibold text-[#2A7F9E]">শিক্ষকের ছবি আপলোড করুন</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="text"
              placeholder="শিক্ষকের নাম"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              className="w-full rounded-lg border border-[#A9D4DE] bg-[#EAFBFF] px-4 py-3 text-sm outline-none focus:border-[#4FBBC6]"
            />
            <input
              type="tel"
              placeholder="ফোন নম্বর"
              value={form.phone}
              onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
              className="w-full rounded-lg border border-[#A9D4DE] bg-[#EAFBFF] px-4 py-3 text-sm outline-none focus:border-[#4FBBC6]"
              required
            />
            <input
              type="text"
              placeholder="বিষয়"
              value={form.subject}
              onChange={(event) => setForm((prev) => ({ ...prev, subject: event.target.value }))}
              className="md:col-span-2 w-full rounded-lg border border-[#A9D4DE] bg-[#EAFBFF] px-4 py-3 text-sm outline-none focus:border-[#4FBBC6]"
            />
            <div className="md:col-span-2 w-full">
              <label
                htmlFor="teacher-photo-upload"
                className="inline-flex cursor-pointer items-center rounded-lg border border-[#A9D4DE] bg-[#EAFBFF] px-4 py-3 text-sm font-medium text-[#123B4A] hover:border-[#4FBBC6]"
              >
                আপনার ছবি দিন
              </label>
              <input
                id="teacher-photo-upload"
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                onChange={handleImageChange}
                className="sr-only"
              />
              <p className="mt-2 text-xs text-[#123B4A]">নির্বাচিত ছবি: {imageFile?.name || "প্রযোজ্য নয়"}</p>
            </div>
            {previewUrl && (
              <div className="md:col-span-2 overflow-hidden rounded-xl border border-[#A9D4DE] bg-white p-2">
                <img src={previewUrl} alt="প্রিভিউ" className="h-56 w-full rounded-lg object-cover" />
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
            {isSubmitting ? "আপলোড হচ্ছে..." : "ছবি আপলোড করুন"}
          </button>
        </motion.form>

        {teacherPosts.length > 0 && (
          <div className="mb-12">
            <h3 className="mb-6 text-2xl font-semibold text-[#2A7F9E]">আপলোড করা শিক্ষকের ছবি</h3>
            <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
              {teacherPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="relative rounded-2xl bg-[#D8F3F0] p-6 shadow-lg transition duration-300 hover:shadow-2xl"
                >
                  <span className="absolute left-8 top-8 rounded-full bg-[#256D86] px-3 py-1 text-xs font-semibold text-[#EAFBFF]">
                    নং {index + 1}
                  </span>
                  <img
                    src={post.imageUrl}
                    alt={post.name || "আপলোড করা শিক্ষক"}
                    className="mx-auto mb-4 h-64 w-full rounded-xl object-cover"
                  />
                  <h3 className="text-xl font-semibold text-[#2A7F9E]">{post.name || "আপলোড করা শিক্ষক"}</h3>
                  <p className="text-[#123B4A]">ফোন: {post.phone || "দেওয়া হয়নি"}</p>
                  <p className="text-[#123B4A]">{post.subject || "প্রযোজ্য নয়"}</p>
                  {post.canDelete && (
                    <button
                      type="button"
                      onClick={() => handleDeletePost(post.id)}
                      disabled={deletingId === post.id}
                      className="mt-3 rounded-md bg-[#256D86] px-3 py-2 text-xs font-semibold text-[#EAFBFF] hover:bg-[#1D5569] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingId === post.id ? "মুছা হচ্ছে..." : "পোস্ট মুছুন"}
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
