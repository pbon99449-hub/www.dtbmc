"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import principalimg from '../../../../public/image/principal.png';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

export default function About() {
  return (
    <main className="bg-[#DDF3FF] text-[#123B4A]">

      {/* Hero Section */}
     <section className="relative h-[50vh] flex flex-col justify-center items-center bg-[#EAFBFF] px-4 text-center">
  <motion.h1
    className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#2A7F9E] leading-snug"
    initial="hidden"
    animate="visible"
    variants={fadeUp}
  >
    ধানখালী টেকনিক্যাল  অ্যান্ড বিএম কলেজ সম্পর্কে
  </motion.h1>
</section>


      {/* College History */}
      <section className="py-20 px-6 md:px-20 bg-[#D8F3F0]">
        <motion.div
          className="max-w-6xl mx-auto text-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl font-bold text-[#2A7F9E] mb-6">আমাদের ইতিহাস</h2>
          <p className="text-[#123B4A] leading-relaxed">
           ধানখালী টেকনিক্যাল অ্যান্ড বিএম কলেজ প্রতিষ্ঠিত হয়েছিল উন্নতমানের কারিগরি ও ব্যবসায়িক শিক্ষা প্রদানের লক্ষ্যে যাতে শিক্ষার্থীদের সফল ক্যারিয়ারের জন্য প্রয়োজনীয় দক্ষতা অর্জন করা যায়। বছরের পর বছর ধরে, আমাদের কলেজ উৎকর্ষতা, শৃঙ্খলা এবং উদ্ভাবনের জন্য পরিচিত একটি স্বনামধন্য প্রতিষ্ঠানে পরিণত হয়েছে।
          </p>
        </motion.div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-6 md:px-20 bg-[#EAFBFF]">
        <motion.div
          className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div>
            <h2 className="text-3xl font-bold text-[#2A7F9E] mb-6">মিশন</h2>
            <p className="text-[#123B4A] leading-relaxed">
             উচ্চমানের কারিগরি ও ব্যবসায়িক শিক্ষা প্রদান করা, যা শিক্ষার্থীদের উদ্ভাবনী, দক্ষ এবং সামাজিকভাবে দায়িত্বশীলভাবে কাজ করতে সক্ষম করে।
            </p>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-[#2A7F9E] mb-6">দৃষ্টি</h2>
            <p className="text-[#123B4A] leading-relaxed">
             শিক্ষাদান, গবেষণা এবং উদ্ভাবনে উৎকর্ষতার জন্য স্বীকৃত একটি শীর্ষস্থানীয় শিক্ষা প্রতিষ্ঠান হওয়া, যা শিক্ষার্থীদের বিশ্বব্যাপী চ্যালেঞ্জের জন্য প্রস্তুত করে।
            </p>
          </div>
        </motion.div>
      </section>

      {/* Principal Speech */}
      <section className="py-20 px-6 md:px-20 bg-[#D8F3F0]">
        <motion.div
          className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Image
            src={principalimg}
            alt="Principal"
            width={500}
            height={500}
            className="rounded-2xl shadow-lg"
          />
          <div>
            <h2 className="text-3xl font-bold text-[#2A7F9E] mb-6">প্রধান শিক্ষকের বার্তা</h2>
            <p className="text-[#123B4A] leading-relaxed mb-4">
             আমাদের লক্ষ্য হলো উৎকর্ষতা ও উদ্ভাবনের সংস্কৃতি গড়ে তোলা। আমরা শিক্ষার্থীদের কেবল একাডেমিকভাবেই নয়, নৈতিক ও সামাজিকভাবেও লালন-পালন করি, যাতে তারা আগামী দিনের দায়িত্বশীল ও দক্ষ নাগরিক হয়ে উঠতে পারে।
            </p>
            <p className="text-[#123B4A] leading-relaxed">
              আমাদের সাথে যোগ দিন এবং জ্ঞান, সৃজনশীলতা এবং শৃঙ্খলাকে মূল্য দেয় এমন একটি শিক্ষার পরিবেশের অংশ হয়ে উঠুন।
            </p>
          </div>
        </motion.div>
      </section>

      {/* Achievements */}
      <section className="py-20 px-6 md:px-20 bg-[#EAFBFF]">
        <motion.div
          className="max-w-6xl mx-auto text-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl font-bold text-[#2A7F9E] mb-12">অর্জন</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "৪০০০+ স্নাতক", desc: "সফলভাবে তাদের পড়াশোনা শেষ করেছে।" },
              { title: "১০+ পুরষ্কার", desc: "একাডেমিক শ্রেষ্ঠত্বের জন্য স্বীকৃত।" },
              { title: "৫টি বিভাগ", desc: "বিভিন্ন কোর্স এবং প্রোগ্রাম অফার করা হচ্ছে।" },
            ].map((item, index) => (
              <div key={index} className="bg-[#D8F3F0] p-6 rounded-2xl shadow hover:shadow-xl transition">
                <h3 className="text-xl font-semibold text-[#2A7F9E] mb-2">{item.title}</h3>
                <p className="text-[#123B4A]">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>
    </main>
  );
}
