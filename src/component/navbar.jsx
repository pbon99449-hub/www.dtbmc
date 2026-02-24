"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiMenu, FiX } from "react-icons/fi";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Departments", path: "/Departments" },
  { name: "Teachers", path: "/teachers" },
  { name: "Notices", path: "/notices" },
  { name: "Gallery", path: "/gallery" },
  { name: "Letter Box", path: "/letter-box" },
  { name: "Contact", path: "/contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-500 ${
        scrolled || isOpen
          ? "bg-[#DDF3FF]/70 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center text-[#123B4A]">

        {/* Logo */}
        <Link href="/" className="text-2xl font-bold tracking-wide">
          DTBMC
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 items-center">
          {navLinks.map((link) => (
            <div key={link.path} className="relative group">
              <Link
                href={link.path}
                className={`transition ${
                  pathname === link.path
                    ? "text-[#2A7F9E]"
                    : "hover:text-[#2A7F9E]"
                }`}
              >
                {link.name}
              </Link>

              {/* Animated underline */}
              <span
                className={`absolute left-0 -bottom-1 h-[2px] bg-[#4FBBC6] transition-all duration-300 ${
                  pathname === link.path
                    ? "w-full"
                    : "w-0 group-hover:w-full"
                }`}
              ></span>
            </div>
          ))}
        </div>

        {/* Mobile Icon */}
        <div className="md:hidden z-[70]">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-nav"
            className="rounded-md p-1"
          >
            {isOpen ? <FiX size={26} /> : <FiMenu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close mobile menu backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[55] bg-[#123B4A]/30 md:hidden"
            />
            <motion.div
              id="mobile-nav"
              initial={{ y: "-100%", opacity: 0.95 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-100%", opacity: 0.95 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="fixed inset-x-0 top-0 z-[60] min-h-screen bg-[#DDF3FF] text-[#123B4A] px-6 pb-8 pt-6 shadow-2xl md:hidden"
            >
              <div className="mx-auto flex w-full max-w-md items-center">
                <Link href="/" onClick={() => setIsOpen(false)} className="text-4xl font-black tracking-tight text-[#123B4A]">
                  DTBMC
                </Link>
              </div>

              <div className="mx-auto mt-7 w-full max-w-md rounded-[26px] border border-[#A9D4DE] bg-[#EAFBFF] p-7 shadow-[0_12px_30px_rgba(18,59,74,0.16)]">
                <div className="flex flex-col gap-5">
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.path}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 + index * 0.04, duration: 0.22 }}
                    >
                      <Link
                        href={link.path}
                        onClick={() => setIsOpen(false)}
                        className={`text-xl font-extrabold uppercase tracking-wide transition ${
                          pathname === link.path ? "text-[#2A7F9E]" : "text-[#123B4A] hover:text-[#2A7F9E]"
                        }`}
                      >
                        {link.name}
                      </Link>
                    </motion.div>
                  ))}
                </div>

                <Link
                  href="/contact"
                  onClick={() => setIsOpen(false)}
                  className="mt-8 block rounded-xl bg-[#4FBBC6] px-5 py-4 text-center text-xl font-extrabold uppercase text-[#123B4A] transition hover:bg-[#399CA8]"
                >
                  Contact Us
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
