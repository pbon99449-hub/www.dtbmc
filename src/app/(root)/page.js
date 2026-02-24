"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import bannerimg from "../../../public/image/banners.jpg";
import principalimg from "../../../public/image/principal.png";
import LatestNoticesHome from "@/component/latestNoticesHome";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
};

export default function Home() {
  return (
    <main className="bg-[#DDF3FF] text-[#123B4A]">
      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <Image src={bannerimg} alt="College Campus" fill className="object-cover w-full" priority />
        <div className="absolute inset-0 bg-[#DDF3FF]/60" />
        <motion.div className="relative text-center px-6" initial="hidden" animate="visible" variants={fadeUp}>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            স্বাগতম <br /> ধানখালী টেকনিক্যাল অ্যান্ড বিএম কলেজ
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            মানসম্মত শিক্ষা ও উদ্ভাবনের মাধ্যমে মেধাবী ও দক্ষ তরুণ তৈরি করা।
          </p>
          <Link
            href="/contact"
            className="bg-[#4FBBC6] hover:bg-[#399CA8] px-6 py-3 rounded-lg text-lg font-semibold transition"
          >
            এখনই আবেদন করুন
          </Link>
        </motion.div>
      </section>

      {/* Latest Notices */}
      <section className="py-20 px-6 md:px-20 bg-[#EAFBFF]">
        <div className="max-w-6xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-[#2A7F9E]">সর্বশেষ বিজ্ঞপ্তি</h2>
        </div>
        <LatestNoticesHome />
      </section>

      {/* Principal Message */}
      <section className="py-20 px-6 md:px-20 bg-[#EAFBFF]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <Image src={principalimg} alt="Principal" width={500} height={500} className="rounded-2xl shadow-lg" />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <h2 className="text-3xl font-bold mb-6 text-[#2A7F9E]">প্রধান শিক্ষকের বার্তা</h2>
            <p className="text-[#123B4A] leading-relaxed mb-6">
              আমাদের লক্ষ্য হলো উচ্চমানের কারিগরি শিক্ষা প্রদান করা যা শিক্ষার্থীদের তাদের ক্যারিয়ার এবং জীবনে সফল হতে
              সাহায্য করে। আমরা শৃঙ্খলা, উদ্ভাবন এবং উৎকর্ষতায় বিশ্বাস করি।
            </p>
            <Link href="/about" className="text-[#2A7F9E] font-semibold hover:underline">
              আরও পড়ুন →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Departments */}
      <section className="py-20 px-6 md:px-20 bg-[#D8F3F0]">
        <div className="max-w-6xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-[#2A7F9E]">আমাদের বিভাগ</h2>
          <p className="text-[#123B4A] mt-4">আমাদের একাডেমিক বিভাগ এবং প্রোগ্রামগুলি ঘুরে দেখুন</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {["কম্পিউটার প্রযুক্তি", "ব্যবসা ব্যবস্থাপনা", "মানব সম্পদ"].map((dept, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="bg-[#EAFBFF] p-8 rounded-2xl shadow hover:shadow-xl transition"
            >
              <h3 className="text-xl font-semibold mb-4 text-[#2A7F9E]">{dept}</h3>
              <p className="text-[#123B4A] mb-6">ভবিষ্যতের সাফল্যের জন্য তৈরি উচ্চমানের পাঠ্যক্রম।</p>
              <Link href="/Departments" className="text-[#2A7F9E] font-semibold hover:underline">
                আরও জানুন →
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-[#4FBBC6] text-[#123B4A] text-center px-6">
        <h2 className="text-3xl font-bold mb-6">আপনার যাত্রা শুরু করতে প্রস্তুত?</h2>
        <Link
          href="/contact"
          className="bg-[#EAFBFF] text-[#2A7F9E] px-6 py-3 rounded-lg font-semibold hover:bg-[#CDEFF2] transition"
        >
          আমাদের সাথে যোগাযোগ করুন
        </Link>
      </section>
    </main>
  );
}
