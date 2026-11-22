require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const db = require("./db"); // Load database so it initializes

// Middleware
app.use(cors());
app.use(express.json());

// 1. Base URL API Guide
app.get('/', (req, res) => {
    res.send(`
    <html>
      <head><title>Activity 7 API Guide</title></head>
      <body style="font-family: sans-serif; padding: 20px;">
        <h1>Activity 7 Backend API</h1>
        <p><strong>Student Number:</strong>[202505267]</p>
        <p><strong>System:</strong> Campus Maintenance Request System</p>
        <p><strong>Base URL:</strong> ${req.protocol}://${req.get('host')}</p>
        
        <h2>Available Routes</h2>
        <ul>
          <li><a href="/health">/health</a> - Check database connection</li>
          <li><a href="/api/records">/api/records</a> - GET all records</li>
        </ul>

        <h2>Data Fields & Rules</h2>
        <ul>
          <li><strong>title:</strong> 3 to 80 characters</li>
          <li><strong>category:</strong> 2 to 40 characters</li>
          <li><strong>description:</strong> 5 to 300 characters</li>
          <li><strong>status:</strong> Pending, In progress, Completed</li>
        </ul>

        <h3>Valid POST / PUT JSON Body:</h3>
        <pre style="background: #eee; padding: 10px;">
{
  "title": "Broken classroom light",
  "category": "Electrical",
  "description": "The light in Room B12 does not switch on.",
  "status": "Pending"
}
        </pre>
        <p>Note: Idle services may take a moment to start.</p>
      </body>
    </html>
  `);
});

// 2. Health Check
app.get('/health', (req, res) => {
    try {
        db.prepare('SELECT 1').get(); // Check db
        res.status(200).json({ status: 'ok', database: 'connected' });
    } catch (error) {
        res.status(503).json({ message: 'Database connection failed.' });
    }
});

// 3. Mount Record Router
app.use("/api/records", require("./routes/records"));

// 4. Unknown Routes (404)
app.use((req, res) => {
    res.status(404).json({ message: "Route not found." });
});

// 5. Error Handler (400 for JSON syntax, 500 for server errors)
app.use((err, req, res, next) => {
    // Malformed JSON
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ message: "Malformed JSON payload." });
    }
    console.error(err.stack);
    res.status(500).json({ message: "Internal server error." });
});

// Start Server
// Export the app for Vercel
module.exports = app;

// This part allows you to still run it locally
if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 3000;
    app.listen(port, "0.0.0.0", () => {
        console.log(`Server listening on port ${port}`);
    });
}