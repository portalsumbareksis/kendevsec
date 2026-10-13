# KENDEVSEC — Website E-commerce Layanan Digital

Website statis untuk GitHub Pages dengan Firebase Authentication + Cloud Firestore. Order dibuka sebagai rangkuman WhatsApp (tidak ada pembayaran online otomatis).

## Isi
- `index.html`, `styles.css`, `app.js`: halaman publik responsif, animasi, suara UI yang dapat dimatikan, daftar layanan, form order WhatsApp.
- `admin.html`, `admin.css`, `admin.js`: login admin, CRUD layanan, konten judul, maintenance mode.
- `firebase-config.js`: isi konfigurasi proyek Firebase.
- `firestore.rules`: aturan database contoh.
- `firebase.json`: konfigurasi Firebase Hosting bila nanti ingin dipakai.

## 1. Buat proyek Firebase
1. Buka Firebase Console dan buat project.
2. Tambahkan Web App (ikon `</>`), salin konfigurasi SDK ke `firebase-config.js`.
3. Authentication → Sign-in method → aktifkan **Email/Password**.
4. Authentication → Users → Add user. Buat akun admin sendiri. Jangan menaruh password di file kode.
5. Firestore Database → Create database.
6. Rules → tempel isi `firestore.rules` dan Publish.
7. Masuk `admin.html`, login, buka tab Kelola Layanan, klik **Isi layanan awal**. Setelah itu layanan dapat diedit/tambah/hapus.

**Penting untuk keamanan:** rules contoh mengizinkan akun Firebase yang login mengubah data. Jangan membuat akun publik. Untuk situs produksi, batasi write ke UID admin khusus menggunakan Firebase Auth custom claims atau daftar UID admin di rules. API key Firebase web bukan password; proteksi data dilakukan oleh Authentication dan Rules.

## 2. GitHub Pages dari HP Android
1. Buat repository baru di GitHub.
2. Upload seluruh file dan folder proyek ini ke root repository (jangan upload file ZIP sebagai pengganti isi file).
3. Buka Settings → Pages.
4. Pada Build and deployment pilih **Deploy from a branch**, branch `main`, folder `/(root)`, lalu Save.
5. Tunggu URL Pages aktif. Pastikan file `firebase-config.js` sudah diisi sebelum menguji admin.

Firebase SDK menggunakan import module dari CDN. Buka website melalui GitHub Pages (HTTPS), bukan membuka `index.html` langsung dari file manager.

## 3. Firebase dan GitHub Pages
GitHub Pages hanya hosting frontend statis. Firebase menyediakan Authentication dan Firestore. Setelah konfigurasi, halaman publik membaca koleksi `services` dan dokumen `siteSettings/main`. Admin mengelola data lewat Firebase.
`firebase.json` disertakan jika nanti ingin deploy ke Firebase Hosting; ini bukan hal yang sama dengan GitHub Pages dan tidak wajib untuk GitHub Pages.

## 4. Order WhatsApp
Nomor tujuan di `firebase-config.js` menggunakan format internasional tanpa `+`: `62895636069948`. Form akan membuka WhatsApp dengan ringkasan order. Pengunjung perlu menekan tombol kirim di WhatsApp; browser tidak dapat mengirim pesan otomatis tanpa persetujuan pengguna.

## 5. Maintenance
Login admin → tab Maintenance → aktifkan toggle → Simpan status maintenance. Pengunjung yang membuka situs dan terhubung ke Firestore akan melihat layar maintenance. Admin panel tetap dapat diakses. Jika Firebase/Internet down, perubahan maintenance tidak dapat diambil oleh browser; untuk maintenance darurat saat Firebase tidak bisa diakses, ubah sementara halaman `index.html`/deploy ulang.

## 6. Pemeriksaan
- File JavaScript adalah ES modules; gunakan HTTPS hosting.
- Jika tampilan masih demo, periksa `firebase-config.js` dan Console browser.
- Jika “permission denied”, cek Rules dan akun Authentication.
- Suara UI baru terdengar setelah interaksi pengguna sesuai kebijakan browser; tombol Suara ON/OFF tersedia.
- Semua layanan default adalah contoh; sesuaikan harga dan ruang lingkup layanan sebelum dipublikasikan.
