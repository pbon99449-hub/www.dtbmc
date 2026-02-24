"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FaPhone, FaWhatsapp, FaFacebook } from "react-icons/fa";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    trade: "",
    district: "",
    upazila: "",
    village: "",
    motherName: "",
    motherPhone: "",
    fatherName: "",
    fatherPhone: "",
    gpa: "",
    photoName: "",
    photoUrl: "",
    photoDataUrl: "",
    message: ""
  });

  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState({ type: "", text: "" });
  const [popup, setPopup] = useState({ open: false, title: "", text: "" });
  const [photoPreview, setPhotoPreview] = useState("");

  const canSubmit = useMemo(() => {
    return form.name.trim() && form.message.trim() && (form.email.trim() || form.phone.trim());
  }, [form]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    return () => {
      if (photoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      if (photoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
      setPhotoPreview("");
      handleChange("photoName", "");
      handleChange("photoDataUrl", "");
      return;
    }

    const nextPreview = URL.createObjectURL(file);
    if (photoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhotoPreview(nextPreview);
    handleChange("photoName", file.name);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        handleChange("photoDataUrl", reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || isSending) return;

    setIsSending(true);
    setStatus({ type: "", text: "" });

    try {
      const configuredEndpoint = (process.env.NEXT_PUBLIC_CONTACT_API || "").trim();
      const endpoint =
        configuredEndpoint &&
        !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(configuredEndpoint)
          ? configuredEndpoint
          : "/api/contact";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      let data = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        const details = [data?.message, data?.notifications].filter(Boolean).join(" ");
        throw new Error(details || "বার্তা পাঠানো যায়নি। আবার চেষ্টা করুন।");
      }

      const okText = data?.message || "আপনার বার্তা সফলভাবে পাঠানো হয়েছে। আমরা দ্রুত যোগাযোগ করব।";

      setStatus({ type: "success", text: okText });
      setPopup({ open: true, title: "সফল", text: okText });

      setForm({
        name: "",
        email: "",
        phone: "",
        trade: "",
        district: "",
        upazila: "",
        village: "",
        motherName: "",
        motherPhone: "",
        fatherName: "",
        fatherPhone: "",
        gpa: "",
        photoName: "",
        photoUrl: "",
        photoDataUrl: "",
        message: ""
      });

      if (photoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
      setPhotoPreview("");
    } catch (error) {
      setStatus({
        type: "error",
        text: error?.message || "বার্তা পাঠানো যায়নি। আবার চেষ্টা করুন।"
      });
      setPopup({
        open: true,
        title: "ব্যর্থ",
        text: error?.message || "বার্তা পাঠানো যায়নি। আবার চেষ্টা করুন।"
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#DDF3FF] px-6 py-20 text-[#123B4A] md:px-20">
      <motion.div
        className="max-w-4xl mx-auto text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl font-bold text-[#123B4A]">যোগাযোগ করুন</h1>
        <p className="mt-4 text-[#123B4A]">
          নিচের ফর্ম পূরণ করে বার্তা পাঠান। আমরা এসএমএস এবং ইমেইলে নোটিফিকেশন পাব।
        </p>
      </motion.div>

      <motion.form
        className="mx-auto mb-12 max-w-4xl rounded-2xl border border-[#A9D4DE] bg-[#EAFBFF] p-6 shadow-sm md:p-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        onSubmit={handleSubmit}
      >
        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="আপনার নাম"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full rounded-lg border border-[#A9D4DE] bg-[#EAFBFF] px-4 py-3 text-sm text-[#123B4A] outline-none focus:border-[#4FBBC6]"
            required
          />
          <input
            type="email"
            placeholder="আপনার ইমেইল"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="w-full rounded-lg border border-[#A9D4DE] bg-[#EAFBFF] px-4 py-3 text-sm text-[#123B4A] outline-none focus:border-[#4FBBC6]"
          />
          <input
            type="number"
            placeholder="আপনার ফোন নম্বর"
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className="w-full rounded-lg border border-[#A9D4DE] bg-[#EAFBFF] px-4 py-3 text-sm text-[#123B4A] outline-none focus:border-[#4FBBC6] md:col-span-2"
          />

          <select
            value={form.trade}
            onChange={(e) => handleChange("trade", e.target.value)}
            className="w-full rounded-lg border border-[#A9D4DE] bg-[#EAFBFF] px-4 py-3 text-sm text-[#123B4A] outline-none focus:border-[#4FBBC6] md:col-span-2"
          >
            <option value="">ট্রেড নির্বাচন করুন</option>
            <option value="কম্পিউটারাইজড একাউন্টিং সিস্টেম">কম্পিউটারাইজড একাউন্টিং সিস্টেম</option>
            <option value="ফিনান্সিয়াল কাস্টমার সার্ভিসেস">ফিনান্সিয়াল কাস্টমার সার্ভিসেস</option>
            <option value="ডিজিটাল টেকনোলজি ইন বিজনেস">ডিজিটাল টেকনোলজি ইন বিজনেস</option>
            <option value="ই- মার্কেটিং">ই- মার্কেটিং</option>
            <option value="হিউম্যান রিসোর্স ম্যানেজমেন্ট">হিউম্যান রিসোর্স ম্যানেজমেন্ট</option>
          </select>

          <input
            type="text"
            placeholder="জেলা"
            value={form.district}
            onChange={(e) => handleChange("district", e.target.value)}
            className="w-full rounded-lg border border-[#A9D4DE] bg-[#EAFBFF] px-4 py-3 text-sm text-[#123B4A] outline-none focus:border-[#4FBBC6]"
          />
          <input
            type="text"
            placeholder="উপজেলা"
            value={form.upazila}
            onChange={(e) => handleChange("upazila", e.target.value)}
            className="w-full rounded-lg border border-[#A9D4DE] bg-[#EAFBFF] px-4 py-3 text-sm text-[#123B4A] outline-none focus:border-[#4FBBC6]"
          />
          <input
            type="text"
            placeholder="গ্রাম"
            value={form.village}
            onChange={(e) => handleChange("village", e.target.value)}
            className="w-full rounded-lg border border-[#A9D4DE] bg-[#EAFBFF] px-4 py-3 text-sm text-[#123B4A] outline-none focus:border-[#4FBBC6] md:col-span-2"
          />

          <input
            type="text"
            placeholder="মায়ের নাম"
            value={form.motherName}
            onChange={(e) => handleChange("motherName", e.target.value)}
            className="w-full rounded-lg border border-[#A9D4DE] bg-[#EAFBFF] px-4 py-3 text-sm text-[#123B4A] outline-none focus:border-[#4FBBC6]"
          />
          <input
            type="number"
            placeholder="মায়ের ফোন নম্বর"
            value={form.motherPhone}
            onChange={(e) => handleChange("motherPhone", e.target.value)}
            className="w-full rounded-lg border border-[#A9D4DE] bg-[#EAFBFF] px-4 py-3 text-sm text-[#123B4A] outline-none focus:border-[#4FBBC6]"
          />
          <input
            type="text"
            placeholder="বাবার নাম"
            value={form.fatherName}
            onChange={(e) => handleChange("fatherName", e.target.value)}
            className="w-full rounded-lg border border-[#A9D4DE] bg-[#EAFBFF] px-4 py-3 text-sm text-[#123B4A] outline-none focus:border-[#4FBBC6]"
          />
          <input
            type="number"
            placeholder="বাবার ফোন নম্বর"
            value={form.fatherPhone}
            onChange={(e) => handleChange("fatherPhone", e.target.value)}
            className="w-full rounded-lg border border-[#A9D4DE] bg-[#EAFBFF] px-4 py-3 text-sm text-[#123B4A] outline-none focus:border-[#4FBBC6]"
          />

          <input
            type="number"
            placeholder="জিপিএ"
            value={form.gpa}
            onChange={(e) => handleChange("gpa", e.target.value)}
            className="w-full rounded-lg border border-[#A9D4DE] bg-[#EAFBFF] px-4 py-3 text-sm text-[#123B4A] outline-none focus:border-[#4FBBC6]"
          />

          <div className="w-full">
            <label
              htmlFor="contact-photo-upload"
              className="inline-flex cursor-pointer items-center rounded-lg border border-[#A9D4DE] bg-[#EAFBFF] px-4 py-3 text-sm font-medium text-[#123B4A] hover:border-[#4FBBC6]"
            >
              আপনার ছবি দিন
            </label>
            <input id="contact-photo-upload" type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />
            <p className="mt-2 text-xs text-[#123B4A]">নির্বাচিত ছবি: {form.photoName || "প্রযোজ্য নয়"}</p>
          </div>
          <input
            type="url"
            placeholder="ছবির পাবলিক লিংক (এসএমএস ছবির জন্য)"
            value={form.photoUrl}
            onChange={(e) => handleChange("photoUrl", e.target.value)}
            className="w-full rounded-lg border border-[#A9D4DE] bg-[#EAFBFF] px-4 py-3 text-sm text-[#123B4A] outline-none focus:border-[#4FBBC6]"
          />

          {photoPreview && (
            <div className="md:col-span-2 overflow-hidden rounded-xl border border-[#A9D4DE] bg-white p-2">
              <img src={photoPreview} alt="ছবির প্রিভিউ" className="h-52 w-full rounded-lg object-cover" />
            </div>
          )}

          <textarea
            placeholder="আপনার বার্তা লিখুন"
            rows={5}
            value={form.message}
            onChange={(e) => handleChange("message", e.target.value)}
            className="w-full rounded-lg border border-[#A9D4DE] bg-[#EAFBFF] px-4 py-3 text-sm text-[#123B4A] outline-none focus:border-[#4FBBC6] md:col-span-2"
            required
          />
        </div>

        {status.text && (
          <p className={`mt-4 text-sm ${status.type === "success" ? "text-[#2F8FA8]" : "text-[#256D86]"}`}>
            {status.text}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit || isSending}
          className="mt-5 rounded-lg bg-[#4FBBC6] px-5 py-3 text-sm font-semibold text-[#123B4A] hover:bg-[#399CA8] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSending ? "পাঠানো হচ্ছে..." : "বার্তা পাঠান"}
        </button>
      </motion.form>

      {popup.open && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#123B4A]/35 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-[#A9D4DE] bg-[#EAFBFF] p-6 text-center shadow-2xl">
            <h3 className="text-xl font-semibold text-[#123B4A]">{popup.title}</h3>
            <p className="mt-3 text-sm text-[#123B4A]">{popup.text}</p>
            <button
              type="button"
              onClick={() => setPopup({ open: false, title: "", text: "" })}
              className="mt-5 rounded-lg bg-[#4FBBC6] px-5 py-2 text-sm font-semibold text-[#123B4A] hover:bg-[#399CA8]"
            >
              ঠিক আছে
            </button>
          </div>
        </div>
      )}

      <motion.div
        className="max-w-4xl mx-auto grid md:grid-cols-3 gap-10 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <a
          className="block rounded-2xl border border-[#A9D4DE] bg-[#EAFBFF] p-8 shadow-sm transition hover:shadow-md"
          href="tel:01722327556"
        >
          <FaPhone className="mx-auto mb-4 text-4xl text-[#4FBBC6]" />
          <h2 className="mb-2 text-xl font-semibold text-[#123B4A]">ফোন</h2>
          <p className="text-[#123B4A] transition hover:text-[#123B4A]">01722-327556</p>
        </a>

        <a
          href="https://wa.me/8801722327556"
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-2xl border border-[#A9D4DE] bg-[#EAFBFF] p-8 shadow-sm transition hover:shadow-md"
        >
          <FaWhatsapp className="mx-auto mb-4 text-4xl text-[#4FBBC6]" />
          <h2 className="mb-2 text-xl font-semibold text-[#123B4A]">হোয়াটসঅ্যাপ</h2>
          <p className="text-[#123B4A] transition hover:text-[#123B4A]">আমাদের সাথে চ্যাট করুন</p>
        </a>

        <a
          href="https://www.facebook.com/dhantec?__tn__=-UC*F"
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-2xl border border-[#A9D4DE] bg-[#EAFBFF] p-8 shadow-sm transition hover:shadow-md"
        >
          <FaFacebook className="mx-auto mb-4 text-4xl text-[#4FBBC6]" />
          <h2 className="mb-2 text-xl font-semibold text-[#123B4A]">ফেসবুক</h2>
          <p className="text-[#123B4A] transition hover:text-[#123B4A]">পেইজ ভিজিট করুন</p>
        </a>
      </motion.div>
    </main>
  );
}

