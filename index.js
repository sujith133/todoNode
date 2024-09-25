const express = require('express');
const cors = require('cors'); 
const db = require('./database');
const { v4: uuidv4 } = require('uuid');
const app = express();
const port = 3000; 

app.use(cors());  
app.use(express.json());

// login  user
app.post('/userlogin', (req, res) => {
  const { name, password } = req.body;

  db.get(`SELECT id FROM USERS WHERE name = ? AND password = ?`, [name, password], (err, row) => {
    if (err) {
      console.error('SQL Error:', err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (row) {
      res.json({ message: 'User authenticated', userId: row.id });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});

// get user tasks
app.post('/gettasks', (req, res) => {
  const { id } = req.body; 
  console.log('Fetching tasks for user ID:', id); 

  db.all(`SELECT id, userId, name, brief, state FROM tasks WHERE userId = ?`, [id], (err, rows) => {
    if (err) {
      console.error('SQL Error:', err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (rows.length > 0) {
      res.json({ message: 'Tasks retrieved successfully', tasks: rows });
    } else {
      res.status(404).json({ error: 'No tasks found for this user' });
    }
  });
});
// delete task
app.delete('/deletetask', (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Task ID is required' });
  }

  db.run(`DELETE FROM tasks WHERE id = ?`, [id], function (err) {
    if (err) {
      console.error('SQL Error:', err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  });
});

// update task state
app.post('/updatetaskstate', (req, res) => {
  const { id, state } = req.body;

  if (!id || !state) {
    return res.status(400).json({ error: 'Task ID and state are required' });
  }

  db.run(`UPDATE tasks SET state = ? WHERE id = ?`, [state, id], function (err) {
    if (err) {
      console.error('SQL Error:', err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task state updated successfully' });
  });
});



// get username
app.post('/username', (req, res) => {
  const { id } = req.body;

  db.get(`SELECT name FROM USERS WHERE id = ?`, [id], (err, row) => {
    if (err) {
      console.error('SQL Error:', err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (row) {
      res.json({ message: 'User Name', name: row.name });
    } else {
      res.status(404).json({ error: 'Name not found' });
    }
  });
});

// get user details
app.post('/userdetails', (req, res) => {
  const { id } = req.body;

  db.get(`SELECT name, email, password FROM USERS WHERE id = ?`, [id], (err, row) => {
    if (err) {
      console.error('SQL Error:', err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (row) {
      res.json({
        message: 'User details retrieved successfully',
        name: row.name,
        email: row.email,
        password: row.password, // Consider encrypting or excluding the password for security reasons
      });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });
});
// update user
app.post('/updateUser', (req, res) => {
  const { id, name, email, password } = req.body;

  if (!id || !name || !email) {
    return res.status(400).json({ error: 'ID, name, and email are required' });
  }

  db.run(
    `UPDATE USERS SET name = ?, email = ?, password = ? WHERE id = ?`,
    [name, email, password, id],
    function (err) {
      if (err) {
        console.error('SQL Error:', err.message);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ message: 'User details updated successfully' });
    }
  );
});


// create profile
app.post('/users', (req, res) => {
  const { name, email, password } = req.body;
  const id = uuidv4();  
  console.log(name, email, password);
  db.run(`INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)`, [id, name, email, password], function (err) {
    if (err) {
        console.error('SQL Error:', err.message); 
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'User added', userId: id });

  });
});


// create task
app.post('/addtask', (req, res) => {
  const { id, task, taskBrief } = req.body;
  const taskId = uuidv4(); 
  console.log(id, task, taskBrief);

  db.run(`INSERT INTO tasks (id, userid, name, brief, state) VALUES (?, ?, ?, ?, ?)`, [taskId, id, task, taskBrief, 'Pending'], function (err) {
    if (err) {
      console.error('SQL Error:', err.message); 
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Task added', userId: id, taskId: taskId });
  });
});








app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
