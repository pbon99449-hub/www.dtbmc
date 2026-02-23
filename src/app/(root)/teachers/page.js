"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

export default function Teachers() {
  const [teacherPosts, setTeacherPosts] = useState([]);
  const [form, setForm] = useState({ name: "", subject: "" });
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
      setStatus({ type: "error", text: "Could not verify owner. Please refresh and try again." });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: "", text: "" });

    try {
      const body = new FormData();
      body.append("name", form.name);
      body.append("subject", form.subject);
      body.append("image", imageFile);
      body.append("ownerToken", ownerToken);

      const response = await fetch("/api/teachers", {
        method: "POST",
        body
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Could not upload teacher photo.");
      }

      setTeacherPosts((prev) => [data.post, ...prev]);
      setForm({ name: "", subject: "" });
      setImageFile(null);
      setStatus({ type: "success", text: data?.message || "Teacher photo uploaded successfully." });

      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl("");
    } catch (error) {
      setStatus({ type: "error", text: error?.message || "Upload failed." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (id) => {
    if (!id || deletingId) return;
    if (!ownerToken) {
      setStatus({ type: "error", text: "Could not verify owner. Please refresh and try again." });
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
        throw new Error(data?.message || "Could not delete post.");
      }

      setTeacherPosts((prev) => prev.filter((post) => post.id !== id));
      setStatus({ type: "success", text: data?.message || "Post deleted successfully." });
    } catch (error) {
      setStatus({ type: "error", text: error?.message || "Delete failed." });
    } finally {
      setDeletingId("");
    }
  };

  return (
    <section className="bg-[#EAFBFF] text-[#123B4A] py-20 px-6 md:px-20">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-[#2A7F9E] mb-12">
          আমাদের শিক্ষকবৃন্দ
        </h2>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-12 max-w-4xl rounded-2xl border border-[#A9D4DE] bg-[#D8F3F0] p-6 shadow-sm"
        >
          <h3 className="mb-4 text-xl font-semibold text-[#2A7F9E]">Upload Teacher Picture</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="text"
              placeholder="Teacher Name"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              className="w-full rounded-lg border border-[#A9D4DE] bg-[#EAFBFF] px-4 py-3 text-sm outline-none focus:border-[#4FBBC6]"
            />
            <input
              type="text"
              placeholder="Subject"
              value={form.subject}
              onChange={(event) => setForm((prev) => ({ ...prev, subject: event.target.value }))}
              className="w-full rounded-lg border border-[#A9D4DE] bg-[#EAFBFF] px-4 py-3 text-sm outline-none focus:border-[#4FBBC6]"
            />
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
              onChange={handleImageChange}
              className="md:col-span-2 w-full rounded-lg border border-[#A9D4DE] bg-[#EAFBFF] px-4 py-3 text-sm outline-none focus:border-[#4FBBC6]"
              required
            />
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
            {isSubmitting ? "Uploading..." : "Upload Picture"}
          </button>
        </motion.form>

        {teacherPosts.length > 0 && (
          <div className="mb-12">
            <h3 className="mb-6 text-2xl font-semibold text-[#2A7F9E]">Uploaded Teacher Pictures</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-10">
              {teacherPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="bg-[#D8F3F0] p-6 rounded-2xl shadow-lg hover:shadow-2xl transition duration-300"
                >
                  <img
                    src={post.imageUrl}
                    alt={post.name || "Uploaded teacher"}
                    className="h-64 w-full rounded-xl object-cover mx-auto mb-4"
                  />
                  <h3 className="text-xl font-semibold text-[#2A7F9E]">{post.name || "Uploaded Teacher"}</h3>
                  <p className="text-[#123B4A]">{post.subject || "N/A"}</p>
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
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
