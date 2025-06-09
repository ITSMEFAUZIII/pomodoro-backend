// 1. Impor semua modul yang dibutuhkan
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose(); // Impor driver SQLite

// 2. Inisialisasi Aplikasi Express
const app = express();
const port = 3000;

// 3. Hubungkan ke Database (atau buat file baru jika belum ada)
// Ini akan membuat file 'pomodoro.db' di dalam foldermu
const db = new sqlite3.Database('./pomodoro.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error("Gagal terhubung ke database", err.message);
    } else {
        console.log('Berhasil terhubung ke database SQLite.');
    }
});

// 4. Buat Tabel untuk menyimpan sesi jika belum ada
// Ini seperti menyiapkan laci berlabel "Sesi Pomodoro" di lemari arsip
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task TEXT NOT NULL,
        duration INTEGER NOT NULL,
        date TEXT NOT NULL
    )`, (err) => {
        if (err) {
            console.error("Gagal membuat tabel", err);
        } else {
            console.log("Tabel 'sessions' siap digunakan.");
        }
    });
});


// 5. Gunakan Middleware
app.use(cors());
app.use(express.json());


// 6. Definisikan Rute/Endpoint

// Rute GET '/' untuk tes (tidak berubah)
app.get('/', (req, res) => {
    res.send('<h1>Server Backend Aktif!</h1><p>Server ini sedang menunggu laporan dari aplikasi Pomodoro.</p>');
});

// Rute POST untuk MENYIMPAN sesi (di-upgrade)
app.post('/api/session-complete', (req, res) => {
    const sessionData = req.body;
    console.log('Menerima laporan dari front-end:', sessionData);

    // Siapkan perintah SQL untuk memasukkan data
    const sql = `INSERT INTO sessions (task, duration, date) VALUES (?, ?, ?)`;
    const params = [sessionData.task, sessionData.duration, sessionData.date];

    // Jalankan perintah SQL
    db.run(sql, params, function(err) {
        if (err) {
            console.error("Gagal menyimpan data ke database", err.message);
            res.status(500).json({ "error": err.message });
            return;
        }
        console.log(`Data sesi berhasil disimpan ke database dengan ID: ${this.lastID}`);
        res.status(200).json({
            status: 'success',
            message: 'Laporan sesi berhasil disimpan di database!',
            id: this.lastID
        });
    });
});

// RUTE BARU: Rute GET untuk MENGAMBIL semua riwayat sesi
app.get('/api/history', (req, res) => {
    const sql = "SELECT * FROM sessions ORDER BY date DESC"; // Ambil semua data, urutkan dari yang terbaru
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ "error": err.message });
            return;
        }
        res.json({
            message: "success",
            history: rows
        });
    });
});

// 7. Jalankan Server
app.listen(port, () => {
    console.log(`Server backend berjalan di http://localhost:${port}`);
});