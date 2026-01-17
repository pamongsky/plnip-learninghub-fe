'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pln-primary rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">⚡</span>
            </div>
            <span className="text-xl font-bold text-gray-900">PLN Learning Hub</span>
          </div>
          <div className="flex gap-3">
            <Link href="/login" className="px-5 py-2 text-pln-primary font-semibold hover:bg-gray-50 rounded-lg transition text-sm">
              Login
            </Link>
            <Link href="/login" className="px-5 py-2 bg-pln-primary text-white font-semibold rounded-lg hover:bg-pln-dark transition text-sm">
              Mulai Belajar
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-24 pb-32 lg:pt-32 lg:pb-40 overflow-hidden bg-pln-primary">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-pln-primary via-pln-primary/80 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center lg:text-left">
          <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/20 text-pln-light text-[10px] font-bold tracking-widest mb-4 backdrop-blur-md uppercase">
            Corporate University
          </span>

          <h1 className="text-4xl lg:text-6xl font-extrabold text-white tracking-tight mb-4 leading-tight">
            Building Energy <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pln-light to-white">Heroes of Tomorrow</span>
          </h1>

          <p className="max-w-lg text-base text-gray-200 mb-8 leading-relaxed lg:mx-0 mx-auto font-light">
            Platform pengembangan kompetensi terintegrasi. Wujudkan talenta PLN yang unggul, inovatif, dan siap menghadapi transisi energi global.
          </p>

          <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
            <Link href="/login" className="px-6 py-3 bg-pln-light text-white font-bold rounded-xl shadow-lg hover:bg-white hover:text-pln-primary transition transform hover:-translate-y-0.5 text-sm">
              Mulai Belajar
            </Link>
            <a href="#about" className="px-6 py-3 border border-white text-white font-bold rounded-xl hover:bg-white/10 transition text-sm">
              Pelajari Lebih Lanjut
            </a>
          </div>
        </div>
      </div>

      {/* Features Cards */}
      <div className="relative z-20 max-w-6xl mx-auto px-6 -mt-20 mb-16">
        <div className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-pln-light grid md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="group p-3 hover:bg-gray-50 rounded-lg transition">
            <div className="w-10 h-10 bg-pln-light/10 text-pln-light rounded-lg flex items-center justify-center text-xl mb-3">📚</div>
            <h3 className="text-lg font-bold text-gray-900">Digital Learning</h3>
            <p className="text-gray-500 text-xs mt-1 leading-relaxed">Ribuan modul teknis & non-teknis yang dapat diakses kapan saja.</p>
          </div>
          <div className="group p-3 hover:bg-gray-50 rounded-lg transition">
            <div className="w-10 h-10 bg-pln-light/10 text-pln-light rounded-lg flex items-center justify-center text-xl mb-3">🎖️</div>
            <h3 className="text-lg font-bold text-gray-900">Sertifikasi</h3>
            <p className="text-gray-500 text-xs mt-1 leading-relaxed">Uji kompetensi terstandarisasi untuk jenjang karir yang jelas.</p>
          </div>
          <div className="group p-3 hover:bg-gray-50 rounded-lg transition">
            <div className="w-10 h-10 bg-pln-light/10 text-pln-light rounded-lg flex items-center justify-center text-xl mb-3">🤖</div>
            <h3 className="text-lg font-bold text-gray-900">AI Mentor</h3>
            <p className="text-gray-500 text-xs mt-1 leading-relaxed">Bantuan belajar personal dengan teknologi Generative AI.</p>
          </div>
        </div>
      </div>

      {/* About Section */}
      <section id="about" className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="absolute -inset-3 bg-pln-light/20 rounded-2xl transform rotate-2"></div>
            <div className="relative rounded-2xl shadow-xl bg-gray-200 h-80 flex items-center justify-center">
              <span className="text-6xl">👥</span>
            </div>
            <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-lg shadow-lg border-l-4 border-pln-primary">
              <p className="text-2xl font-bold text-pln-primary">78+</p>
              <p className="text-gray-500 text-xs font-medium">Tahun Menerangi Negeri</p>
            </div>
          </div>
          <div>
            <h2 className="text-pln-light font-bold tracking-wider uppercase text-xs mb-2">Tentang Learning Hub</h2>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Mencetak SDM Unggul</h3>
            <p className="text-gray-600 text-base mb-6 leading-relaxed">
              PLN Learning Hub bukan sekadar tempat belajar, melainkan ekosistem pertumbuhan. Kami menghubungkan karyawan dengan pengetahuan terkini, mentor ahli, dan teknologi masa depan.
            </p>
            <div className="grid grid-cols-2 gap-6 mt-6">
              <div>
                <h4 className="text-2xl font-bold text-pln-primary">50k+</h4>
                <p className="text-gray-500 text-sm">Talenta Aktif</p>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-pln-primary">1.2k</h4>
                <p className="text-gray-500 text-sm">Modul Pembelajaran</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900">Didukung Manajemen</h2>
          <p className="text-gray-500 text-sm mt-2">Komitmen pimpinan dalam pengembangan human capital PLN.</p>
        </div>
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { name: 'Darmawan Prasodjo', title: 'Direktur Utama' },
            { name: 'Yusuf Didi Setiarto', title: 'Dir. Legal & HC' },
            { name: 'Edi Srimulyanti', title: 'Dir. Retail' },
            { name: 'Adi Lumakso', title: 'Dir. Pembangkitan' }
          ].map((leader, idx) => (
            <div key={idx} className="group text-center">
              <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-gray-100 group-hover:border-pln-light transition duration-300 bg-pln-primary flex items-center justify-center">
                <span className="text-4xl text-white">{leader.name.charAt(0)}</span>
              </div>
              <h3 className="mt-4 text-base font-bold text-gray-900">{leader.name}</h3>
              <p className="text-pln-light text-xs font-medium">{leader.title}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI Assistant Section */}
      <section className="py-16 bg-gray-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-pln-primary/20 blur-[80px]"></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="md:w-1/2">
            <span className="px-3 py-1 rounded-full bg-pln-light/20 text-pln-light border border-pln-light/30 text-[10px] font-bold uppercase tracking-wider">
              Powered by Gemini AI
            </span>
            <h2 className="text-3xl font-bold text-white mt-4 mb-4">Asisten Belajar Pribadi</h2>
            <p className="text-gray-400 text-base mb-6 leading-relaxed">
              Bingung materi teknis? Tanyakan pada AI Chatbot kami. Dapatkan ringkasan materi dan rekomendasi karir secara instan.
            </p>
            <Link href="/login" className="inline-flex items-center gap-2 bg-white text-gray-900 px-5 py-2.5 rounded-full text-sm font-bold hover:bg-gray-100 transition">
              <span>Coba Chatbot</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
          <div className="md:w-1/2 w-full">
            <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 shadow-xl max-w-sm ml-auto">
              <div className="space-y-3 text-xs">
                <div className="bg-gray-700 p-3 rounded-lg rounded-tl-none text-gray-200 inline-block">
                  Halo! Ada yang bisa saya bantu tentang materi Transmisi?
                </div>
                <div className="bg-pln-primary p-3 rounded-lg rounded-tr-none text-white inline-block ml-auto block text-right w-full">
                  <span className="inline-block">Jelaskan fungsi Gardu Induk.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-12 bg-gray-50 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-gray-400 text-[10px] font-bold tracking-widest uppercase mb-6">Partner Institusi</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 opacity-60 grayscale hover:grayscale-0 transition duration-500">
            <div className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span className="text-pln-primary text-2xl">⚡</span> PLN Udiklat
            </div>
            <div className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span className="text-blue-600 text-2xl">🎓</span> Kemendikbud
            </div>
            <div className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span className="text-orange-500 text-2xl">☁️</span> Oracle Cloud
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 bg-pln-primary rounded-lg flex items-center justify-center">
              <span className="text-white text-lg font-bold">⚡</span>
            </div>
            <span className="text-lg font-bold text-white">PLN Learning Hub</span>
          </div>
          <p className="text-sm mb-2">PT PLN (Persero) - Indonesia Power</p>
          <p className="text-xs">© 2026 All rights reserved.</p>
        </div>
      </footer>

      {/* Floating Chat Button */}
      <Link href="/login" className="fixed bottom-6 right-6 z-50 bg-pln-light hover:bg-pln-primary text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition hover:scale-110">
        <span className="text-2xl">💬</span>
      </Link>
    </div>
  );
}
