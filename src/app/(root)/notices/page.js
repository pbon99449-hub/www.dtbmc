"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const notices = [
  {
    id: "board-results-main",
    title: "বাংলাদেশ শিক্ষা বোর্ড ফলাফল",
    date: "অফিশিয়াল রেজাল্ট পোর্টাল",
    description:
      "এসএসসি, এইচএসসি ও সমমান পরীক্ষার ফলাফল দেখতে অফিসিয়াল শিক্ষা বোর্ড ওয়েবসাইটে প্রবেশ করুন।",
    url: "https://moedu.gov.bd/",
    cta: "ওয়েবসাইটে যান →",
  },
  {
    id: "barisal-board-portal",
    title: "বরিশাল বোর্ড অফিসিয়াল পোর্টাল",
    date: "বোর্ড নোটিশ ও সেবা",
    description:
      "বরিশাল শিক্ষা বোর্ডের নোটিশ, বিজ্ঞপ্তি ও বিভিন্ন অনলাইন সেবার জন্য অফিসিয়াল পোর্টাল ভিজিট করুন।",
    url: "https://barisalboard.portal.gov.bd",
    cta: "ওয়েবসাইটে যান →",
  },
  {
    id: "board-results-quick",
    title: "রেজাল্ট দেখার দ্রুত লিংক",
    date: "বাংলাদেশ শিক্ষা বোর্ড ফলাফল",
    description:
      "ফলাফল দেখতে সরাসরি শিক্ষা বোর্ডের সাইটে যেতে এই লিংকটি ব্যবহার করতে পারেন।",
    url: "http://www.educationboardresults.gov.bd/",
    cta: "রেজাল্ট দেখুন →",
  },
];

export default function Notices() {
  return (
    <main className="bg-[#DDF3FF] text-[#123B4A] py-20 px-6 md:px-20">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold text-[#2A7F9E]">সর্বশেষ বিজ্ঞপ্তি</h1>
        <p className="text-[#123B4A] mt-4">
          গুরুত্বপূর্ণ ওয়েবসাইটে দ্রুত যেতে নিচের লিংকগুলো ব্যবহার করুন
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {notices.map((notice, index) => (
          <motion.div
            key={notice.id}
            whileHover={{ scale: 1.03 }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            className="bg-[#EAFBFF] p-8 rounded-2xl shadow hover:shadow-xl transition"
          >
            <h2 className="text-xl font-semibold mb-2 text-[#2A7F9E]">
              {notice.title}
            </h2>
            <p className="text-[#123B4A] text-sm mb-4">{notice.date}</p>
            <p className="text-[#123B4A] mb-4">{notice.description}</p>
            <Link
              href={notice.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#2A7F9E] font-semibold hover:underline"
            >
              {notice.cta}
            </Link>
          </motion.div>
        ))}
      </div>
    </main>
  );
}
