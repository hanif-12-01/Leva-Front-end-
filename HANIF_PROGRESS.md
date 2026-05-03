# Progress Laporan Frontend - Bagian Hanif

Dokumen ini mencatat pembaruan dan progres kode yang telah dikerjakan oleh **Hanif** pada repositori `leva-frontend`, berdasarkan pembagian tugas dari dokumen *Base Idea* dan *SRS (Software Requirements Specification)*.

## 🎯 Fokus Pengerjaan
Tahap ini difokuskan pada fondasi **Logika Frontend (State Management)**, **Keamanan Akses (Route Guarding)**, **Integrasi API Dasar**, dan infrastruktur **Real-time WebSockets**.

---

## 🛠️ Fitur & Implementasi yang Telah Selesai

### 1. Instalasi Infrastruktur Real-time (WebSockets)
- **Modul yang diinstal:** `laravel-echo` dan `pusher-js`.
- **File Konfigurasi:** Dibuat file `src/services/echo.js` untuk mendengarkan *event broadcasting* (seperti notifikasi ketika PDF selesai diproses oleh backend).

### 2. Konfigurasi API dan Interceptor Global
- **File:** `src/services/api.js`
- **Pembaruan:** Menambahkan Axios Response Interceptor.
- **Fungsi:** Jika token JWT kedaluwarsa (Backend mengembalikan HTTP status `401 Unauthorized`), pengguna akan ditendang secara otomatis kembali ke halaman login, mencegah *error* beruntun di konsol.

### 3. Manajemen State Global dengan Pinia
Penyimpanan *state* dipecah menjadi dua pilar utama:
- **`src/stores/userStore.js`**
  - Pembuatan fungsi `fetchProfile()` untuk menarik data profil pengguna yang sedang login.
  - Pembuatan fungsi `submitOnboarding(data)` untuk mengirim isian kuisioner akademik langsung ke backend, mengubah atribut lokal `is_onboarded` menjadi `true`.
- **`src/stores/documentStore.js` (Baru)**
  - Menangani aksi `uploadPdf(file)`.
  - Mengatur *loading state* saat dokumen sedang diproses (`isUploading`).
  - Menangani daftar tugas/To-Do list hasil pecah-dokumen AI.

### 4. Keamanan Rute (Vue Router)
- **File:** `src/router/index.js`
- **Pembaruan:** Menerapkan *Global Route Guards*.
- **Logika:**
  - Pengguna anonim (tanpa token) tidak bisa masuk ke `/` (Dashboard). Akan diarahkan ke `/login`.
  - Pengguna yang sudah login namun atribut `is_onboarded` bernilai `false` (belum isi kuisioner) tidak bisa mengakses Dashboard. Akan dikunci/diarahkan paksa ke `/onboarding`.

### 5. Penyambungan Logika ke Antarmuka (Views)
- **`src/views/OnboardingView.vue`**: Menghapus skrip *dummy loading*. Form kuesioner kini benar-benar terhubung ke Pinia `userStore` untuk menyimpan profil ke pangkalan data *Sparse Vector* backend.
- **`src/views/DashboardView.vue`**:
  - Menambahkan *input* tersembunyi untuk mengunggah file PDF silabus akademik.
  - Memasang fungsi bawaan Vue `onMounted()` untuk mendengarkan koneksi WebSocket di saluran (*channel*) pribadi pengguna.
  - Mengotomatiskan penambahan daftar *To-Do List* segera setelah *event* `PdfProcessed` dikirim dari server.

---

## Progres Tambahan (Rabu - Sabtu)
Sesuai rancangan *Base Idea Rutinitas Harian*:

### 1. Validasi UX Frontend & Error Handling (Rabu - Jumat)
- **Validasi HTML5 & Regex:** Menerapkan validasi form kuat, termasuk pembuatan re-usable function `isValidEmail` dan `isValidPhoneNumber` (Regex HP Indonesia) di file utilitas `src/utils/validation.js`.
- **Terjemahan Error Backend:** Menangkap status HTTP `400`, `401`, dan `500` dari respon Axios dan mengubah bahasanya menjadi *user-friendly* langsung di dalam antarmuka obrolan `LoginView.vue` dan `OnboardingView.vue`.
- **Status Memuat (Loading State):** Seluruh tombol aksi disuntikkan logika `:disabled="isLoading"` lengkap dengan UI perubahan gaya kursor dan penambahan *emoji spinner* untuk mencegah pengiriman bertubi-tubi/spamming oleh *user*.

### 2. Desain Template OTP Email (Opsional Sabtu)
- **File:** `src/templates/email-otp.html`
- Telah menyiapkan rancangan kode raw HTML statis dengan implementasi *inline CSS* (untuk dukungan *cross-email client*) guna memfasilitasi tugas pengiriman kode keamanan OTP Arkaan via SMTP backend.
- Diselaraskan dengan *guideline* sistem Leva yang menekankan nuansa ruang akademik (*academic workspace*) profesional, minimalis, dan minim distraksi teknis.

---

## 📋 Langkah Selanjutnya (To-Do List Progres Berikutnya)
Berdasarkan analisis *Dokumen SRS Leva* dan rencana fungsional *Base Idea*, target pengerjaan Frontend selanjutnya untuk **Hanif** difokuskan pada perancangan antarmuka fungsionalitas inti AI:

### 1. Antarmuka Asisten Obrolan RAG (Sadar Konteks)
- **Tugas:** Membuat komponen UI obrolan (*Chat Interface*) (`ChatAssistant.vue`).
- **Target:** Mampu menangani kueri linguistik asinkron dari pengguna, menampilkan proses *typing/loading*, dan merender balasan saran alat AI yang dipersonalisasi dari backend (hasil dari Qdrant & OpenAI/Gemini).

### 2. Komponen *To-Do List* Pemecahan PDF Interaktif
- **Tugas:** Mengembangkan UI interaktif untuk *Mesin Pemecah Kelumpuhan Kognitif*.
- **Target:** Ketika WebSockets (`PdfProcessed`) menerima struktur respons objek JSON dari backend (berisi `judul_tugas`, `estimasi_waktu`, dan `kategori_alat_ai_yang_rekomendasi`), UI harus bisa merender data tersebut menjadi *checklist* tugas mikro (*Atomic Habits*). Setiap daftar tugas harus memiliki tautan/tombol instan ke antarmuka AI yang disarankan.

### 3. UI Fitur *Smart Bookmarking* (Manajemen Referensi)
- **Tugas:** Membuat antarmuka untuk menyimpan dan menampilkan riwayat direktori alat AI favorit pengguna.
- **Target:** Mengakomodasi tampilan desain *card* alat yang bisa memunculkan maksimum "5 tag semantik mutlak" buatan AI (*LLM tag generation*) agar mempermudah pencarian ruang spasial pengguna di masa mendatang.

### 4. Peningkatan UX Manajemen Antrean PDF
- **Tugas:** Mengoptimalkan UX visualisasi pengunggahan dokumen silabus akademik.
- **Target:** Mengingat backend akan melempar beban ekstraksi teks PDF ke *Laravel Jobs/Queue* (asinkron), frontend perlu mempertahankan antarmuka animasi memuat (*indeterminate loading*) yang intuitif tanpa memblokir seluruh akses navigasi, hingga WebSocket memancarkan status selesai.

