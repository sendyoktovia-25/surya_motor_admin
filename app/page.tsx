"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PHONE_NUMBER = "6282286515176";
const WHATSAPP_LINK = `https://api.whatsapp.com/send?phone=${PHONE_NUMBER}&text=Halo%20saya%20minat%20motor%20bekas%20di%20Batam`;

const TESTIMONIALS = [
  {
    initial: "A",
    name: "Agus Prasetyo",
    role: "Pembeli Motor NMAX",
    text: "Pelayanan cepat dan motor dalam kondisi sangat baik. Proses administrasi juga rapi. Sangat puas dan tidak kecewa!",
    stars: 5,
  },
  {
    initial: "S",
    name: "Siti Rahayu",
    role: "Pembeli Motor Aerox",
    text: "Harga transparan dan nego fleksibel. Motor yang saya beli sesuai ekspektasi. Terima kasih Surya Jaya Motor!",
    stars: 5,
  },
  {
    initial: "R",
    name: "Rudi Hartono",
    role: "Pembeli Motor Vario",
    text: "Rekomendasi untuk yang cari motor bekas. Test ride dan cek kondisi dibuat mudah. Pelayanan ramah.",
    stars: 5,
  },
  {
    initial: "D",
    name: "Diana Kusuma",
    role: "Pembeli Motor Beat",
    text: "Prosesnya mudah dan cepat. Surat-surat lengkap, tidak ada masalah. Mau beli lagi kalau butuh motor.",
    stars: 5,
  },
  {
    initial: "H",
    name: "Hendra Wijaya",
    role: "Pembeli Motor PCX",
    text: "Motor bekas tapi kondisi prima. Harga sesuai pasaran bahkan lebih murah. Sangat worth it!",
    stars: 5,
  },
  {
    initial: "F",
    name: "Fitri Anggraini",
    role: "Pembeli Motor Scoopy",
    text: "Staff yang membantu sangat ramah dan informatif. Tidak ada tekanan, bisa milih santai. Top!",
    stars: 5,
  },
];

const FEATURES = [
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    title: "Kondisi Terverifikasi",
    desc: "Setiap motor melewati pengecekan menyeluruh sebelum dipasarkan.",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    title: "Surat Lengkap",
    desc: "BPKB dan STNK resmi, proses balik nama dibantu hingga selesai.",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    title: "Harga Transparan",
    desc: "Tidak ada biaya tersembunyi. Harga terbaik, nego langsung.",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
    title: "Proses Cepat",
    desc: "Transaksi selesai dalam hitungan jam, tanpa antri panjang.",
  },
];

const TOTAL_PAGES = Math.ceil(TESTIMONIALS.length / 3);

const GALLERY_IMAGES = [
  { src: "/testimony/testimoni-1.jpeg", alt: "Pelanggan 1" },
  { src: "/testimony/testimoni-2.jpeg", alt: "Pelanggan 2" },
  { src: "/testimony/testimoni-3.jpeg", alt: "Pelanggan 3" },
  { src: "/testimony/testimoni-4.jpeg", alt: "Pelanggan 4" },
  { src: "/testimony/testimoni-5.jpeg", alt: "Pelanggan 5" },
];

