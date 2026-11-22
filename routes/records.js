const router = require('express').Router();
const db = require('../db');

// Validation Helper Function
function validateRecord(body) {
  const { title, category, description, status } = body;
  if (typeof title !== 'string' || title.trim().length < 3 || title.trim().length > 80) 
    return "Title must have 3 to 80 characters.";
  if (typeof category !== 'string' || category.trim().length < 2 || category.trim().length > 40) 
    return "Category must have 2 to 40 characters.";
  if (typeof description !== 'string' || description.trim().length < 5 || description.trim().length > 300) 
    return "Description must have 5 to 300 characters.";
  
  const allowed = ['Pending', 'In progress', 'Completed'];
  if (!allowed.includes(status)) 
    return "Invalid status. Must be Pending, In progress, or Completed.";
  
  return null; // Valid
}

// 1. GET All Records
router.get('/', (req, res, next) => {
  try {
    const rows = db.prepare('SELECT id, title, category, description, status FROM records ORDER BY id').all();
    res.status(200).json(rows);
  } catch (error) { next(error); }
});

// 2. GET One Record
router.get('/:id', (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) return res.status(400).json({ message: "Invalid ID." });

    const row = db.prepare('SELECT * FROM records WHERE id = ?').get(id);
    if (!row) return res.status(404).json({ message: "Record not found." });
    res.status(200).json(row);
  } catch (error) { next(error); }
});

// 3. POST Create Record
router.post('/', (req, res, next) => {
  try {
    const err = validateRecord(req.body);
    if (err) return res.status(400).json({ message: err });

    const { title, category, description, status } = req.body;
    const info = db.prepare('INSERT INTO records (title, category, description, status) VALUES (?, ?, ?, ?)')
      .run(title.trim(), category.trim(), description.trim(), status);
    
    const newRecord = db.prepare('SELECT * FROM records WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(newRecord);
  } catch (error) { next(error); }
});

// 4. PUT Update Record
router.put('/:id', (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) return res.status(400).json({ message: "Invalid ID." });

    const err = validateRecord(req.body);
    if (err) return res.status(400).json({ message: err });

    const { title, category, description, status } = req.body;
    const info = db.prepare('UPDATE records SET title = ?, category = ?, description = ?, status = ? WHERE id = ?')
      .run(title.trim(), category.trim(), description.trim(), status, id);

    if (info.changes === 0) return res.status(404).json({ message: "Record not found." });

    const updated = db.prepare('SELECT * FROM records WHERE id = ?').get(id);
    res.status(200).json(updated);
  } catch (error) { next(error); }
});

// 5. DELETE Record
router.delete('/:id', (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) return res.status(400).json({ message: "Invalid ID." });

    const info = db.prepare('DELETE FROM records WHERE id = ?').run(id);
    if (info.changes === 0) return res.status(404).json({ message: "Record not found." });

    res.status(200).json({ message: "Record deleted." });
  } catch (error) { next(error); }
});

module.exports = router; 