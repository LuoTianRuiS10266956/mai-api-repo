const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory SQLite DB
const db = new sqlite3.Database(':memory:');

// Initialize tables and data
db.serialize(() => {
  db.run(`
    CREATE TABLE Students (
      StudentID TEXT PRIMARY KEY,
      StudentName TEXT
    )
  `);
  db.run(`
    CREATE TABLE ActiveLoans (
      LoanID INTEGER PRIMARY KEY AUTOINCREMENT,
      StudentID TEXT NOT NULL,
      BookTitle TEXT,
      DueDate DATE,
      FOREIGN KEY(StudentID) REFERENCES Students(StudentID)
    )
  `);

  db.run(`INSERT INTO Students VALUES ('S12345678A', 'Eden Wong')`);
  db.run(`INSERT INTO Students VALUES ('S12345678B', 'Jayden Koh')`);
  db.run(`INSERT INTO Students VALUES ('S09876543C', 'Kua Zi Liang')`);

  db.run(`INSERT INTO ActiveLoans (StudentID, BookTitle, DueDate)
          VALUES ('S12345678A', 'The Great Gatsby', '2025-06-12')`);
  db.run(`INSERT INTO ActiveLoans (StudentID, BookTitle, DueDate)
          VALUES ('S12345678A', 'Data Structures in Python', '2025-06-15')`);
  db.run(`INSERT INTO ActiveLoans (StudentID, BookTitle, DueDate)
          VALUES ('S12345678B', '1984', '2025-06-10')`);
});

// 🟢 GET: Get all loans for a student
app.get('/students/:studentId/loans', (req, res) => {
  const studentId = req.params.studentId;
  db.all(
    `SELECT LoanID, BookTitle, DueDate FROM ActiveLoans WHERE StudentID = ?`,
    [studentId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ loans: rows });
    }
  );
});

// 🟢 PATCH: Renew a loan by 2 weeks
app.patch('/loans/:loanId/renew', (req, res) => {
  const loanId = req.params.loanId;
  db.run(
    `UPDATE ActiveLoans SET DueDate = DATE(DueDate, '+14 day') WHERE LoanID = ?`,
    [loanId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0)
        return res.status(404).json({ error: 'Loan not found' });
      res.json({ message: 'Due date extended by 2 weeks' });
    }
  );
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
