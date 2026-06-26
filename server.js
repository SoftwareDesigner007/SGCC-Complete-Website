const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize SQLite database
const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'), (err) => {
    if (err) {
        console.error('Error opening database', err);
    } else {
        console.log('Connected to the SQLite database.');
        
        // Create enquiries table
        db.run(`CREATE TABLE IF NOT EXISTS enquiries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            studentName TEXT,
            email TEXT,
            phone TEXT,
            course TEXT,
            message TEXT,
            timestamp TEXT
        )`);

        // Create admins table
        db.run(`CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )`, (err) => {
            if (!err) {
                // Insert default admin if table is empty
                db.get("SELECT count(*) as count FROM admins", (err, row) => {
                    if (row && row.count === 0) {
                        // Using a simple plaintext password for this project. 
                        db.run("INSERT INTO admins (username, password) VALUES ('admin', 'admin123')");
                    }
                });
            }
        });
    }
});

// Admin Login endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT * FROM admins WHERE username = ? AND password = ?", [username, password], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row) {
            res.json({ success: true, message: "Login successful" });
        } else {
            res.status(401).json({ success: false, message: "Invalid credentials" });
        }
    });
});

// Update Admin Credentials endpoint
app.post('/api/admin/update', (req, res) => {
    const { oldUsername, oldPassword, newUsername, newPassword } = req.body;
    db.get("SELECT * FROM admins WHERE username = ? AND password = ?", [oldUsername, oldPassword], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row) {
            db.run("UPDATE admins SET username = ?, password = ? WHERE id = ?", [newUsername, newPassword, row.id], function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ success: true, message: "Credentials updated" });
            });
        } else {
            res.status(401).json({ success: false, message: "Invalid current credentials" });
        }
    });
});

// Get all enquiries
app.get('/api/enquiries', (req, res) => {
    db.all("SELECT * FROM enquiries ORDER BY id DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const formattedRows = rows.map(row => ({
            id: row.id.toString(),
            name: row.studentName,
            email: row.email,
            phone: row.phone,
            course: row.course,
            message: row.message,
            date: row.timestamp,
            status: 'New'
        }));
        res.json(formattedRows);
    });
});

// Add new enquiry
app.post('/api/enquiries', (req, res) => {
    const { studentName, email, phone, course, message, timestamp } = req.body;
    db.run(
        "INSERT INTO enquiries (studentName, email, phone, course, message, timestamp) VALUES (?, ?, ?, ?, ?, ?)",
        [studentName, email, phone, course, message, timestamp],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            db.get("SELECT * FROM enquiries WHERE id = ?", [this.lastID], (err, row) => {
                res.json(row);
            });
        }
    );
});

// Delete specific enquiry
app.delete('/api/enquiries/:id', (req, res) => {
    const id = req.params.id;
    db.run("DELETE FROM enquiries WHERE id = ?", id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, deleted: this.changes });
    });
});

// Delete all enquiries
app.delete('/api/enquiries', (req, res) => {
    db.run("DELETE FROM enquiries", [], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, deleted: this.changes });
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
