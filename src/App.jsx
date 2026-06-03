import React, { useState, useEffect } from 'react';
import { Search, AlertCircle, ArrowLeft, Award, FileText, ChevronDown, Printer, User, Loader2 } from 'lucide-react';

// URL Endpoint Google Apps Script (GAS)
const GAS_URL = "https://script.google.com/macros/s/AKfycbzw7YSzEo1KfUeOJtCZ3j6jsq1J4MJ-OQaMmqrNMnfLZxtKIO-yAsa1JdZ1-qIqJLA/exec";

export default function App() {
  const [view, setView] = useState('login'); // 'login' | 'result'
  const [inputNisn, setInputNisn] = useState('');
  const [inputTgl, setInputTgl] = useState('');
  const [error, setError] = useState('');
  const [student, setStudent] = useState(null);
  const [isTkaOpen, setIsTkaOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 
  const [isAnimating, setIsAnimating] = useState(false);

  // Injeksi Font Playfair Display & Animasi Custom
  useEffect(() => {
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes floatGlow {
        0% { transform: translate(0px, 0px) scale(1); opacity: 0.4; filter: blur(20px); }
        50% { transform: translate(-15px, 15px) scale(1.1); opacity: 0.8; filter: blur(25px); }
        100% { transform: translate(0px, 0px) scale(1); opacity: 0.4; filter: blur(20px); }
      }
      @keyframes floatGlowReverse {
        0% { transform: translate(0px, 0px) scale(1.1); opacity: 0.8; filter: blur(25px); }
        50% { transform: translate(15px, -15px) scale(1); opacity: 0.4; filter: blur(20px); }
        100% { transform: translate(0px, 0px) scale(1.1); opacity: 0.8; filter: blur(25px); }
      }
      .gold-glow-1 {
        animation: floatGlow 6s ease-in-out infinite;
      }
      .gold-glow-2 {
        animation: floatGlowReverse 7s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(fontLink);
      document.head.removeChild(style);
    };
  }, []);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (!inputNisn.trim() || !inputTgl.trim()) {
      setError('NISN dan Tanggal Lahir harus diisi.');
      return;
    }

    const cleanInputNisn = inputNisn.trim();
    const cleanInputTgl = inputTgl.trim().toLowerCase().replace(/\s+/g, ' ');

    setIsLoading(true);

    try {
      const response = await fetch(
        `${GAS_URL}?nisn=${encodeURIComponent(cleanInputNisn)}&tgl=${encodeURIComponent(cleanInputTgl)}`,
        {
          method: 'GET',
          redirect: 'follow'
        }
      );
      
      if (!response.ok) throw new Error('Jaringan bermasalah atau akses ditolak');
      
      const result = await response.json();

      if (result.status === 'success') {
        setStudent(result.data);
        setIsTkaOpen(false);
        triggerTransition('result');
      } else {
        setError(result.message || 'Data tidak ditemukan. Periksa kembali NISN dan Tanggal Lahir.');
      }
    } catch (err) {
      setError('Gagal menghubungi server. Pastikan koneksi internet stabil dan GAS merespons dengan benar.');
      console.error('Fetch Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setInputNisn('');
    setInputTgl('');
    triggerTransition('login');
  };

  const triggerTransition = (targetView) => {
    setIsAnimating(true);
    setTimeout(() => {
      setView(targetView);
      setIsAnimating(false);
    }, 400);
  };

  const handlePrint = () => {
    setIsTkaOpen(true);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // Helper untuk mengubah nama huruf besar (KAPITAL) menjadi huruf awal kapital saja (Title Case)
  // Agar kalimat deskripsi terlihat lebih ramah/tidak seperti berteriak.
  const toTitleCase = (str) => {
    if (!str) return '';
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Fungsi pembuat deskripsi dinamis
  const getDeskripsiKelulusan = () => {
    if (!student) return '';
    
    const isMatBaik = student.matKet.toLowerCase() === 'baik';
    const isBindBaik = student.bindKet.toLowerCase() === 'baik';
    const namaSiswa = toTitleCase(student.nama);

    if (isMatBaik && isBindBaik) {
      return `Alhamdulillah nilai ananda ${namaSiswa} sudah baik pada mata pelajaran Matematika dan Bahasa Indonesia. Barakallah, selamat atas kelulusannya.`;
    } else if (!isMatBaik && !isBindBaik) {
      return `Ananda ${namaSiswa} perlu motivasi pada mata pelajaran Matematika dan Bahasa Indonesia, semoga dapat meningkat di masa depan. Barakallah, selamat atas kelulusannya.`;
    } else if (isMatBaik && !isBindBaik) {
      return `Alhamdulillah nilai ananda ${namaSiswa} sudah baik pada mata pelajaran Matematika dan perlu motivasi pada mata pelajaran Bahasa Indonesia, semoga dapat meningkat di masa depan. Barakallah, selamat atas kelulusannya.`;
    } else {
      return `Alhamdulillah nilai ananda ${namaSiswa} sudah baik pada mata pelajaran Bahasa Indonesia dan perlu motivasi pada mata pelajaran Matematika, semoga dapat meningkat di masa depan. Barakallah, selamat atas kelulusannya.`;
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF7F0] text-[#3D2B00] font-sans flex items-center justify-center p-4 md:p-8 print:bg-white print:p-0 overflow-hidden relative">
      
      <div 
        className={`w-full max-w-lg transition-all duration-500 ease-in-out ${
          isAnimating ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'
        } print:max-w-none print:w-full print:scale-100 print:opacity-100 print:translate-y-0 relative z-10`}
      >
        
        {/* ======================= VIEW: LOGIN ======================= */}
        {view === 'login' && (
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-[0_15px_40px_rgb(184,134,11,0.15)] border border-[#E5C97A]/60 p-6 md:p-10 print:hidden relative overflow-hidden">
            
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-gradient-to-br from-[#D4A017] to-[#F9F3E5] rounded-full z-0 gold-glow-1 mix-blend-multiply opacity-50"></div>
            <div className="absolute -bottom-12 -left-12 w-56 h-56 bg-gradient-to-tr from-[#E5C97A] to-[#FBF7F0] rounded-full z-0 gold-glow-2 mix-blend-multiply opacity-50"></div>

            <div className="relative z-10 text-center mb-8">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#F9F3E5] to-white border-2 border-[#D4A017] rounded-full flex items-center justify-center mb-5 p-1 shadow-lg shadow-[#D4A017]/20 relative group">
                <div className="absolute inset-0 rounded-full border border-[#E5C97A] animate-ping opacity-20"></div>
                <img 
                  src="/logo.png" 
                  alt="Logo Sekolah" 
                  className="w-full h-full object-contain rounded-full relative z-10"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div style={{display: 'none'}} className="items-center justify-center w-full h-full">
                  <Award size={48} className="text-[#8B6508]" />
                </div>
              </div>
              <h1 className="text-2xl md:text-3xl text-[#8B6508] tracking-wide" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
                SIBI SD YA UMMI FATIMAH
              </h1>
              <p className="text-[#7A5C1E] text-sm md:text-base mt-2 font-medium tracking-wider">
                Pengumuman Kelulusan &bull; 2025/2026
              </p>
            </div>

            <div className="relative z-10 border-t border-[#E5C97A] border-opacity-40 my-6"></div>

            <form onSubmit={handleLogin} className="relative z-10 space-y-6">
              <div>
                <label htmlFor="nisn" className="block text-xs font-bold text-[#8B6508] uppercase tracking-wider mb-2 ml-1">
                  Nomor Induk Siswa Nasional (NISN)
                </label>
                <input
                  id="nisn"
                  type="text"
                  value={inputNisn}
                  onChange={(e) => setInputNisn(e.target.value)}
                  placeholder="Contoh: 0138321825"
                  className="w-full px-5 py-3.5 bg-white border border-[#E5C97A]/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#D4A017]/20 focus:border-[#D4A017] transition-all text-[#3D2B00] shadow-sm font-medium"
                />
              </div>

              <div>
                <label htmlFor="tgl" className="block text-xs font-bold text-[#8B6508] uppercase tracking-wider mb-2 ml-1">
                  Tanggal Lahir
                </label>
                <input
                  id="tgl"
                  type="text"
                  value={inputTgl}
                  onChange={(e) => setInputTgl(e.target.value)}
                  placeholder="Contoh: 08 Juni 2014"
                  className="w-full px-5 py-3.5 bg-white border border-[#E5C97A]/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#D4A017]/20 focus:border-[#D4A017] transition-all text-[#3D2B00] shadow-sm font-medium"
                />
              </div>

              {error && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl text-sm font-medium animate-pulse shadow-sm">
                  <AlertCircle size={20} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#8B6508] to-[#6B4F0F] hover:from-[#7A5C1E] hover:to-[#5C4305] disabled:from-[#D4A017] disabled:to-[#D4A017] disabled:cursor-not-allowed text-[#F9F3E5] py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] disabled:active:scale-100 shadow-[0_8px_20px_rgb(139,101,8,0.3)] hover:shadow-[0_12px_25px_rgb(139,101,8,0.4)] mt-4 tracking-wide"
              >
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
                {isLoading ? 'Mencari Data...' : 'Cek Hasil Kelulusan'}
              </button>
            </form>
          </div>
        )}

        {/* ======================= VIEW: RESULT ======================= */}
        {view === 'result' && student && (
          <div className="bg-white rounded-3xl shadow-[0_15px_40px_rgb(184,134,11,0.12)] border border-[#E5C97A]/60 p-6 md:p-10 print:shadow-none print:border-none print:p-0 relative overflow-hidden">
            
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#D4A017]/20 to-transparent rounded-bl-full z-0 gold-glow-1 print:hidden"></div>

            {/* Tombol Kembali (Hidden on Print) */}
            <button 
              onClick={handleLogout}
              className="relative z-10 flex items-center gap-2 text-[#8B6508] hover:text-[#5C4305] text-sm font-bold mb-6 transition-colors bg-[#F9F3E5] hover:bg-[#E5C97A]/30 px-4 py-2 rounded-lg print:hidden w-max"
            >
              <ArrowLeft size={16} /> Kembali
            </button>

            {/* Header Surat Lulus (Print Mode) */}
            <div className="text-center mb-6 hidden print:block">
               <div className="flex items-center justify-center gap-4 mb-4">
                  <img src="/logo.png" alt="Logo" className="w-20 h-20 object-contain" />
                  <div>
                    <h1 className="text-2xl text-[#8B6508] font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>SIBI SD YA UMMI FATIMAH</h1>
                    <p className="text-sm text-[#7A5C1E]">Pengumuman Kelulusan Tahun Ajaran 2025/2026</p>
                  </div>
               </div>
               <div className="border-b-4 border-double border-[#8B6508] mb-6"></div>
            </div>

            {/* Header Surat Lulus (Web Mode) */}
            <div className="relative z-10 text-center mb-8 print:hidden">
              <h1 className="text-2xl md:text-3xl text-[#8B6508]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
                Surat Keterangan Lulus
              </h1>
              <p className="text-[#7A5C1E] text-sm font-medium mt-1">SIBI SD Ya Ummi Fatimah</p>
            </div>

            {/* URUTAN 1: Kartu Identitas Siswa */}
            <div className="relative z-10 flex flex-col sm:flex-row gap-6 bg-gradient-to-br from-[#F9F3E5] to-white border border-[#E5C97A] p-6 rounded-2xl mb-6 print:border-gray-800 print:bg-white shadow-sm">
              
              <div className="w-28 h-36 flex-shrink-0 bg-white border-2 border-dashed border-[#D4A017] rounded-xl overflow-hidden flex flex-col items-center justify-center text-[#8B6508] mx-auto sm:mx-0 shadow-inner print:border-solid print:border-gray-800 relative group">
                {student.foto ? (
                  <img 
                    src={student.foto} 
                    alt={`Foto ${student.nama}`} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`flex-col items-center justify-center ${student.foto ? 'hidden' : 'flex'}`}>
                  <User size={36} className="mb-2 opacity-50" />
                  <span className="text-xs font-bold tracking-widest opacity-50">FOTO</span>
                </div>
              </div>

              <div className="flex-1 text-center sm:text-left flex flex-col justify-center">
                <h2 className="text-2xl md:text-3xl text-[#2C2416] mb-4 leading-tight uppercase" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
                  {student.nama}
                </h2>
                <div className="grid grid-cols-1 gap-2 text-sm md:text-base text-[#6B5E44] bg-white/50 p-4 rounded-xl border border-[#E5C97A]/30 print:border-none print:p-0">
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="w-24 font-semibold text-[#8B6508]">NISN</span>
                    <span className="hidden sm:inline mx-2 text-[#E5C97A]">:</span>
                    <strong className="text-[#3D2B00]">{student.nisn.replace(/^'/, '')}</strong>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="w-24 font-semibold text-[#8B6508]">Tgl Lahir</span>
                    <span className="hidden sm:inline mx-2 text-[#E5C97A]">:</span>
                    <strong className="text-[#3D2B00]">{student.tgl}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* URUTAN 2: Banner Lulus */}
            <div className="relative z-10 bg-gradient-to-r from-[#1B5E20] via-[#2E7D32] to-[#1B5E20] text-white text-center py-5 px-6 rounded-2xl font-bold tracking-widest text-lg md:text-xl shadow-xl shadow-green-900/20 mb-8 flex items-center justify-center gap-3 overflow-hidden print:border-2 print:border-[#1B5E20] print:text-[#1B5E20] print:bg-none print:shadow-none">
               <div className="absolute inset-0 bg-white/10 animate-[pulse_2s_ease-in-out_infinite] print:hidden"></div>
               <Award size={28} className="print:text-[#1B5E20] relative z-10" />
               <span className="relative z-10 drop-shadow-md print:drop-shadow-none">DINYATAKAN LULUS</span>
               <Award size={28} className="print:text-[#1B5E20] relative z-10" />
            </div>

            {/* URUTAN 3: Accordion TKA (Tabel Gabungan) */}
            <div className="relative z-10 mb-8">
              <button 
                onClick={() => setIsTkaOpen(!isTkaOpen)}
                className="w-full flex items-center justify-between bg-white border-2 border-[#D4A017]/50 text-[#8B6508] py-4 px-6 rounded-xl font-bold hover:bg-[#F9F3E5] hover:border-[#D4A017] transition-all print:hidden shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <FileText size={20} className="text-[#D4A017]" /> 
                  <span className="tracking-wide">Lihat Nilai TKA & Rata-Rata Kelas</span>
                </div>
                <ChevronDown size={20} className={`transition-transform duration-300 ${isTkaOpen ? 'rotate-180' : ''}`} />
              </button>

              <div 
                className={`overflow-hidden transition-all duration-500 ease-in-out ${isTkaOpen ? 'max-h-[1000px] mt-4 opacity-100' : 'max-h-0 opacity-0'} print:max-h-none print:opacity-100 print:mt-6 print:block`}
              >
                {/* Tabel Gabungan (Siswa & Kelas) */}
                <div className="bg-white border border-[#E5C97A] rounded-2xl overflow-hidden print:border-gray-800 shadow-sm">
                  <div className="bg-gradient-to-r from-[#F9F3E5] to-[#FDFBF7] text-[#8B6508] font-bold text-center py-3 text-sm md:text-base uppercase tracking-widest border-b border-[#E5C97A] print:border-gray-800 print:bg-none">
                    Tes Kemampuan Akademik (TKA)
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm md:text-base text-left">
                      <thead className="bg-white text-[#7A5C1E] border-b border-[#E5C97A] print:border-gray-800">
                        <tr>
                          <th className="py-4 px-4 font-bold">Mata Pelajaran</th>
                          <th className="py-4 px-4 font-bold text-center">Nilai</th>
                          <th className="py-4 px-4 font-bold text-center">Keterangan</th>
                          {/* Kolom Pemisah Berwarna/Border Rata-rata Kelas */}
                          <th className="py-4 px-4 font-bold text-center border-l-2 border-dashed border-[#E5C97A]/60 bg-[#FDFBF7] print:border-solid print:border-gray-400 print:bg-transparent">
                            Rata-Rata Kelas
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Matematika */}
                        <tr className="border-b border-[#F9F3E5] hover:bg-[#FBF7F0]/50 transition-colors print:border-gray-800">
                          <td className="py-4 px-4 text-[#3D2B00] font-semibold">Matematika</td>
                          <td className="py-4 px-4 text-center font-bold text-[#2C2416] text-lg">{student.mat.toFixed(2)}</td>
                          <td className="py-4 px-4 text-center">
                            <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide ${student.matKet.toLowerCase() === 'baik' ? 'bg-[#E8F5E9] text-[#2E7D32] print:border print:border-[#2E7D32]' : 'bg-[#FFF8E1] text-[#F57F17] print:border print:border-[#F57F17]'}`}>
                              {student.matKet}
                            </span>
                          </td>
                          <td className="py-4 px-4 border-l-2 border-dashed border-[#E5C97A]/60 bg-[#FDFBF7] print:border-solid print:border-gray-400 print:bg-transparent text-center text-[#D4A017] print:text-gray-400 font-bold">
                            {/* Menunggu input dari GAS, jika belum ada tampilkan '-' */}
                            {student.rataKelasMat ? student.rataKelasMat.toFixed(2) : '-'}
                          </td>
                        </tr>
                        
                        {/* Bahasa Indonesia */}
                        <tr className="border-b border-[#E5C97A] hover:bg-[#FBF7F0]/50 transition-colors print:border-gray-800">
                          <td className="py-4 px-4 text-[#3D2B00] font-semibold">Bahasa Indonesia</td>
                          <td className="py-4 px-4 text-center font-bold text-[#2C2416] text-lg">{student.bind.toFixed(2)}</td>
                          <td className="py-4 px-4 text-center">
                             <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide ${student.bindKet.toLowerCase() === 'baik' ? 'bg-[#E8F5E9] text-[#2E7D32] print:border print:border-[#2E7D32]' : 'bg-[#FFF8E1] text-[#F57F17] print:border print:border-[#F57F17]'}`}>
                              {student.bindKet}
                            </span>
                          </td>
                          <td className="py-4 px-4 border-l-2 border-dashed border-[#E5C97A]/60 bg-[#FDFBF7] print:border-solid print:border-gray-400 print:bg-transparent text-center text-[#D4A017] print:text-gray-400 font-bold">
                            {/* Menunggu input dari GAS, jika belum ada tampilkan '-' */}
                            {student.rataKelasBind ? student.rataKelasBind.toFixed(2) : '-'}
                          </td>
                        </tr>
                        
                        {/* Row Total Rata-Rata */}
                        <tr className="bg-gradient-to-r from-[#F9F3E5] to-[#FDFBF7] print:bg-none print:border-t print:border-gray-800">
                          <td className="py-5 px-4 text-[#8B6508] font-extrabold uppercase">Rata-Rata (Gabungan)</td>
                          <td className="py-5 px-4 text-center font-extrabold text-[#8B6508] text-xl">{student.rata.toFixed(2)}</td>
                          <td className="py-5 px-4"></td>
                          {/* Rata-rata Kelas ditempatkan sejajar di kanan Rata-rata Siswa */}
                          <td className="py-5 px-4 border-l-2 border-solid border-[#D4A017] bg-[#F9F3E5] print:border-gray-800 print:bg-transparent text-center font-extrabold text-[#2C2416] text-xl">
                            {student.rataKelas ? student.rataKelas.toFixed(2) : '-'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Kotak Kesimpulan Deskriptif Dinamis (Disembunyikan saat cetak PDF) */}
                <div className="mt-5 p-5 rounded-xl bg-gradient-to-br from-[#FDFBF7] to-[#F9F3E5] border border-[#E5C97A]/80 shadow-sm text-sm md:text-base text-[#3D2B00] leading-relaxed text-center font-medium print:hidden">
                  <div className="flex justify-center mb-2">
                    <Award size={24} className="text-[#D4A017]" />
                  </div>
                  {getDeskripsiKelulusan()}
                </div>

              </div>
            </div>

            {/* Tombol Print */}
            <button 
              onClick={handlePrint}
              className="relative z-10 w-full bg-gradient-to-r from-[#8B6508] to-[#6B4F0F] hover:from-[#7A5C1E] hover:to-[#5C4305] text-[#F9F3E5] py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] shadow-[0_8px_20px_rgb(139,101,8,0.3)] hover:shadow-[0_12px_25px_rgb(139,101,8,0.4)] print:hidden tracking-wide text-lg"
            >
              <Printer size={22} />
              Cetak Dokumen Kelulusan
            </button>
            
          </div>
        )}

      </div>
    </div>
  );
}
