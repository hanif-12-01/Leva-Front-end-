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

## 📋 Langkah Selanjutnya (Sesuai Jadwal "Rabu - Jumat")
Untuk iterasi berikutnya, pengerjaan akan dilanjutkan dengan fokus pada:
1. Penambahan **Validasi HTML5 & Regex** pada formulir input.
2. Menerjemahkan **pesan error backend** (dari Axios *catch*) menjadi bahasa yang *user-friendly*.
3. Implementasi visual **Loading State / Spinner** untuk tombol submit agar pengguna tidak dapat menekan tombol berulang kali saat memuat data.
