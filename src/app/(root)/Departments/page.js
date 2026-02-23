"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const departments = [
  {
    id: "cas",
    name: "কম্পিউটারাইজড একাউন্টিং সিস্টেম",
    description:
      "হিসাবরক্ষণ সফটওয়্যার, ভাউচার এন্ট্রি, রিপোর্ট প্রস্তুতকরণ এবং অফিস ফাইন্যান্স ম্যানেজমেন্টে হাতে-কলমে প্রশিক্ষণ।",
    duration: "২ বছর",
    yearInfo: "1st Year / 2nd Year",
    shift: "দিন",
    admission: "এসএসসি (যেকোনো গ্রুপ), ন্যূনতম GPA নীতিমালা অনুযায়ী",
    keySkills: ["Tally/Accounting Software", "Voucher Entry", "Ledger & Report", "Office Finance"],
    career: ["Accounts Assistant", "Junior Accountant", "Cash Section", "Office Executive"],
  },
  {
    id: "fcs",
    name: "ফিনান্সিয়াল কাস্টমার সার্ভিসেস",
    description:
      "ব্যাংকিং সেবা, গ্রাহক সহায়তা, লেনদেন প্রক্রিয়া ও কাস্টমার কমিউনিকেশনের বাস্তবভিত্তিক দক্ষতা উন্নয়ন।",
    duration: "২ বছর",
    yearInfo: "1st Year / 2nd Year",
    shift: "দিন",
    admission: "এসএসসি (যেকোনো গ্রুপ), ন্যূনতম GPA নীতিমালা অনুযায়ী",
    keySkills: ["Customer Handling", "Banking Basics", "Service Operations", "Communication"],
    career: ["Customer Service Rep", "Bank Support Staff", "Front Desk Executive", "Agent Banking Staff"],
  },
  {
    id: "dtb",
    name: "ডিজিটাল টেকনোলজি ইন বিজনেস",
    description:
      "ব্যবসায়িক কাজে ডিজিটাল টুলস, ডেটা ব্যবস্থাপনা, অনলাইন রিপোর্টিং ও অফিস অটোমেশনের ব্যবহার শেখানো হয়।",
    duration: "২ বছর",
    yearInfo: "1st Year / 2nd Year",
    shift: "দিন",
    admission: "এসএসসি (যেকোনো গ্রুপ), ন্যূনতম GPA নীতিমালা অনুযায়ী",
    keySkills: ["Digital Tools", "Business Data", "Office Automation", "Presentation & Reporting"],
    career: ["Business Support Staff", "Data Entry Executive", "Office IT Assistant", "Digital Operations"],
  },
  {
    id: "emarketing",
    name: "ই- মার্কেটিং",
    description:
      "সোশ্যাল মিডিয়া মার্কেটিং, অনলাইন ক্যাম্পেইন, কনটেন্ট প্রচার ও ডিজিটাল সেলস কৌশল নিয়ে প্র্যাকটিক্যাল শিক্ষা।",
    duration: "২ বছর",
    yearInfo: "1st Year / 2nd Year",
    shift: "দিন",
    admission: "এসএসসি (যেকোনো গ্রুপ), ন্যূনতম GPA নীতিমালা অনুযায়ী",
    keySkills: ["Social Media Marketing", "Campaign Setup", "Content Promotion", "Digital Sales"],
    career: ["Digital Marketing Assistant", "Social Media Executive", "Sales Support", "Freelance Marketer"],
  },
  {
    id: "hrm",
    name: "হিউম্যান রিসোর্স ম্যানেজমেন্ট",
    description:
      "রেক্রুটমেন্ট, কর্মী ব্যবস্থাপনা, উপস্থিতি-ছুটি রেকর্ড ও অফিস প্রশাসনিক কাজের ওপর দক্ষতা তৈরি করা হয়।",
    duration: "২ বছর",
    yearInfo: "1st Year / 2nd Year",
    shift: "দিন",
    admission: "এসএসসি (যেকোনো গ্রুপ), ন্যূনতম GPA নীতিমালা অনুযায়ী",
    keySkills: ["Recruitment Support", "Employee Records", "Office Administration", "Team Coordination"],
    career: ["HR Assistant", "Admin Assistant", "Front Desk Executive", "Office Coordinator"],
  },
];

export default function Departments() {
  return (
    <main className="bg-[#DDF3FF] px-6 py-20 text-[#123B4A] md:px-20">
      <section className="mx-auto mb-12 max-w-6xl text-center">
        <h1 className="text-4xl font-bold text-[#2A7F9E]">আমাদের বিভাগসমূহ</h1>
        <p className="mt-4 text-[#123B4A]">
          কারিগরি ও পেশাভিত্তিক শিক্ষার জন্য ট্রেডভিত্তিক কোর্স, ভর্তি যোগ্যতা এবং ভবিষ্যৎ ক্যারিয়ার সম্ভাবনা।
        </p>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 xl:grid-cols-3">
        {departments.map((dept, index) => (
          <motion.div
            key={dept.id}
            whileHover={{ scale: 1.03 }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="rounded-2xl border border-[#A9D4DE] bg-[#EAFBFF] p-8 shadow-sm transition hover:shadow-xl"
          >
            <h2 className="mb-4 text-xl font-semibold text-[#2A7F9E]">{dept.name}</h2>
            <p className="mb-4 text-[#123B4A]">{dept.description}</p>
            <p className="mb-2 text-sm">
              <span className="font-semibold">কোর্স মেয়াদ:</span> {dept.duration}
            </p>
            <p className="mb-2 text-sm">
              <span className="font-semibold">ইয়ার:</span> {dept.yearInfo}
            </p>
            <p className="mb-2 text-sm">
              <span className="font-semibold">শিফট:</span> {dept.shift}
            </p>
            <p className="mb-4 text-sm">
              <span className="font-semibold">ভর্তি যোগ্যতা:</span> {dept.admission}
            </p>

            <div className="mb-4">
              <h3 className="mb-2 text-sm font-semibold text-[#2A7F9E]">যা শিখবেন</h3>
              <div className="flex flex-wrap gap-2">
                {dept.keySkills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-[#D8F3F0] px-3 py-1 text-xs font-medium text-[#123B4A]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <h3 className="mb-2 text-sm font-semibold text-[#2A7F9E]">ক্যারিয়ার সুযোগ</h3>
              <p className="text-sm text-[#123B4A]">{dept.career.join(", ")}</p>
            </div>

            <Link href="/contact" className="font-semibold text-[#2A7F9E] hover:underline">
              ভর্তি তথ্য জানুন →
            </Link>
          </motion.div>
        ))}
      </section>
    </main>
  );
}
