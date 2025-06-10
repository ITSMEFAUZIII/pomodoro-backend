// ======================================================
//      SERVER.JS - VERSI FINAL DENGAN DATABASE
// ======================================================

// 1. Impor semua modul yang dibutuhkan
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

// 2. Inisialisasi Aplikasi Express
const app = express();
const port = 3000;

// 3. Hubungkan ke Database
const db = new sqlite3.Database('./pomodoro.db', (err) => {
    if (err) {
        return console.error("Gagal terhubung ke database:", err.message);
    }
    console.log('Berhasil terhubung ke database SQLite.');
});

// 4. Buat Tabel untuk menyimpan sesi jika belum ada
db.run(`CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task TEXT NOT NULL,
    duration INTEGER NOT NULL,
    date TEXT NOT NULL,
    type TEXT NOT NULL 
)`, (err) => {
    if (err) {
        return console.error("Gagal membuat tabel:", err.message);
    }
    console.log("Tabel 'sessions' siap digunakan.");
});


// 5. Gunakan Middleware
app.use(cors());
app.use(express.json());


// 6. Definisikan Rute/Endpoint

// Rute GET '/' untuk tes
app.get('/', (req, res) => {
    res.send('<h1>Server Backend Aktif!</h1><p>Server ini siap menerima dan menyajikan data Pomodoro.</p>');
});

// Rute POST untuk MENYIMPAN sesi
app.post('/api/session-complete', (req, res) => {
    const sessionData = req.body;
    
    // Validasi sederhana untuk memastikan data tidak kosong
    if (!sessionData || !sessionData.date || !sessionData.task || !sessionData.type || !sessionData.duration) {
        return res.status(400).json({ "error": "Data yang dikirim tidak lengkap." });
    }

    const sql = `INSERT INTO sessions (task, duration, date, type) VALUES (?, ?, ?, ?)`;
    const params = [sessionData.task, sessionData.duration, sessionData.date, sessionData.type];

    db.run(sql, params, function(err) {
        if (err) {
            console.error("DATABASE ERROR:", err.message);
            res.status(500).json({ "error": err.message });
            return;
        }
        console.log(`✅ Laporan diterima DAN berhasil disimpan ke database dengan ID: ${this.lastID}`);
        res.status(201).json({
            status: 'success',
            message: 'Laporan sesi berhasil disimpan di database!',
            id: this.lastID
        });
    });
});

// Rute GET untuk MENGAMBIL semua riwayat sesi
app.get('/api/history', (req, res) => {
    const sql = "SELECT * FROM sessions ORDER BY date DESC";
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