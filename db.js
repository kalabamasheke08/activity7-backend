const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'database.db'));

// 1. Create the table
db.exec(`CREATE TABLE IF NOT EXISTS records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL
)`);

// 2. Add seed data if the database is empty
const count = db.prepare('SELECT COUNT(*) as count FROM records').get();
if (count.count === 0) {
  const insert = db.prepare('INSERT INTO records (title, category, description, status) VALUES (?, ?, ?, ?)');
  const sample = [
    ['Broken light', 'Electrical', 'Room B12 light not working.', 'Pending'],
    ['Leaking tap', 'Plumbing', 'Tap in kitchen dripping.', 'In progress'],
    ['Projector issue', 'IT', 'Projector in Lecture Hall A is blurry.', 'Pending'],
    ['Broken chair', 'Furniture', 'Chair in Room 4 has a broken leg.', 'Completed'],
    ['Wi-Fi down', 'IT', 'No internet connection in the library.', 'In progress'],
    ['AC not cooling', 'HVAC', 'Air conditioner in Room 12 is warm.', 'Pending'],
    ['Door lock stuck', 'Security', 'Main entrance door lock is jamming.', 'Completed'],
    ['Whiteboard marker', 'Supplies', 'No working markers in Room 3.', 'Pending']
  ];
  
  // Insert all 8 records
  sample.forEach(r => insert.run(r[0], r[1], r[2], r[3]));
  console.log("Database seeded with 8 records.");
}

module.exports = db; 