const NAV_ITEMS = [
  { label: "Beranda", href: "#hero" },
  { label: "Tentang", href: "#tentang" },
  { label: "Testimoni", href: "#testimoni" },
  { label: "Galeri", href: "#galeri" },
  { label: "Kontak", href: "#kontak" },
];

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [testimonialPage, setTestimonialPage] = useState(0);
  const [testimonialDir, setTestimonialDir] = useState(1);

  const goToPage = useCallback((newPage: number, dir: number) => {
    setTestimonialDir(dir);
    setTestimonialPage(newPage);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    // Add delay to allow menu animation to complete before scrolling
    setTimeout(() => {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }, 300);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      goToPage((testimonialPage + 1) % TOTAL_PAGES, 1);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonialPage, goToPage]);

  return (
    <main className="min-h-screen bg-white text-gray-900 scroll-smooth">
      {/* ── Sticky Header with Navigation ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          mobileMenuOpen || scrolled
            ? "bg-white/95 backdrop-blur-md shadow-md"
            : "bg-transparent"
        }`}>
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Image
                src="/sjm_logo.png"
                alt="Logo Surya Jaya Motor"
                width={42}
                height={42}
                className="object-contain"
              />
              <span
                className={`text-lg font-bold transition-colors duration-300 ${
                  mobileMenuOpen || scrolled ? "text-gray-900" : "text-white"
                }`}>
                Surya Jaya Motor
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className={`text-sm font-medium transition-colors duration-300 hover:text-yellow-500 ${
                    scrolled ? "text-gray-700" : "text-white/80"
                  }`}>
                  {item.label}
                </button>
              ))}
            </nav>

            {/* CTA & Mobile Menu */}
            <div className="flex items-center gap-4">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2.5 rounded-full transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12.003 2C6.477 2 2 6.477 2 12.003c0 1.89.502 3.663 1.377 5.197L2.004 22l4.946-1.353A9.98 9.98 0 0 0 12.003 22C17.53 22 22 17.523 22 12.003 22 6.477 17.53 2 12.003 2zm0 18.003a7.983 7.983 0 0 1-4.334-1.279l-.31-.184-3.244.884.855-3.164-.202-.325A7.957 7.957 0 0 1 4 12.003C4 7.58 7.58 4 12.003 4c4.424 0 8.003 3.58 8.003 8.003 0 4.424-3.579 8-8.003 8z" />
                </svg>
                <span className="hidden sm:inline">Hubungi</span>
              </a>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg transition-colors"
                aria-label="Toggle menu">
                {mobileMenuOpen ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`w-6 h-6 transition-colors text-black`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}>
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`w-6 h-6 transition-colors ${
                      scrolled ? "text-gray-900" : "text-white"
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}>
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.nav
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="md:hidden mt-4 pb-4">
                <div className="flex flex-col gap-3 pt-4">
                  {NAV_ITEMS.map((item) => (
                    <button
                      key={item.href}
                      onClick={() => handleNavClick(item.href)}
                      className="text-left px-4 py-2 rounded-lg text-gray-700 hover:bg-yellow-100 hover:text-yellow-700 transition-colors font-medium">
                      {item.label}
                    </button>
                  ))}
                  <a
                    href={WHATSAPP_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold transition-colors">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                      <path d="M12.003 2C6.477 2 2 6.477 2 12.003c0 1.89.502 3.663 1.377 5.197L2.004 22l4.946-1.353A9.98 9.98 0 0 0 12.003 22C17.53 22 22 17.523 22 12.003 22 6.477 17.53 2 12.003 2zm0 18.003a7.983 7.983 0 0 1-4.334-1.279l-.31-.184-3.244.884.855-3.164-.202-.325A7.957 7.957 0 0 1 4 12.003C4 7.58 7.58 4 12.003 4c4.424 0 8.003 3.58 8.003 8.003 0 4.424-3.579 8-8.003 8z" />
                    </svg>
                    Hubungi via WhatsApp
                  </a>
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section
        id="hero"
        className="relative min-h-screen flex items-center overflow-hidden bg-linear-to-br from-gray-950 via-gray-900 to-gray-800 scroll-mt-24">
        {/* decorative blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-yellow-500 rounded-full opacity-20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-amber-600 rounded-full opacity-20 blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-28 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}>
            <span className="inline-block bg-yellow-500/20 text-yellow-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-5 tracking-wide">
              #1 Motor Bekas Terpercaya di Batam
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
              Motor Bekas Berkualitas,{" "}
              <span className="text-yellow-400">Harga Terbaik</span>
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed mb-8">
              Kondisi terverifikasi, surat lengkap, proses cepat — siap test
              ride dan nego. Temukan motor impian Anda sekarang.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href={`https://api.whatsapp.com/send?phone=${PHONE_NUMBER}&text=Halo%20saya%20minat%20motor%20bekas%20di%20Batam`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-7 py-3.5 rounded-full transition-colors shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12.003 2C6.477 2 2 6.477 2 12.003c0 1.89.502 3.663 1.377 5.197L2.004 22l4.946-1.353A9.98 9.98 0 0 0 12.003 22C17.53 22 22 17.523 22 12.003 22 6.477 17.53 2 12.003 2zm0 18.003a7.983 7.983 0 0 1-4.334-1.279l-.31-.184-3.244.884.855-3.164-.202-.325A7.957 7.957 0 0 1 4 12.003C4 7.58 7.58 4 12.003 4c4.424 0 8.003 3.58 8.003 8.003 0 4.424-3.579 8-8.003 8z" />
                </svg>
                Hubungi via WhatsApp
              </a>
            </div>

            <div className="flex items-center gap-8 mt-10">
              <div>
                <p className="text-2xl font-extrabold text-white">200+</p>
                <p className="text-gray-400 text-sm">Motor Terjual</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div>
                <p className="text-2xl font-extrabold text-white">5 ★</p>
                <p className="text-gray-400 text-sm">Rating Pelanggan</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div>
                <p className="text-2xl font-extrabold text-white">100%</p>
                <p className="text-gray-400 text-sm">Terpercaya</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative hidden lg:flex items-center justify-center">
            <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
              <Image
                src="/hero.jpeg"
                alt="Motor Bekas Batam"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-gray-950/50 to-transparent" />
            </div>
          </motion.div>
        </div>

        {/* wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 80L1440 80L1440 40C1200 80 960 0 720 40C480 80 240 0 0 40L0 80Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              Kenapa Memilih Kami?
            </h2>
            <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
              Kami berkomitmen memberikan layanan terbaik dengan harga
              transparan dan proses yang cepat.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex flex-col items-center text-center p-6 rounded-2xl bg-gray-50 hover:bg-yellow-50 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-yellow-100 group-hover:bg-yellow-200 flex items-center justify-center text-yellow-600 mb-4 transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About Us ── */}
      <section id="tentang" className="py-20 bg-gray-50 scroll-mt-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative">
              <div className="relative w-full aspect-square max-w-sm mx-auto lg:mx-0">
                <div className="absolute inset-0 bg-yellow-400 rounded-3xl rotate-3 opacity-20" />
                <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden p-12 flex items-center justify-center">
                  <Image
                    src="/sjm_logo.png"
                    alt="Surya Jaya Motor"
                    width={220}
                    height={220}
                    className="object-contain"
                  />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}>
              <span className="text-yellow-600 font-semibold text-sm uppercase tracking-widest">
                Tentang Kami
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-3 mb-6 leading-tight">
                Dipercaya Ratusan Pelanggan di Batam
              </h2>
              <p className="text-gray-600 leading-relaxed mb-8">
                <strong>Surya Jaya Motor</strong> adalah usaha yang bergerak di
                bidang jual dan beli sepeda motor bekas dengan kualitas
                terjamin. Kami menyediakan berbagai pilihan motor yang telah
                melalui proses pengecekan sehingga aman, layak pakai, dan sesuai
                kebutuhan pelanggan.
              </p>

              <div className="space-y-5">
                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center text-yellow-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24">
                      <path d="M12 2a1 1 0 0 1 .894.553l2.382 4.764 5.26.765a1 1 0 0 1 .555 1.705l-3.806 3.71.898 5.235a1 1 0 0 1-1.451 1.054L12 18.897l-4.732 2.938a1 1 0 0 1-1.451-1.054l.898-5.235L2.909 9.787a1 1 0 0 1 .555-1.705l5.26-.765L11.106 2.553A1 1 0 0 1 12 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Visi</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Menjadi usaha penjualan sepeda motor bekas yang terpercaya
                      dan profesional di Batam.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center text-yellow-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Misi</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Menyediakan motor bekas berkualitas, pelayanan profesional
                      dan transparan, serta membantu pelanggan mendapatkan motor
                      yang sesuai kebutuhan dengan harga terbaik.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Testimony ── */}
      <section id="testimoni" className="py-20 bg-yellow-50 scroll-mt-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-yellow-600 font-semibold text-sm uppercase tracking-widest">
              Testimoni
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-3">
              Apa Kata Pelanggan Kami?
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              Kepuasan pelanggan adalah prioritas utama kami. Berikut pengalaman
              mereka bersama Surya Jaya Motor.
            </p>
          </div>

          {/* Carousel */}
          <div className="relative px-8">
            <div className="overflow-hidden">
              <AnimatePresence mode="wait" custom={testimonialDir}>
                <motion.div
                  key={testimonialPage}
                  custom={testimonialDir}
                  variants={{
                    enter: (d: number) => ({
                      x: d > 0 ? "100%" : "-100%",
                      opacity: 0,
                    }),
                    center: { x: 0, opacity: 1 },
                    exit: (d: number) => ({
                      x: d > 0 ? "-100%" : "100%",
                      opacity: 0,
                    }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.45, ease: "easeInOut" }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {TESTIMONIALS.slice(
                    testimonialPage * 3,
                    testimonialPage * 3 + 3,
                  ).map((t, i) => (
                    <blockquote
                      key={i}
                      className="bg-white rounded-2xl p-6 border border-yellow-100 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                      <div className="flex gap-1 mb-4">
                        {Array.from({ length: t.stars }).map((_, s) => (
                          <svg
                            key={s}
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4 text-yellow-400"
                            viewBox="0 0 24 24"
                            fill="currentColor">
                            <path d="M12 2a1 1 0 0 1 .894.553l2.382 4.764 5.26.765a1 1 0 0 1 .555 1.705l-3.806 3.71.898 5.235a1 1 0 0 1-1.451 1.054L12 18.897l-4.732 2.938a1 1 0 0 1-1.451-1.054l.898-5.235L2.909 9.787a1 1 0 0 1 .555-1.705l5.26-.765L11.106 2.553A1 1 0 0 1 12 2z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed mb-5 flex-1">
                        &ldquo;{t.text}&rdquo;
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-gray-900 font-bold text-sm shrink-0">
                          {t.initial}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">
                            {t.name}
                          </p>
                          <p className="text-xs text-gray-500">{t.role}</p>
                        </div>
                      </div>
                    </blockquote>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Prev button */}
            <button
              onClick={() =>
                goToPage((testimonialPage - 1 + TOTAL_PAGES) % TOTAL_PAGES, -1)
              }
              className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-gray-600 hover:bg-yellow-400 hover:text-gray-900 hover:border-yellow-400 transition-colors"
              aria-label="Previous">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* Next button */}
            <button
              onClick={() => goToPage((testimonialPage + 1) % TOTAL_PAGES, 1)}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-gray-600 hover:bg-yellow-400 hover:text-gray-900 hover:border-yellow-400 transition-colors"
              aria-label="Next">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            {/* Dot indicators */}
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: TOTAL_PAGES }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToPage(i, i > testimonialPage ? 1 : -1)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    i === testimonialPage
                      ? "bg-yellow-500 w-7"
                      : "bg-gray-300 hover:bg-gray-400 w-2.5"
                  }`}
                  aria-label={`Page ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Gallery Section ── */}
      <section id="galeri" className="py-20 bg-white scroll-mt-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-yellow-600 font-semibold text-sm uppercase tracking-widest">
              Galeri
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-3">
              Momen Pelanggan Kami
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              Lihat kepuasan pelanggan kami melalui momen-momen berbahagia saat
              menerima motor pilihan mereka.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
            {GALLERY_IMAGES.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="relative group overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-shadow">
                <div className="relative w-full aspect-square">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="absolute inset-0 bg-yellow-500/0 group-hover:bg-yellow-500/20 transition-colors duration-300" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section
        id="kontak"
        className="bg-linear-to-r from-yellow-400 to-amber-500 py-16 scroll-mt-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            Siap Cari Motor Impian Anda?
          </h2>
          <p className="text-gray-900/70 mb-8">
            Hubungi kami sekarang dan temukan motor bekas terbaik di Batam
            dengan harga terjangkau.
          </p>
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold px-8 py-4 rounded-full transition-colors shadow-lg text-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12.003 2C6.477 2 2 6.477 2 12.003c0 1.89.502 3.663 1.377 5.197L2.004 22l4.946-1.353A9.98 9.98 0 0 0 12.003 22C17.53 22 22 17.523 22 12.003 22 6.477 17.53 2 12.003 2zm0 18.003a7.983 7.983 0 0 1-4.334-1.279l-.31-.184-3.244.884.855-3.164-.202-.325A7.957 7.957 0 0 1 4 12.003C4 7.58 7.58 4 12.003 4c4.424 0 8.003 3.58 8.003 8.003 0 4.424-3.579 8-8.003 8z" />
            </svg>
            Hubungi via WhatsApp
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-10 border-b border-gray-700">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src="/sjm_logo.png"
                  alt="Surya Jaya Motor"
                  width={40}
                  height={40}
                  className="object-contain brightness-0 invert"
                />
                <span className="text-white font-bold text-lg">
                  Surya Jaya Motor
                </span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Dealer motor bekas terpercaya di Batam. Kondisi terverifikasi,
                surat lengkap, harga transparan.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">
                Lokasi & Jam Operasional
              </h4>
              <ul className="text-sm space-y-2 text-gray-400">
                <li>📍 Batu Aji SP Plaza Blok Mawar No. 36–37</li>
                <li>🗓️ Senin–Minggu (kecuali Jumat)</li>
                <li>🕘 09.00–19.00 WIB</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Hubungi Kami</h4>
              <ul className="text-sm space-y-2">
                <li>
                  <a
                    href={WHATSAPP_LINK}
                    className="text-gray-400 hover:text-gray-200">
                    📞 {PHONE_NUMBER}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <p>© 2026 Surya Jaya Motor. All rights reserved.</p>
            <Link
              href="/dashboard"
              className="text-gray-500 hover:text-gray-300 transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
