"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaFacebookF,
  FaTwitter,
  FaYoutube,
  FaLinkedinIn,
} from "react-icons/fa";

const footerVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

export default function Footer() {
  return (
    <motion.footer
      variants={footerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="relative bg-gradient-to-t from-[#DDF3FF] via-[#EAFBFF] to-[#DDF3FF] text-[#123B4A] pt-20 pb-10 px-6 md:px-20"
    >
      {/* Top Grid */}
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10 border-b border-[#A9D4DE] pb-12">
        {/* College Info */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-[#2A7F9E]">
            ধানখালী টেকনিক্যাল অ্যান্ড বিএম কলেজ
          </h2>
          <p className="text-[#123B4A] leading-relaxed">
           শিক্ষার্থীদের মানসম্পন্ন কারিগরি শিক্ষার মাধ্যমে সক্ষম করে তোলা এবং উদ্ভাবন ও উৎকর্ষের মাধ্যমে ভবিষ্যতে সৃজনশীল ও দক্ষ মানুষ হিসেবে গড়ে তোলা।
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-3">
            {[
              { name: "About", path: "/about" },
              { name: "Departments", path: "/Departments" },
              { name: "Teachers", path: "/teachers" },
              { name: "Notices", path: "/notices" },
              { name: "Gallery", path: "/gallery" },
              { name: "Letter Box", path: "/letter-box" },
              { name: "Contact", path: "/contact" }
            ].map((item, index) => (
              <li key={index} className="group relative w-fit">
                <Link
                  href={item.path}
                  className="text-[#123B4A] hover:text-[#2A7F9E] transition"
                >
                  {item.name}
                </Link>
                <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-[#4FBBC6] transition-all duration-300 group-hover:w-full"></span>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Contact</h3>
          <p className="text-[#123B4A]">Dhankhali, Kalapara, Patuakhali</p>
          <p className="text-[#123B4A] mt-2">Email: dtc132636@gmail.com</p>
          <a className="text-[#123B4A] hover:text-[#2A7F9E] mt-2" href="tel:+8801722327556">Phone: +88 01722-327556</a>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
          <div className="flex gap-4 cursor-no-drop">
            {[FaFacebookF, FaTwitter, FaYoutube, FaLinkedinIn].map(
              (Icon, index) => (
                <motion.p
                  key={index}
                  href="#"
                  whileHover={{ scale: 1.2, y: -5 }}
                  whileTap={{ scale: 0.9 }}
                  className="bg-[#D8F3F0] p-3 rounded-full text-[#123B4A] hover:text-[#2A7F9E] transition  cursor-no-drop"
                >
                  <Icon />
                </motion.p>
              )
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="max-w-7xl mx-auto text-center pt-8 text-[#123B4A] text-sm">
        © {new Date().getFullYear()} Dhankhali Technical & BM College | Designed & Developed by Plabon
      </div>

      {/* Subtle Glow Effect */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#4FBBC6] to-transparent blur-sm opacity-60"></div>
    </motion.footer>
  );
}
