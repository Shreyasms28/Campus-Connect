// This is the complete and final server file for the Campus Drive application.
// It uses EJS for dynamic pages and serves static files from a single public directory.

const express = require("express");
const mysql = require("mysql2");
const path = require("path");

const app = express();
const PORT = 8080;

// Middleware setup
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // To parse JSON bodies from API requests

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Database connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Root@123',
    database: 'event_management', // Your specified database name
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection on start
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database.');
    connection.release(); // Release the connection back to the pool
});

// =========================================================================
//                              FRONT-END ROUTES
// =========================================================================

// Route to serve the login page at the root URL
app.get("/", (req, res) => {
    res.redirect("/login");
});

// Route for the login page
app.get("/login", (req, res) => {
    res.render("login");
});

// Route for the admin page
app.get("/admin", (req, res) => {
    res.render("admin");
});

// Route for the student portal
app.get("/student", (req, res) => {
    res.render("student");
});

// =========================================================================
//                              AUTHENTICATION API ROUTE
// =========================================================================

/**
 * POST /api/login
 * Handles user login and authentication.
 */
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    const sql = 'SELECT user_id, role FROM users WHERE username = ? AND password = ?';
    pool.query(sql, [username, password], (err, results) => {
        if (err) {
            console.error('Database query failed:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (results.length > 0) {
            const userRole = results[0].role;
            const userId = results[0].user_id;
            res.status(200).json({ message: 'Login successful', role: userRole, userId });
        } else {
            res.status(401).json({ message: 'Invalid credentials. Please try again.' });
        }
    });
});

// =========================================================================
//                              ADMIN API ROUTES
// =========================================================================

/**
 * POST /api/events
 * Creates a new event with data provided in the request body.
 */
app.post('/api/events', (req, res) => {
    const { title, description, date, location } = req.body;
    if (!title || !date || !location) {
        return res.status(400).json({ error: 'Missing required fields: title, date, and location' });
    }

    const sql = 'INSERT INTO events (title, description, date, location) VALUES (?, ?, ?, ?)';
    const values = [title, description, date, location];

    pool.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error creating event:', err);
            return res.status(500).json({ error: 'Database insertion failed' });
        }
        res.status(201).json({ message: 'Event created successfully', event_id: result.insertId });
    });
});

/**
 * GET /api/admin/reports/popularity
 * Fetches event popularity report (registrations per event).
 */
app.get('/api/admin/reports/popularity', (req, res) => {
    const sql = `
        SELECT e.title, COUNT(r.registration_id) AS registration_count
        FROM events e
        LEFT JOIN event_registrations r ON e.event_id = r.event_id
        GROUP BY e.event_id
        ORDER BY registration_count DESC;
    `;
    pool.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching popularity report:', err);
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.status(200).json(results);
    });
});

/**
 * GET /api/admin/reports/participation
 * Fetches student participation report (attendance per student).
 */
app.get('/api/admin/reports/participation', (req, res) => {
    const sql = `
        SELECT u.username, COUNT(a.attendance_id) AS attendance_count
        FROM users u
        LEFT JOIN event_attendance a ON u.user_id = a.user_id
        WHERE u.role = 'student'
        GROUP BY u.user_id
        ORDER BY attendance_count DESC;
    `;
    pool.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching participation report:', err);
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.status(200).json(results);
    });
});

/**
 * GET /api/admin/reports/feedback
 * Fetches average feedback score per event.
 */
app.get('/api/admin/reports/feedback', (req, res) => {
    const sql = `
        SELECT e.title, AVG(f.rating) AS average_rating
        FROM events e
        LEFT JOIN event_feedback f ON e.event_id = f.event_id
        GROUP BY e.event_id
        ORDER BY average_rating DESC;
    `;
    pool.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching feedback report:', err);
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.status(200).json(results);
    });
});

// =========================================================================
//                             STUDENT API ROUTES
// =========================================================================

/**
 * GET /api/student/events
 * Fetches events available to students.
 */
app.get('/api/student/events', (req, res) => {
    const sql = 'SELECT event_id, title, description, date, location FROM events';
    pool.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching student events:', err);
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.status(200).json(results);
    });
});

/**
 * POST /api/student/register
 * Handles student registration for an event.
 */
app.post('/api/student/register', (req, res) => {
    const { event_id, user_id } = req.body;
    if (!event_id || !user_id) {
        return res.status(400).json({ error: 'Missing event ID or user ID' });
    }

    const sql = 'INSERT INTO event_registrations (event_id, user_id) VALUES (?, ?)';
    pool.query(sql, [event_id, user_id], (err, result) => {
        if (err) {
            console.error('Error registering for event:', err);
            // Check for duplicate entry error
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'You have already registered for this event.' });
            }
            return res.status(500).json({ error: 'Database insertion failed' });
        }
        res.status(201).json({ message: 'Registered successfully!' });
    });
});

/**
 * POST /api/student/attendance
 * Records student attendance for an event.
 */
app.post('/api/student/attendance', (req, res) => {
    const { event_id, user_id } = req.body;
    if (!event_id || !user_id) {
        return res.status(400).json({ error: 'Missing event ID or user ID' });
    }

    const sql = 'INSERT INTO event_attendance (event_id, user_id) VALUES (?, ?)';
    pool.query(sql, [event_id, user_id], (err, result) => {
        if (err) {
            console.error('Error recording attendance:', err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'Attendance already marked for this event.' });
            }
            return res.status(500).json({ error: 'Database insertion failed' });
        }
        res.status(201).json({ message: 'Attendance marked successfully!' });
    });
});

/**
 * POST /api/student/feedback
 * Records student feedback for an event.
 */
app.post('/api/student/feedback', (req, res) => {
    const { event_id, user_id, rating, comment } = req.body;
    if (!event_id || !user_id || !rating) {
        return res.status(400).json({ error: 'Missing event ID, user ID, or rating' });
    }

    const sql = 'INSERT INTO event_feedback (event_id, user_id, rating, comment) VALUES (?, ?, ?, ?)';
    pool.query(sql, [event_id, user_id, rating, comment], (err, result) => {
        if (err) {
            console.error('Error submitting feedback:', err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'You have already submitted feedback for this event.' });
            }
            return res.status(500).json({ error: 'Database insertion failed' });
        }
        res.status(201).json({ message: 'Feedback submitted successfully!' });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
