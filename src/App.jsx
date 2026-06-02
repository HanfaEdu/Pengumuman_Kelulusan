import React, { useState, useEffect } from 'react';
import { Search, AlertCircle, ArrowLeft, Award, FileText, ChevronDown, Printer, User, Loader2 } from 'lucide-react';

// URL Endpoint Google Apps Script (GAS)
// (Nanti akan kita isi setelah selesai membuat dan deploy script di Spreadsheet)
const GAS_URL = "https://script.google.com/macros/s/AKfycbzw7YSzEo1KfUeOJtCZ3j6jsq1J4MJ-OQaMmqrNMnfLZxtKIO-yAsa1JdZ1-qIqJLA/exec";

export default function App() {
  const [view, setView] = useState('login'); // 'login' | 'result'
  const [inputNisn, setInputNisn] = useState('');
  const [inputTgl, setInputTgl] = useState('');
  const [error, setError] = useState('');
  const [student, setStudent] = useState(null);
  const [isTkaOpen, setIsTkaOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // State untuk animasi loading saat cari data
  
  // State animasi untuk transisi halaman
  const [isAnimating, setIsAnimating] = useState(false);

  // Injeksi Font Playfair Display untuk kesan Ijazah/Formal
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (!inputNisn.trim() || !inputTgl.trim()) {
      setError('NISN dan Tanggal Lahir harus diisi.');
      return;
    }

    // Pembersihan input
    const cleanInputNisn = inputNisn.trim();
    const cleanInputTgl = inputTgl.trim().toLowerCase().replace(/\s+/g, ' ');

    setIsLoading(true); // Aktifkan tombol loading

    try {
      // Memanggil API GAS untuk mencari data spesifik (GET Request)
      const response = await fetch(`${GAS_URL}?nisn=${encodeURIComponent(cleanInputNisn)}&tgl=${encodeURIComponent(cleanInputTgl)}`);
      
      if (!response.ok) throw new Error('Jaringan bermasalah');
      
      const result = await response.json();

      if (result.status === 'success') {
        setStudent(result.data); // data berisi: nama, nisn, tgl, mat, matKet, dll + rataKelas + foto
        setIsTkaOpen(false);
        triggerTransition('result');
      } else {
        setError(result.message || 'Data tidak ditemukan. Periksa kembali NISN dan Tanggal Lahir.');
      }
    } catch (err) {
      setError('Gagal menghubungi server. Pastikan koneksi internet stabil (URL GAS belum di-set).');
      console.error(err);
    } finally {
      setIsLoading(false); // Matikan loading
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
    }, 400); // Waktu yang sama dengan durasi opacity-0 di CSS
  };

  const handlePrint = () => {
    // Pada saat print, kita paksa TKA terbuka agar terlihat di PDF
    setIsTkaOpen(true);
    setTimeout(() => {
      window.print();
    }, 300); // Beri waktu animasi buka accordion selesai
  };

  return (
    <div className="min-h-screen bg-[#FBF7F0] text-[#3D2B00] font-sans flex items-center justify-center p-4 md:p-8 print:bg-white print:p-0">
      
      {/* Container Utama: 
        Menggunakan transisi opacity & scale agar pergerakan halaman halus.
      */}
      <div 
        className={`w-full max-w-lg transition-all duration-400 ease-in-out ${
          isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        } print:max-w-none print:w-full print:scale-100 print:opacity-100`}
      >
        
        {/* ======================= VIEW: LOGIN ======================= */}
        {view === 'login' && (
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(184,134,11,0.12)] border border-[#E5C97A] p-6 md:p-10 print:hidden relative overflow-hidden">
            {/* Ornament Background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F9F3E5] rounded-bl-full -z-10 opacity-60"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#F9F3E5] rounded-tr-full -z-10 opacity-60"></div>

            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto bg-[#F9F3E5] border-2 border-[#D4A017] rounded-full flex items-center justify-center mb-4 p-1 shadow-sm">
                {/* Fallback jika logo.png gagal load */}
                <img 
                  src="/logo.png" 
                  alt="Logo Sekolah" 
                  className="w-full h-full object-contain rounded-full"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <div style={{display: 'none'}}><Award size={40} className="text-[#8B6508]" /></div>
              </div>
              <h1 className="text-2xl text-[#8B6508] tracking-wide" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
                SIBI SD YA UMMI FATIMAH
              </h1>
              <p className="text-[#7A5C1E] text-sm mt-1 font-medium tracking-wide">
                Pengumuman Kelulusan &bull; Tahun Ajaran 2025/2026
              </p>
            </div>

            <div className="border-t border-[#E5C97A] border-opacity-50 my-6"></div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label htmlFor="nisn" className="block text-xs font-bold text-[#7A5C1E] uppercase tracking-wider mb-2">
                  Nomor Induk Siswa Nasional (NISN)
                </label>
                <input
                  id="nisn"
                  type="text"
                  value={inputNisn}
                  onChange={(e) => setInputNisn(e.target.value)}
                  placeholder="Contoh: 0138000825"
                  className="w-full px-4 py-3 bg-[#FBF7F0] border border-[#E5C97A] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:bg-white transition-all text-[#3D2B00]"
                />
              </div>

              <div>
                <label htmlFor="tgl" className="block text-xs font-bold text-[#7A5C1E] uppercase tracking-wider mb-2">
                  Tanggal Lahir
                </label>
                <input
                  id="tgl"
                  type="text"
                  value={inputTgl}
                  onChange={(e) => setInputTgl(e.target.value)}
                  placeholder="Contoh: 08 Juni 2014"
                  className="w-full px-4 py-3 bg-[#FBF7F0] border border-[#E5C97A] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:bg-white transition-all text-[#3D2B00]"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-[#FFEBEE] text-[#C62828] p-3 rounded-lg text-sm font-medium animate-pulse">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#8B6508] hover:bg-[#6B4F0F] disabled:bg-[#D4A017] disabled:cursor-not-allowed text-[#F9F3E5] py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] disabled:active:scale-100 shadow-lg shadow-[#8B6508]/20 mt-2"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                {isLoading ? 'Mencari Data...' : 'Cek Hasil Kelulusan'}
              </button>
            </form>
          </div>
        )}

        {/* ======================= VIEW: RESULT ======================= */}
        {view === 'result' && student && (
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(184,134,11,0.12)] border border-[#E5C97A] p-6 md:p-10 print:shadow-none print:border-none print:p-0 relative">
            
            {/* Tombol Kembali (Hidden on Print) */}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-[#8B6508] hover:text-[#5C4305] text-sm font-semibold mb-6 transition-colors print:hidden"
            >
              <ArrowLeft size={16} /> Kembali
            </button>

            {/* Header Surat Lulus */}
            <div className="text-center mb-6 hidden print:block">
               {/* Elemen ini hanya muncul saat di-print untuk Kop Surat */}
               <div className="flex items-center justify-center gap-4 mb-4">
                  <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain" />
                  <div>
                    <h1 className="text-2xl text-[#8B6508] font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>SIBI SD YA UMMI FATIMAH</h1>
                    <p className="text-sm text-[#7A5C1E]">Pengumuman Kelulusan Tahun Ajaran 2024/2025</p>
                  </div>
               </div>
               <div className="border-b-2 border-[#8B6508] mb-6"></div>
            </div>

            <div className="text-center mb-6 print:hidden">
              <h1 className="text-xl text-[#8B6508]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
                Surat Keterangan Lulus
              </h1>
              <p className="text-[#7A5C1E] text-sm">SIBI SD Ya Ummi Fatimah</p>
            </div>

            {/* Banner Lulus */}
            <div className="bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-white text-center py-4 px-6 rounded-xl font-bold tracking-widest text-lg shadow-lg mb-6 flex items-center justify-center gap-3 relative overflow-hidden print:border print:border-[#1B5E20] print:text-[#1B5E20] print:bg-none print:shadow-none">
               <Award size={24} className="print:text-[#1B5E20]" />
               DINYATAKAN LULUS
               <Award size={24} className="print:text-[#1B5E20]" />
            </div>

            {/* Kartu Identitas Siswa */}
            <div className="flex flex-col sm:flex-row gap-5 bg-[#F9F3E5] border border-[#E5C97A] p-5 rounded-xl mb-6 print:border-[#000] print:bg-white">
              
              {/* Foto Box */}
              <div className="w-24 h-32 flex-shrink-0 bg-white border-2 border-dashed border-[#D4A017] rounded-lg overflow-hidden flex flex-col items-center justify-center text-[#8B6508] mx-auto sm:mx-0 print:border-solid print:border-[#000]">
                {student.foto ? (
                  <img 
                    src={student.foto} 
                    alt={`Foto ${student.nama}`} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`flex-col items-center justify-center ${student.foto ? 'hidden' : 'flex'}`}>
                  <User size={32} />
                  <span className="text-[10px] font-bold mt-1">FOTO</span>
                </div>
              </div>

              <div className="flex-1 text-center sm:text-left flex flex-col justify-center">
                <h2 className="text-xl md:text-2xl text-[#2C2416] mb-2 leading-tight uppercase" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
                  {student.nama}
                </h2>
                <div className="space-y-1 text-sm md:text-base text-[#6B5E44]">
                  <p>NISN <span className="mx-2">:</span> <strong className="text-[#3D2B00]">{student.nisn.replace(/^'/, '')}</strong></p>
                  <p>Tgl Lahir <span className="mx-1">:</span> <strong className="text-[#3D2B00]">{student.tgl}</strong></p>
                </div>
              </div>
            </div>

            {/* Accordion TKA */}
            <div className="mb-6">
              <button 
                onClick={() => setIsTkaOpen(!isTkaOpen)}
                className="w-full flex items-center justify-between bg-white border border-[#D4A017] text-[#8B6508] py-3 px-5 rounded-xl font-bold hover:bg-[#F9F3E5] transition-colors print:hidden"
              >
                <div className="flex items-center gap-2">
                  <FileText size={18} /> Lihat Hasil TKA
                </div>
                <ChevronDown size={20} className={`transition-transform duration-300 ${isTkaOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Wrapper Accordion dengan Tailwind Transition */}
              <div 
                className={`overflow-hidden transition-all duration-500 ease-in-out ${isTkaOpen ? 'max-h-[600px] mt-4 opacity-100' : 'max-h-0 opacity-0'} print:max-h-none print:opacity-100 print:mt-6 print:block`}
              >
                <div className="bg-white border border-[#E5C97A] rounded-xl overflow-hidden print:border-[#000]">
                  <div className="bg-[#F9F3E5] text-[#8B6508] font-bold text-center py-2 text-sm uppercase tracking-wider border-b border-[#E5C97A] print:border-[#000] print:bg-white">
                    Tes Kemampuan Akademik (TKA)
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-white text-[#7A5C1E] border-b border-[#E5C97A] print:border-[#000]">
                        <tr>
                          <th className="py-3 px-4 font-bold">Mata Pelajaran</th>
                          <th className="py-3 px-4 font-bold text-center w-24">Nilai</th>
                          <th className="py-3 px-4 font-bold text-right w-32">Keterangan</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-[#F9F3E5] print:border-[#000]">
                          <td className="py-3 px-4 text-[#3D2B00] font-medium">Matematika</td>
                          <td className="py-3 px-4 text-center font-bold text-[#2C2416]">{student.mat.toFixed(2)}</td>
                          <td className="py-3 px-4 text-right">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${student.matKet.toLowerCase() === 'baik' ? 'bg-[#E8F5E9] text-[#2E7D32] print:border print:border-[#2E7D32]' : 'bg-[#FFF8E1] text-[#F57F17] print:border print:border-[#F57F17]'}`}>
                              {student.matKet}
                            </span>
                          </td>
                        </tr>
                        <tr className="border-b border-[#F9F3E5] print:border-[#000]">
                          <td className="py-3 px-4 text-[#3D2B00] font-medium">Bahasa Indonesia</td>
                          <td className="py-3 px-4 text-center font-bold text-[#2C2416]">{student.bind.toFixed(2)}</td>
                          <td className="py-3 px-4 text-right">
                             <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${student.bindKet.toLowerCase() === 'baik' ? 'bg-[#E8F5E9] text-[#2E7D32] print:border print:border-[#2E7D32]' : 'bg-[#FFF8E1] text-[#F57F17] print:border print:border-[#F57F17]'}`}>
                              {student.bindKet}
                            </span>
                          </td>
                        </tr>
                        <tr className="bg-[#F9F3E5] print:bg-white">
                          <td className="py-3 px-4 text-[#8B6508] font-bold">Rata-rata Nilai Siswa</td>
                          <td className="py-3 px-4 text-center font-bold text-[#8B6508] text-base">{student.rata.toFixed(2)}</td>
                          <td className="py-3 px-4"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Perbandingan Rata-rata mengambil properti student.rataKelas dari Server GAS */}
                <div className={`mt-3 p-3 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold border ${student.rata >= student.rataKelas ? 'bg-[#E8F5E9] text-[#1B5E20] border-[#A5D6A7]' : 'bg-[#FFEBEE] text-[#C62828] border-[#FFCDD2]'} print:border-[#000] print:bg-white`}>
                  {student.rata >= student.rataKelas ? (
                    <>Rata-rata Siswa di atas Rata-rata Kelas ({student.rataKelas.toFixed(2)})</>
                  ) : (
                    <>Rata-rata Siswa di bawah Rata-rata Kelas ({student.rataKelas.toFixed(2)})</>
                  )}
                </div>
              </div>
            </div>

            {/* Tombol Print */}
            <button 
              onClick={handlePrint}
              className="w-full bg-[#8B6508] hover:bg-[#6B4F0F] text-[#F9F3E5] py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] shadow-lg shadow-[#8B6508]/20 print:hidden"
            >
              <Printer size={18} />
              Cetak / Unduh PDF
            </button>
            
          </div>
        )}

      </div>
    </div>
  );
}
